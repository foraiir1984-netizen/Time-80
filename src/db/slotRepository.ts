import type { SQL, Slot, TimeEntry, SlotView } from "../types/domain";
export async function timeline(
  tx: SQL,
  start: string,
  end: string,
): Promise<SlotView[]> {
  const slots = await tx.getAllAsync<Slot>(
    "SELECT * FROM expected_slots WHERE period_start>=? AND period_start<? ORDER BY period_start DESC",
    start,
    end,
  );
  const entries = await tx.getAllAsync<TimeEntry>(
    "SELECT e.*,a.name activity_name,a.icon activity_icon FROM time_entries e JOIN activities a ON a.id=e.activity_id WHERE e.period_start>=? AND e.period_start<?",
    start,
    end,
  );
  const map = new Map<string, SlotView>(
    slots.map((slot) => [slot.period_start, { ...slot, slot, entry: null }]),
  );
  for (const entry of entries) {
    const old = map.get(entry.period_start);
    map.set(entry.period_start, {
      period_start: entry.period_start,
      period_end: entry.period_end,
      slot: old?.slot ?? null,
      entry,
    });
  }
  return [...map.values()].sort((a, b) =>
    b.period_start.localeCompare(a.period_start),
  );
}
