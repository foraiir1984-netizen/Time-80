import { Temporal } from "@js-temporal/polyfill";
import { readSnapshot } from "../db/connection";
import type { Slot } from "../types/domain";
import { timezone } from "../utils/slots";
export type DayScope = {
  localDate: string;
  timezone: string;
  dayStartUtc: string;
  nextDayStartUtc: string;
};
export function dayScopeFor(periodStart: string, zone = timezone()): DayScope {
  const day = Temporal.Instant.from(periodStart)
    .toZonedDateTimeISO(zone)
    .startOfDay();
  return {
    localDate: day.toPlainDate().toString(),
    timezone: zone,
    dayStartUtc: day.toInstant().toString({ smallestUnit: "millisecond" }),
    nextDayStartUtc: day
      .add({ days: 1 })
      .toInstant()
      .toString({ smallestUnit: "millisecond" }),
  };
}
const predicate =
  "s.period_start>=? AND s.period_start<? AND s.period_end<=? AND s.state='pending' AND NOT EXISTS(SELECT 1 FROM time_entries e WHERE e.period_start=s.period_start AND e.status='logged')";
export async function getDayRemaining(
  scope: DayScope,
  cutoffUtc: string,
  cursor: string | null = null,
  limit = 100,
) {
  const checked = dayScopeFor(scope.dayStartUtc, scope.timezone);
  if (
    Object.keys(checked).some(
      (key) => checked[key as keyof DayScope] !== scope[key as keyof DayScope],
    ) ||
    !Number.isFinite(+new Date(cutoffUtc))
  )
    throw Error("بازهٔ روز نامعتبر است");
  return readSnapshot(async (tx) => {
    const args = [scope.dayStartUtc, scope.nextDayStartUtc, cutoffUtc];
    const count = (await tx.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) count FROM expected_slots s WHERE ${predicate}`,
      ...args,
    ))!.count;
    const items = await tx.getAllAsync<Slot>(
      `SELECT s.* FROM expected_slots s WHERE ${predicate} ${cursor ? "AND s.period_start<?" : ""} ORDER BY s.period_start DESC LIMIT ?`,
      ...args,
      ...(cursor ? [cursor] : []),
      limit,
    );
    return { scope, cutoffUtc, count, items };
  });
}
