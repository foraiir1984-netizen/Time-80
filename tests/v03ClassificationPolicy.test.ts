import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityEditor } from "../src/components/ActivityEditor";
import { CheckInScreen } from "../src/screens/CheckInScreen";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { emitFocus } from "./navigation.mjs";
import { emitAppState } from "./react-native.mjs";
import { dayScopeFor } from "../src/services/dayScopeService";
import { test } from "node:test";
import assert from "node:assert/strict";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import {
  saveActivity,
  getActivityEditorSnapshot,
  setActivityDefault,
} from "../src/services/classificationService";
import {
  commitCheckIn,
  getCheckInContext,
  undoEntryEdit,
} from "../src/services/checkInService";
import { ICON_SET } from "../src/icons/iconModel";

// The same fixture/commands run against delivery 50a5499 and the final source.
// No UI manual selection, no policy override, and real SQLite/service modules.
test("unchanged classification policy: historical default, same activity, changed activity, Undo, revision and duplicate guards", async () => {
  await initDatabase();
  const tx = await db();
  const first = await saveActivity(null, "policy first", "📚", "1", null);
  const second = await saveActivity(null, "policy second", "💼", "2", null);
  const input = {
    activityId: first,
    periodStart: "2026-01-01T10:00:00.000Z",
    periodEnd: "2026-01-01T10:30:00.000Z",
    source: "manual" as const,
    expectedEntry: null,
  };
  const fresh = await commitCheckIn(input);
  assert.equal(fresh.status, "saved");
  assert.equal(fresh.undo, null);
  const historical = await getCheckInContext(input.periodStart);
  assert.equal(historical.classification!.code, "1");
  assert.equal(historical.classification!.method, "inherited_default");
  const snapshot = await getActivityEditorSnapshot(first);
  await saveActivity(
    first,
    "policy renamed",
    { kind: "selectAsset", set: ICON_SET, key: "study" },
    snapshot.category!.code,
    snapshot.category!.revision,
    snapshot.icon,
  );
  assert.deepEqual(
    (await getActivityEditorSnapshot(first)).category,
    snapshot.category,
  );
  assert.deepEqual(
    (await getCheckInContext(input.periodStart)).classification,
    historical.classification,
  );
  await setActivityDefault(first, "3", snapshot.category!.revision);
  const rows = await tx.getAllAsync(
    "SELECT * FROM entry_classifications ORDER BY id",
  );
  const same = await commitCheckIn({
    ...input,
    expectedEntry: historical.entry,
    expectedClassificationRevision: historical.classification!.revision,
  });
  assert.equal(same.status, "unchanged");
  assert.equal(same.undo, null);
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM entry_classifications ORDER BY id"),
    rows,
  );
  const changed = await commitCheckIn({
    ...input,
    activityId: second,
    expectedEntry: historical.entry,
    expectedClassificationRevision: historical.classification!.revision,
  });
  assert.equal(changed.status, "saved");
  const after = await getCheckInContext(input.periodStart);
  assert.equal(after.entry!.activity_id, second);
  assert.equal(after.classification!.code, "2");
  assert.equal(after.classification!.source_activity_id, second);
  assert.equal(
    after.classification!.revision,
    historical.classification!.revision + 1,
  );
  assert.deepEqual(after.context, historical.context);
  await assert.rejects(
    commitCheckIn({
      ...input,
      expectedEntry: after.entry,
      expectedClassificationRevision: historical.classification!.revision,
    }),
    /دسته تغییر/,
  );
  assert.deepEqual(await getCheckInContext(input.periodStart), after);
  await undoEntryEdit(changed.undo!);
  const undone = await getCheckInContext(input.periodStart);
  assert.equal(undone.entry!.activity_id, first);
  assert.equal(undone.classification!.code, "1");
  assert.equal(undone.classification!.source_activity_id, first);
  assert.equal(
    undone.classification!.default_revision,
    historical.classification!.default_revision,
  );
  assert.equal(undone.classification!.revision, 3);
  const beforeReject = await tx.getAllAsync(
    "SELECT * FROM time_entries ORDER BY id",
  );
  await assert.rejects(commitCheckIn(input), /ثبت تغییر/);
  await assert.rejects(
    commitCheckIn({
      ...input,
      periodStart: "2026-01-01T10:15:00.000Z",
      periodEnd: "2026-01-01T10:45:00.000Z",
    }),
    /هم‌پوشانی/,
  );
  await assert.rejects(
    commitCheckIn({ ...input, periodStart: "invalid" }),
    /معتبر/,
  );
  await assert.rejects(
    undoEntryEdit({ ...changed.undo!, deadline: 0 }),
    /مهلت/,
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    beforeReject,
  );
});

// Baseline-compatible UI read contract also captures the pre-existing report
// preference persistence. This task must not introduce classification writes.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
async function render(element: React.ReactElement) {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(element);
    for (let i = 0; i < 30; i++)
      await new Promise<void>((resolve) => setImmediate(resolve));
  });
  return r;
}
async function changeCount() {
  return (await (
    await db()
  ).getFirstAsync<{ n: number }>("SELECT total_changes() n"))!.n;
}
test("baseline UI read policy: editor/CheckIn entry and refocus write nothing; report persists only existing two preferences", async () => {
  const id = await saveActivity(null, "read-only fixture", "📚", "1", null);
  const snapshot = await getActivityEditorSnapshot(id);
  let before = await changeCount();
  const editor = await render(
    React.createElement(ActivityEditor, {
      activity: snapshot.activity,
      onClose: () => {},
      onSaved: () => {},
    }),
  );
  assert.equal(await changeCount(), before);
  await act(async () => editor.unmount());
  const start = "2026-01-09T10:00:00.000Z";
  before = await changeCount();
  const checkIn = await render(
    React.createElement(CheckInScreen, {
      route: {
        params: {
          start,
          end: "2026-01-09T10:30:00.000Z",
          source: "manual",
          dayScope: dayScopeFor(start),
        },
      },
      navigation: { replace: () => {}, navigate: () => {}, goBack: () => {} },
    }),
  );
  await act(async () => {
    emitFocus(false);
    emitFocus(true);
    emitAppState("active");
    for (let i = 0; i < 30; i++)
      await new Promise<void>((resolve) => setImmediate(resolve));
  });
  assert.equal(await changeCount(), before);
  await act(async () => checkIn.unmount());
  const tx = await db();
  const categories = await tx.getAllAsync(
    "SELECT * FROM entry_classifications ORDER BY id",
  );
  const defaults = await tx.getAllAsync(
    "SELECT * FROM activity_classification_defaults ORDER BY activity_id",
  );
  before = await changeCount();
  const report = await render(React.createElement(InsightsScreen));
  assert.equal(await changeCount(), before + 2);
  await act(async () => {
    emitFocus(false);
    emitFocus(true);
    emitAppState("active");
    for (let i = 0; i < 30; i++)
      await new Promise<void>((resolve) => setImmediate(resolve));
  });
  assert.equal(await changeCount(), before + 2);
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM entry_classifications ORDER BY id"),
    categories,
  );
  assert.deepEqual(
    await tx.getAllAsync(
      "SELECT * FROM activity_classification_defaults ORDER BY activity_id",
    ),
    defaults,
  );
  await act(async () => report.unmount());
});
