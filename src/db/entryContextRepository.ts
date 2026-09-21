import type { SQL, Slot, TimeContext } from "../types/domain";
import { zoned, timezone } from "../utils/slots";
export async function createEntryContext(tx: SQL, id: number, start: string) {
  const slot = await tx.getFirstAsync<Slot>(
    "SELECT * FROM expected_slots WHERE period_start=?",
    start,
  );
  const known =
    slot?.timezone_id === timezone() &&
    slot.timezone_provenance === "captured_at_slot_creation";
  const zone = known ? slot!.timezone_id : null;
  await tx.runAsync(
    "INSERT INTO entry_time_context VALUES(?,?,?,?,?)",
    id,
    zone,
    zone ? zoned(new Date(start), zone).offsetNanoseconds / 60e9 : null,
    known ? "captured_at_slot_creation" : "unknown",
    new Date().toISOString(),
  );
}

// Explicit confirmation only; ordinary activity/category edits never call this path.
export async function confirmEntryTimeContext(
  tx: SQL,
  entryId: number,
  expected: TimeContext | null,
  zone: string,
) {
  const old = await tx.getFirstAsync<TimeContext>(
    "SELECT * FROM entry_time_context WHERE entry_id=?",
    entryId,
  );
  if (JSON.stringify(old) !== JSON.stringify(expected))
    throw Error("زمینهٔ زمانی تغییر کرده؛ صفحه را تازه کن");
  const entry = await tx.getFirstAsync<{ period_start: string }>(
    "SELECT period_start FROM time_entries WHERE id=?",
    entryId,
  );
  if (!entry) throw Error("ثبت پیدا نشد");
  const offset =
    zoned(new Date(entry.period_start), zone).offsetNanoseconds / 60e9;
  await tx.runAsync(
    "INSERT INTO entry_time_context VALUES(?,?,?,'user_confirmed',?) ON CONFLICT(entry_id) DO UPDATE SET timezone_id=excluded.timezone_id,utc_offset_start_minutes=excluded.utc_offset_start_minutes,provenance=excluded.provenance,captured_at=excluded.captured_at",
    entryId,
    zone,
    offset,
    new Date().toISOString(),
  );
}
