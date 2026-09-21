import { getMeta } from "../db/metaRepository";
import { db, transaction } from "../db/connection";
import type {
  SQL,
  TimeEntry,
  Assignment,
  TimeContext,
  EntryContext,
  Selection,
} from "../types/domain";
import {
  resolveEntryClassification,
  assignEntryClassification,
} from "../db/classificationRepository";
import {
  createEntryContext,
  confirmEntryTimeContext,
} from "../db/entryContextRepository";
import { SCHEME } from "./classificationDataset";
const snapshot = (entry: TimeEntry | null) =>
  entry
    ? JSON.stringify([
        entry.id,
        entry.activity_id,
        entry.period_start,
        entry.period_end,
        entry.duration_minutes,
        entry.recorded_at,
        entry.source,
        entry.status,
      ])
    : "null";
async function context(tx: SQL, start: string): Promise<EntryContext> {
  const entry = await tx.getFirstAsync<TimeEntry>(
    "SELECT * FROM time_entries WHERE period_start=?",
    start,
  );
  return {
    entry,
    classification: entry
      ? await resolveEntryClassification(tx, entry.id)
      : null,
    context: entry
      ? await tx.getFirstAsync<TimeContext>(
          "SELECT * FROM entry_time_context WHERE entry_id=?",
          entry.id,
        )
      : null,
  };
}
export const getCheckInContext = async (start: string) =>
  context(await db(), start);
