import { test } from "node:test";
import assert from "node:assert/strict";
import { initDatabase } from "../src/db/database";
import { db, transaction, readSnapshot, atomic } from "../src/db/connection";
import { SCHEMA_SQL } from "../src/db/schema";
import { detectSchema } from "../src/db/migrations";
import { saveActivity } from "../src/services/classificationService";
import {
  commitCheckIn,
  getCheckInContext,
  confirmTimeContext,
} from "../src/services/checkInService";
import { getRankedActivities } from "../src/services/activityService";
import {
  nodes,
  dataset,
  translation,
} from "../src/services/classificationDataset";
import { createHash } from "node:crypto";

test("DDL failure rolls back all tables and version; old databases are detected without modification", async () => {
  const conn = await db();
  await assert.rejects(
    atomic(conn, async (tx) => {
      await tx.execAsync(SCHEMA_SQL);
      throw Error("injected");
    }),
  );
  assert.equal(await detectSchema(conn), "empty");
  assert.equal(
    (await conn.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))
      ?.user_version,
    0,
  );
  await conn.execAsync(
    "CREATE TABLE legacy_data(value TEXT); INSERT INTO legacy_data VALUES('preserve me'); PRAGMA user_version=1",
  );
  const before = await conn.getAllAsync("SELECT * FROM legacy_data");
  await assert.rejects(initDatabase());
  assert.deepEqual(await conn.getAllAsync("SELECT * FROM legacy_data"), before);
  // Test fixture cleanup only; the app has no reset path.
  await conn.execAsync("DROP TABLE legacy_data; PRAGMA user_version=0");
  await initDatabase();
});

test("reference dataset integrity and complete parent relationships", () => {
  assert.deepEqual(
    [1, 2, 3].map((l) => nodes.filter((n) => n.level === l).length),
    [9, 56, 165],
  );
  for (const d of [dataset, translation])
    assert.equal(
      createHash("sha256").update(d.canonical).digest("hex"),
      d.sha256,
    );
  for (const n of nodes.filter((n) => n.parent_code))
    assert.equal(
      nodes.find((p) => p.code === n.parent_code)!.level,
      n.level - 1,
    );
});

test("explicit null, no-op, confirmed time context, archive and ranking preserve history", async () => {
  const conn = await db();
  const id = await saveActivity(null, "context", "x", "1", null);
  const start = "2026-02-20T10:00:00.000Z",
    end = "2026-02-20T10:30:00.000Z";
  await conn.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at,timezone_id,timezone_provenance) VALUES(?,?,30,?,?,'UTC','captured_at_slot_creation')",
    start,
    end,
    start,
    start,
  );
  const input = {
    activityId: id,
    periodStart: start,
    periodEnd: end,
    source: "manual" as const,
    expectedEntry: null,
  };
  await commitCheckIn({
    ...input,
    classificationSelection: { mode: "explicit", code: null },
  });
  let c = await getCheckInContext(start);
  assert.equal(c.classification!.code, null);
  assert.equal(c.context!.timezone_id, "UTC");
  await confirmTimeContext(c, "Asia/Tehran");
  c = await getCheckInContext(start);
  assert.equal(c.context!.provenance, "user_confirmed");
  const original = c;
  const noop = await commitCheckIn({ ...input, expectedEntry: c.entry });
  assert.equal(noop.status, "unchanged");
  assert.equal(noop.undo, null);
  await commitCheckIn({
    ...input,
    expectedEntry: c.entry,
    expectedClassificationRevision: c.classification!.revision,
    classificationSelection: { mode: "explicit", code: "2" },
  });
  c = await getCheckInContext(start);
  assert.deepEqual(c.entry, original.entry);
  assert.deepEqual(c.context, original.context);
  await assert.rejects(
    confirmTimeContext(
      { ...c, context: { ...c.context!, timezone_id: "stale" } },
      "UTC",
    ),
    /تغییر/,
  );
  let rank = await getRankedActivities(new Date("2026-02-20T11:00:00Z"));
  assert.equal(rank.top4[0]!.id, id);
  await transaction((tx) =>
    tx.runAsync("UPDATE activities SET is_archived=1 WHERE id=?", id),
  );
  rank = await getRankedActivities(new Date("2026-02-20T11:00:00Z"));
  assert.ok(!rank.top4.some((a) => a.id === id));
  assert.equal((await getCheckInContext(start)).entry!.id, c.entry!.id);
});

test("report reads share a stable snapshot while a queued edit waits", async () => {
  const conn = await db();
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  let started!: () => void;
  const began = new Promise<void>((r) => {
    started = r;
  });
  const report = readSnapshot(async (tx) => {
    const before = await tx.getFirstAsync<{ name: string }>(
      "SELECT name FROM activities WHERE id=1",
    );
    started();
    await gate;
    const after = await tx.getFirstAsync<{ name: string }>(
      "SELECT name FROM activities WHERE id=1",
    );
    assert.equal(before!.name, after!.name);
  });
  await began;
  const edit = transaction((tx) =>
    tx.runAsync("UPDATE activities SET name='after snapshot' WHERE id=1"),
  );
  release();
  await report;
  await edit;
  assert.equal(
    (await conn.getFirstAsync<{ name: string }>(
      "SELECT name FROM activities WHERE id=1",
    ))!.name,
    "after snapshot",
  );
});
