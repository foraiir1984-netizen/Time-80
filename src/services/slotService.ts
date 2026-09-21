import { db, transaction } from "../db/connection";
import { getSettings } from "../db/database";
import { getMeta, setMeta } from "../db/metaRepository";
import { timeline } from "../db/slotRepository";
import {
  generateSlots,
  zoned,
  iso,
  timezone,
  validateSettings,
} from "../utils/slots";
import type { SQL, Slot, Anchor, AppSettings } from "../types/domain";
export async function ensureSlotHorizonTx(
  tx: SQL,
  now = new Date(),
  forceFrom?: Date,
) {
  const zone = timezone(),
    s = await getSettings(tx),
    oldEnd = await getMeta(tx, "slot_horizon_end"),
    oldZone = await getMeta(tx, "schedule_timezone");
  validateSettings(s);
  const anchor: Anchor | null = JSON.parse(
    (await getMeta(tx, "schedule_anchor")) ?? "null",
  );
  let from = forceFrom ?? new Date(oldEnd ?? now.toISOString());
  if (oldZone !== zone && from < now) {
    const gaps = JSON.parse(
      (await getMeta(tx, "coverage_unknown_ranges")) ?? "[]",
    );
    gaps.push({ start: from.toISOString(), end: now.toISOString() });
    await setMeta(tx, "coverage_unknown_ranges", JSON.stringify(gaps));
    from = now;
  }
  const horizon = new Date(
    zoned(now, zone).startOfDay().add({ days: 36 }).epochMilliseconds,
  );
  for (const slot of generateSlots(s, from, horizon, anchor, zone))
    await tx.runAsync(
      `INSERT INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at,timezone_id,timezone_provenance)
 SELECT ?,?,?,'pending',?,?,?,'captured_at_slot_creation' WHERE NOT EXISTS(SELECT 1 FROM expected_slots WHERE period_start<? AND period_end>?) AND NOT EXISTS(SELECT 1 FROM time_entries WHERE period_start<? AND period_end>?)`,
      slot.period_start,
      slot.period_end,
      slot.duration_minutes,
      now.toISOString(),
      now.toISOString(),
      zone,
      slot.period_end,
      slot.period_start,
      slot.period_end,
      slot.period_start,
    );
  await setMeta(tx, "slot_horizon_end", horizon.toISOString());
  await setMeta(tx, "schedule_timezone", zone);
}
export const ensureSlotHorizon = (now = new Date()) =>
  transaction((tx) => ensureSlotHorizonTx(tx, now));
export async function rebuildFutureSlots(tx: SQL, effectiveAt: string) {
  await tx.runAsync(
    "DELETE FROM expected_slots WHERE period_start>=? AND state='pending' AND NOT EXISTS(SELECT 1 FROM time_entries e WHERE e.period_start=expected_slots.period_start)",
    effectiveAt,
  );
  await setMeta(tx, "slot_horizon_end", effectiveAt);
}
export async function getDayTimeline(day: Date) {
  const start = zoned(day).startOfDay();
  return timeline(await db(), iso(start), iso(start.add({ days: 1 })));
}
export async function getBacklog(
  before = new Date(),
  cursor: string | null = null,
  limit = 100,
) {
  return (await db()).getAllAsync<Slot>(
    `SELECT s.* FROM expected_slots s WHERE s.period_end<=? AND s.state='pending' AND NOT EXISTS(SELECT 1 FROM time_entries e WHERE e.period_start=s.period_start AND e.status='logged') ${cursor ? "AND s.period_start<?" : ""} ORDER BY s.period_start DESC LIMIT ?`,
    ...[before.toISOString(), ...(cursor ? [cursor] : []), limit],
  );
}
export async function skipSlot(id: number) {
  return transaction(async (tx) => {
    await tx.runAsync(
      "UPDATE expected_slots SET state='skipped',updated_at=? WHERE id=? AND period_end<=? AND NOT EXISTS(SELECT 1 FROM time_entries e WHERE e.period_start=expected_slots.period_start AND e.status='logged')",
      new Date().toISOString(),
      id,
      new Date().toISOString(),
    );
  });
}
