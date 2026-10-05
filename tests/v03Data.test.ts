import { test } from "node:test";
import * as SQLite from "expo-sqlite";
import { createPreMigrationBackup } from "../src/db/backup";
import assert from "node:assert/strict";
import { initDatabase, getActivities } from "../src/db/database";
import { db } from "../src/db/connection";
import {
  saveActivity,
  getActivityEditorSnapshot,
} from "../src/services/classificationService";
import {
  getRankedActivities,
  archiveActivity,
  undoActivityArchive,
  restoreActivity,
} from "../src/services/activityService";
import { dayScopeFor, getDayRemaining } from "../src/services/dayScopeService";
import {
  resolveActivityIcon,
  ICON_SET,
  iconMetaKey,
} from "../src/icons/iconModel";
import { getMeta, setMeta } from "../src/db/metaRepository";
import {
  commitCheckIn,
  getCheckInContext,
} from "../src/services/checkInService";
import { getReport } from "../src/services/reportService";
import { detectSchema } from "../src/db/migrations";

const create = (name: string, raw = "✨") =>
  saveActivity(null, name, raw, null, null);
test("icon resolver preserves free-form legacy and unknown/malformed/binding-mismatched metadata without interpretation", () => {
  for (const raw of [
    "👨‍👩‍👦",
    "فارسی",
    "work",
    '{"v":1}',
    "time80-a-v1:work",
    " https://example.com ",
  ]) {
    assert.deepEqual(resolveActivityIcon(1, raw, null), {
      kind: "legacy",
      raw,
      unresolved: false,
    });
    for (const meta of [
      "oops",
      '{"v":2}',
      JSON.stringify({
        v: 1,
        kind: "asset",
        set: ICON_SET,
        key: "work",
        legacyValue: "mismatch",
      }),
    ])
      assert.equal(resolveActivityIcon(1, raw, meta).kind, "legacy");
  }
  assert.throws(() => iconMetaKey(0));
  assert.throws(() => iconMetaKey(1.2));
});
test("asset create/select, unknown keep, stale icon/default and transactional failures preserve schema 3 and raw legacy", async () => {
  await initDatabase();
  const tx = await db();
  const initial = await tx.getAllAsync(
    "SELECT * FROM sqlite_master ORDER BY name",
  );
  const id = await create("legacy", "👨‍👩‍👦");
  let s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    "asset",
    { kind: "selectAsset", set: ICON_SET, key: "work" },
    null,
    s.category!.revision,
    s.icon,
  );
  s = await getActivityEditorSnapshot(id);
  assert.equal(s.activity.icon, "👨‍👩‍👦");
  assert.equal(s.iconView.kind, "asset");
  const value = s.icon.metaRaw;
  await saveActivity(
    id,
    "rename",
    { kind: "keep" },
    null,
    s.category!.revision,
    s.icon,
  );
  assert.equal(await getMeta(tx, iconMetaKey(id)), value);
  await assert.rejects(
    saveActivity(id, "stale", { kind: "keep" }, null, s.category!.revision, {
      legacyRaw: "stale",
      metaRaw: value,
    }),
    /تغییر/,
  );
  await setMeta(tx, iconMetaKey(id), ' {"future": " untouched "} ');
  s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    "unknown",
    { kind: "keep" },
    null,
    s.category!.revision,
    s.icon,
  );
  assert.equal(await getMeta(tx, iconMetaKey(id)), s.icon.metaRaw);
  const before = await tx.getAllAsync("SELECT * FROM activities ORDER BY id"),
    metaBefore = await tx.getAllAsync("SELECT * FROM app_meta ORDER BY key");
  await assert.rejects(
    saveActivity(
      null,
      "rollback",
      { kind: "selectAsset", set: ICON_SET, key: "study" },
      "does-not-exist",
      null,
    ),
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM activities ORDER BY id"),
    before,
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM app_meta ORDER BY key"),
    metaBefore,
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM sqlite_master ORDER BY name"),
    initial,
  );
  assert.equal(await detectSchema(tx), "current");
});
test("archive Undo is bounded, rejects newer edits, and retains metadata/history; last active can be archived", async () => {
  const id = await create("archive");
  let s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    "archive",
    { kind: "selectAsset", set: ICON_SET, key: "rest" },
    null,
    s.category!.revision,
    s.icon,
  );
  const a = (await getActivities()).find((a) => a.id === id)!;
  const meta = await getMeta(await db(), iconMetaKey(id));
  const token = await archiveActivity(a);
  await undoActivityArchive(token);
  assert.equal(await getMeta(await db(), iconMetaKey(id)), meta);
  const again = await archiveActivity(
    (await getActivities()).find((a) => a.id === id)!,
  );
  s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    "new name",
    { kind: "keep" },
    null,
    s.category!.revision,
    s.icon,
  );
  await assert.rejects(undoActivityArchive(again), /دیگر/);
  await assert.rejects(undoActivityArchive({ ...again, deadline: 0 }), /دیگر/);
  assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 1);
  await assert.rejects(restoreActivity(a), /تغییر/);
  await restoreActivity((await getActivityEditorSnapshot(id)).activity);
  assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 0);
  assert.equal(await getMeta(await db(), iconMetaKey(id)), meta);
});
test("full-list ranking uses valid seven-calendar-day counts, stable ties and zero histories; ignores recording date/future/invalid", async () => {
  const tx = await db();
  await tx.runAsync("UPDATE activities SET is_archived=1");
  const a = await create("first"),
    b = await create("second"),
    c = await create("zero");
  const rows: [number, string, string][] = [
    [a, "2026-10-04T08:00:00.000Z", "2026-10-04T08:30:00.000Z"],
    [b, "2026-10-05T08:00:00.000Z", "2026-10-05T08:30:00.000Z"],
    [b, "bad", "bad"],
    [b, "2026-10-05T08:31:00.000Z", "2026-10-05T12:00:00.000Z"],
    [b, "2026-09-27T08:00:00.000Z", "2026-09-27T08:30:00.000Z"],
  ];
  for (const [id, start, end] of rows)
    await tx.runAsync(
      "INSERT INTO time_entries(activity_id,period_start,period_end,duration_minutes,recorded_at,source,status) VALUES(?,?,?,30,'2026-10-05T09:00:00Z','manual','logged')",
      id,
      start,
      end,
    );
  const rank = await getRankedActivities(new Date("2026-10-05T09:00:00Z"));
  assert.deepEqual(
    rank.allActivities.map((a) => a.id),
    [a, b, c],
  );
  assert.deepEqual(
    (await getActivities()).map((a) => a.id),
    [a, b, c],
  );
});
test("DayScope uses calendar midnights including DST and start-day attribution", () => {
  const spring = dayScopeFor("2026-03-08T12:00:00Z", "America/New_York"),
    fall = dayScopeFor("2026-11-01T12:00:00Z", "America/New_York");
  assert.equal(
    +new Date(spring.nextDayStartUtc) - +new Date(spring.dayStartUtc),
    23 * 3600000,
  );
  assert.equal(
    +new Date(fall.nextDayStartUtc) - +new Date(fall.dayStartUtc),
    25 * 3600000,
  );
  assert.equal(
    dayScopeFor("2026-09-29T20:15:00Z", "Asia/Tehran").localDate,
    "2026-09-29",
  );
});
test("same-day COUNT exceeds page size, excludes logged/skipped/future, and counts crossing midnight only after completion", async () => {
  const tx = await db();
  const scope = dayScopeFor("2026-09-29T12:00:00Z", "UTC");
  for (let i = 0; i < 130; i++) {
    const start = new Date(
        +new Date(scope.dayStartUtc) + i * 60000,
      ).toISOString(),
      end = new Date(+new Date(start) + 60000).toISOString();
    await tx.runAsync(
      "INSERT INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,1,?,?,?)",
      start,
      end,
      i === 0 ? "skipped" : "pending",
      start,
      start,
    );
  }
  let result = await getDayRemaining(scope, "2026-09-29T12:00:00.000Z");
  assert.equal(result.count, 129);
  assert.equal(result.items.length, 100);
  const start = "2026-09-29T23:45:00.000Z",
    end = "2026-09-30T00:15:00.000Z";
  await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,30,?,?)",
    start,
    end,
    start,
    start,
  );
  assert.equal(
    (await getDayRemaining(scope, "2026-09-30T00:00:00.000Z")).count,
    129,
  );
  assert.equal(
    (await getDayRemaining(scope, "2026-09-30T00:20:00.000Z")).count,
    130,
  );
  assert.equal(
    (await getDayRemaining(dayScopeFor(end, "UTC"), "2026-09-30T00:20:00.000Z"))
      .count,
    0,
  );
});
test("explicit selection of existing effective classification is semantic no-op with unchanged history/context", async () => {
  const id = await saveActivity(null, "noop", "x", "1", null);
  const start = "2026-08-10T10:00:00.000Z",
    end = "2026-08-10T10:30:00.000Z";
  await commitCheckIn({
    activityId: id,
    periodStart: start,
    periodEnd: end,
    source: "manual",
    expectedEntry: null,
  });
  const before = await getCheckInContext(start);
  const result = await commitCheckIn({
    activityId: id,
    periodStart: start,
    periodEnd: end,
    source: "manual",
    expectedEntry: before.entry,
    expectedClassificationRevision: before.classification!.revision,
    classificationSelection: { mode: "explicit", code: "1" },
  });
  assert.equal(result.status, "unchanged");
  assert.equal(result.undo, null);
  assert.deepEqual(await getCheckInContext(start), before);
});
test("previous-day report uses target local date, current labels/icons and unchanged ICATUS totals", async () => {
  const tx = await db();
  await setMeta(tx, "first_used_at", "2026-01-01T00:00:00.000Z");
  const id = await create("old");
  await commitCheckIn({
    activityId: id,
    periodStart: "2026-08-11T10:00:00.000Z",
    periodEnd: "2026-08-11T10:30:00.000Z",
    source: "manual",
    expectedEntry: null,
  });
  const q = {
      mode: "day" as const,
      offset: -1,
      calendar: "gregory" as const,
      weekStart: 7,
    },
    now = new Date("2026-08-12T12:00:00Z");
  const before = await getReport(q, "UTC", now),
    s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    "current",
    { kind: "selectAsset", set: ICON_SET, key: "study" },
    null,
    s.category!.revision,
    s.icon,
  );
  const after = await getReport(q, "UTC", now);
  assert.equal(after.range.start, "2026-08-11T00:00:00.000Z");
  assert.equal(after.total, before.total);
  assert.deepEqual(after.buckets, before.buckets);
  assert.equal(after.activities.find((a) => a.id === id)!.name, "current");
  assert.equal(
    after.activities.find((a) => a.id === id)!.icon_view!.kind,
    "asset",
  );
});

test("full SQLite backup and reopen preserve durable icon namespace, unknown orphan metadata and all v0.2 logical records", async () => {
  const tx = await db();
  await setMeta(
    tx,
    "activity_icon_ref:v1:999999",
    ' {"future":"preserved orphan"} ',
  );
  const tables = (
    await tx.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    )
  ).map((row) => row.name);
  const before = await Promise.all(
    tables.map((table) =>
      tx.getAllAsync(`SELECT * FROM ${table} ORDER BY rowid`),
    ),
  );
  const name = await createPreMigrationBackup(tx),
    copy = await SQLite.openDatabaseAsync(name);
  for (let i = 0; i < tables.length; i++)
    assert.deepEqual(
      await copy.getAllAsync(`SELECT * FROM ${tables[i]} ORDER BY rowid`),
      before[i],
    );
  await copy.closeAsync();
});
