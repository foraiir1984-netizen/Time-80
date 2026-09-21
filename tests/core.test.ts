import { test } from "node:test";
import assert from "node:assert/strict";
import { initDatabase, getSettings } from "../src/db/database";
import { db, transaction } from "../src/db/connection";
import { detectSchema, runMigrations } from "../src/db/migrations";
import {
  saveActivity,
  setActivityDefault,
} from "../src/services/classificationService";
import {
  commitCheckIn,
  getCheckInContext,
  undoEntryEdit,
} from "../src/services/checkInService";
import { setMeta } from "../src/db/metaRepository";
import { ensureSlotHorizon } from "../src/services/slotService";
import { applySettingsPatch } from "../src/services/settingsService";
import { aggregate } from "../src/services/reportService";
import { generateSlots } from "../src/utils/slots";
import { resolveReportRange } from "../src/utils/reportPeriods";
import { notificationPlan } from "../src/notifications/plan";
import type { Slot } from "../src/types/domain";

test("baseline, immutable snapshots, conflicts, undo and non-destructive startup", async () => {
  await initDatabase();
  const conn = await db();
  assert.equal(await detectSchema(conn), "current");
  assert.equal(
    (
      await conn.getFirstAsync<{ n: number }>(
        "SELECT COUNT(*) n FROM classification_nodes",
      )
    )?.n,
    230,
  );
  const id = await saveActivity(null, "آزمون", "📚", "1", null);
  const start = "2026-01-01T10:00:00.000Z",
    end = "2026-01-01T10:30:00.000Z";
  const input = {
    activityId: id,
    periodStart: start,
    periodEnd: end,
    source: "manual" as const,
    expectedEntry: null,
  };
  await commitCheckIn(input);
  let c = await getCheckInContext(start);
  assert.equal(c.classification?.source_activity_id, id);
  assert.equal(c.classification?.code, "1");
  const originalContext = c.context;
  await setActivityDefault(id, "2", 1);
  assert.equal((await getCheckInContext(start)).classification?.code, "1");
  await assert.rejects(commitCheckIn(input), /تغییر/);
  await assert.rejects(
    commitCheckIn({
      ...input,
      periodStart: "2026-01-01T10:15:00.000Z",
      periodEnd: "2026-01-01T10:45:00.000Z",
    }),
    /هم‌پوشانی/,
  );
  const revision = c.classification!.revision;
  const edited = await commitCheckIn({
    ...input,
    expectedEntry: c.entry,
    expectedClassificationRevision: revision,
    classificationSelection: { mode: "explicit", code: "3" },
  });
  assert.ok(edited.undo);
  assert.deepEqual((await getCheckInContext(start)).context, originalContext);
  await assert.rejects(
    commitCheckIn({
      ...input,
      expectedEntry: c.entry,
      expectedClassificationRevision: revision,
      classificationSelection: { mode: "explicit", code: "4" },
    }),
    /دسته/,
  );
  await undoEntryEdit(edited.undo!);
  c = await getCheckInContext(start);
  assert.equal(c.classification?.code, "1");
  assert.equal(c.classification?.revision, 3);
  assert.deepEqual(c.context, originalContext);
  const before = await conn.getAllAsync("SELECT * FROM time_entries");
  await runMigrations();
  assert.deepEqual(
    await conn.getAllAsync("SELECT * FROM time_entries"),
    before,
  );
  const count = (await conn.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) n FROM activities",
  ))!.n;
  await assert.rejects(
    saveActivity(null, "rollback", "x", "does-not-exist", null),
  );
  assert.equal(
    (await conn.getFirstAsync<{ n: number }>(
      "SELECT COUNT(*) n FROM activities",
    ))!.n,
    count,
  );
  await conn.execAsync("DROP INDEX idx_entry_classification_current");
  assert.equal(await detectSchema(conn), "unsupported");
  await assert.rejects(runMigrations());
  assert.deepEqual(
    await conn.getAllAsync("SELECT * FROM time_entries"),
    before,
  );
  await conn.execAsync(
    "CREATE UNIQUE INDEX idx_entry_classification_current\n  ON entry_classifications(entry_id,scheme_id) WHERE is_current=1",
  );
});