export async function assertNoEntryOverlap(
  tx: SQL,
  start: string,
  end: string,
  excludeId = -1,
) {
  if (
    await tx.getFirstAsync(
      "SELECT id FROM time_entries WHERE period_start<? AND period_end>? AND status='logged' AND id<>?",
      end,
      start,
      excludeId,
    )
  )
    throw Error("این زمان با ثبت دیگری هم‌پوشانی دارد");
}
export type CommitInput = {
  activityId: number;
  periodStart: string;
  periodEnd: string;
  source: "manual" | "notification";
  expectedEntry: TimeEntry | null;
  classificationSelection?: Selection;
  expectedClassificationRevision?: number | null;
};
export type UndoToken = {
  before: EntryContext;
  after: EntryContext;
  deadline: number;
};
export async function commitCheckIn(input: CommitInput) {
  return transaction(async (tx) => {
    if ((await getMeta(tx, "active_classification_scheme_id")) !== SCHEME)
      throw Error("طرح طبقه‌بندی فعال نامعتبر است");
    const start = new Date(input.periodStart),
      end = new Date(input.periodEnd);
    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end <= start ||
      end > new Date()
    )
      throw Error("بازه باید معتبر و پایان‌یافته باشد");
    const before = await context(tx, start.toISOString());
    if (snapshot(before.entry) !== snapshot(input.expectedEntry))
      throw Error("ثبت تغییر کرده؛ صفحه را تازه کن");
    const changedActivity = before.entry?.activity_id !== input.activityId;
    const changesClass = changedActivity || !!input.classificationSelection;
    if (
      changesClass &&
      before.entry &&
      (input.expectedClassificationRevision === undefined ||
        (before.classification?.revision ?? null) !==
          input.expectedClassificationRevision)
    )
      throw Error("دسته تغییر کرده؛ دوباره باز کن");
    if (
      !(await tx.getFirstAsync(
        "SELECT id FROM activities WHERE id=? AND is_archived=0",
        input.activityId,
      )) &&
      changedActivity
    )
      throw Error("فعالیت در دسترس نیست");
    if (before.entry && before.entry.period_end !== end.toISOString())
      throw Error("زمان ثبت قبلی قابل تغییر نیست");
    const now = new Date().toISOString();
    let id = before.entry?.id;
    if (!before.entry) {
      await assertNoEntryOverlap(tx, start.toISOString(), end.toISOString());
      id = (
        await tx.runAsync(
          "INSERT INTO time_entries(activity_id,period_start,period_end,duration_minutes,recorded_at,source,status) VALUES(?,?,?,?,?,?,'logged')",
          input.activityId,
          start.toISOString(),
          end.toISOString(),
          Math.round((+end - +start) / 60000),
          now,
          input.source,
        )
      ).lastInsertRowId;
      await createEntryContext(tx, id, start.toISOString());
    } else if (changedActivity || before.entry.status !== "logged")
      await tx.runAsync(
        "UPDATE time_entries SET activity_id=?,recorded_at=?,source=?,status='logged' WHERE id=?",
        input.activityId,
        now,
        input.source,
        id!,
      );
    if (changesClass || !before.classification) {
      const selection = input.classificationSelection ?? { mode: "inherit" };
      let value: Pick<
        Assignment,
        "code" | "method" | "source_activity_id" | "default_revision"
      > = {
        code: null,
        method: "unmapped",
        source_activity_id: null,
        default_revision: null,
      };
      if (selection.mode === "explicit" && selection.code)
        value = {
          ...value,
          code: selection.code,
          method: before.entry ? "user_reclassified" : "user_selected",
        };
      if (selection.mode === "inherit") {
        const d = await tx.getFirstAsync<{
          code: string | null;
          revision: number;
        }>(
          "SELECT code,revision FROM activity_classification_defaults WHERE activity_id=? AND scheme_id=?",
          input.activityId,
          SCHEME,
        );
        if (d?.code)
          value = {
            code: d.code,
            method: "inherited_default",
            source_activity_id: input.activityId,
            default_revision: d.revision,
          };
      }
      await assignEntryClassification(
        tx,
        id!,
        before.classification?.revision ?? null,
        value,
        selection.mode === "explicit" && selection.code === null
          ? "explicit_clear"
          : null,
      );
    }
    await tx.runAsync(
      "UPDATE expected_slots SET state='pending',updated_at=? WHERE period_start=? AND state='skipped'",
      now,
      start.toISOString(),
    );
    const after = await context(tx, start.toISOString());
    const changed =
      snapshot(before.entry) !== snapshot(after.entry) ||
      before.classification?.id !== after.classification?.id;
    return {
      status: changed ? "saved" : "unchanged",
      undo:
        before.entry && changed
          ? ({
              before,
              after,
              deadline: performance.now() + 10000,
            } as UndoToken)
          : null,
    };
  });
}
export async function undoEntryEdit(token: UndoToken) {
  if (performance.now() > token.deadline) throw Error("مهلت بازگردانی تمام شد");
  return transaction(async (tx) => {
    if (performance.now() > token.deadline) throw Error("مهلت تمام شد");
    const current = await context(tx, token.after.entry!.period_start);
    if (
      snapshot(current.entry) !== snapshot(token.after.entry) ||
      current.classification?.revision !== token.after.classification?.revision
    )
      throw Error("ثبت دوباره تغییر کرده؛ بازگردانی ممکن نیست");
    const e = token.before.entry!;
    await tx.runAsync(
      "UPDATE time_entries SET activity_id=?,recorded_at=?,source=?,status=? WHERE id=?",
      e.activity_id,
      e.recorded_at,
      e.source,
      e.status,
      e.id,
    );
    if (
      token.before.classification &&
      token.before.classification.id !== token.after.classification?.id
    )
      await assignEntryClassification(
        tx,
        e.id,
        current.classification?.revision ?? null,
        token.before.classification,
        "undo",
      );
  });
}

export async function confirmTimeContext(expected: EntryContext, zone: string) {
  return transaction(async (tx) => {
    if (!expected.entry) throw Error("ابتدا بازه را ثبت کن");
    const current = await context(tx, expected.entry.period_start);
    if (snapshot(current.entry) !== snapshot(expected.entry))
      throw Error("ثبت تغییر کرده؛ صفحه را تازه کن");
    await confirmEntryTimeContext(
      tx,
      expected.entry.id,
      expected.context,
      zone.trim(),
    );
  });
}