test("interval transition preserves current slot and anchors subsequent slots", async () => {
  const conn = await db();
  await transaction(async (tx) => {
    await tx.runAsync(
      "UPDATE settings SET day_start='08:00',day_end='23:00',interval_minutes=30,notification_enabled=1",
    );
    await setMeta(tx, "slot_horizon_end", "2026-02-01T00:00:00.000Z");
    await setMeta(tx, "schedule_timezone", "UTC");
  });
  const now = new Date("2026-02-01T10:15:00.000Z");
  await ensureSlotHorizon(now);
  await applySettingsPatch({ interval_minutes: 60 }, now);
  const slots = await conn.getAllAsync<Slot>(
    "SELECT * FROM expected_slots WHERE period_start>='2026-02-01T10:00:00.000Z' AND period_start<'2026-02-01T12:00:00.000Z' ORDER BY period_start",
  );
  assert.deepEqual(
    slots.map((s) => [
      s.period_start.slice(11, 16),
      s.period_end.slice(11, 16),
    ]),
    [
      ["10:00", "10:30"],
      ["10:30", "11:30"],
      ["11:30", "12:30"],
    ],
  );
  const s = await getSettings();
  const a = {
    effectiveAt: "2026-02-01T10:30:00.000Z",
    anchorLocalDate: "2026-02-01",
    anchorLocalMinute: 630,
    timezone: "UTC",
  };
  const plan = notificationPlan(s, a, now, slots[0]!);
  assert.ok(plan.some((p) => p.date === "2026-02-01T10:30:00.000Z"));
  assert.ok(plan.some((p) => p.hour === 11 && p.minute === 30));
  assert.ok(
    plan
      .filter((p) => !p.date)
      .every(
        (p) =>
          Number(p.data.time80NotBefore) === +new Date("2026-02-01T11:30:00Z"),
      ),
  );
  const future = generateSlots(
    s,
    new Date("2026-04-01T00:00:00Z"),
    new Date("2026-04-02T00:00:00Z"),
    a,
    "UTC",
  );
  assert.equal(future[0]!.period_start.slice(11, 16), "08:30");
});

test("report proportional clipping, unmapped time, empty coverage and calendar periods", () => {
  const e = {
    id: 1,
    activity_id: 1,
    period_start: "2026-01-01T23:30:00Z",
    period_end: "2026-01-02T00:30:00Z",
    duration_minutes: 60,
    status: "logged" as const,
    recorded_at: "2026-01-02T00:30:00Z",
    source: "manual" as const,
  };
  const r = aggregate(
    [e],
    [],
    [],
    "2026-01-02T00:00:00Z",
    "2026-01-03T00:00:00Z",
    "UTC",
    Date.now(),
  );
  assert.equal(r.total, 30);
  assert.equal(r.unmappedMinutes, 30);
  assert.equal(r.coverage, null);
  assert.deepEqual(r.daily, [["2026-01-02", 30]]);
  const range = resolveReportRange(
    { mode: "month", offset: 0, calendar: "persian", weekStart: 7 },
    "2025-01-01T00:00:00Z",
    new Date("2026-03-22T12:00:00Z"),
    "Asia/Tehran",
  );
  assert.equal(range.start, "2026-03-20T20:30:00.000Z");
  const dst = resolveReportRange(
    { mode: "day", offset: 0, calendar: "gregory", weekStart: 1 },
    "2025-01-01T00:00:00Z",
    new Date("2026-03-08T18:00:00Z"),
    "America/New_York",
  );
  assert.equal((+new Date(dst.end) - +new Date(dst.start)) / 3600000, 23);
});
