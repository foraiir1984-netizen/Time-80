import { readSnapshot } from "../db/connection";
import { getMeta } from "../db/metaRepository";
import type { TimeEntry, Assignment, Slot, SQL } from "../types/domain";
import { SCHEME, rootCode, nodes } from "./classificationDataset";
import { resolveReportRange, type Query } from "../utils/reportPeriods";
import { zoned, iso, timezone } from "../utils/slots";
export type Interval = [number, number];
export function unionMinutes(items: Interval[]) {
  let total = 0,
    end = -Infinity;
  for (const [a, b] of items.sort((x, y) => x[0] - y[0])) {
    if (b > a) {
      total += Math.max(0, b - Math.max(a, end));
      end = Math.max(end, b);
    }
  }
  return total / 60000;
}
export function aggregate(
  entries: TimeEntry[],
  classes: Assignment[],
  slots: Slot[],
  start: string,
  end: string,
  zone: string,
  now: number,
) {
  const lo = +new Date(start),
    hi = +new Date(end),
    activity = new Map<
      number,
      { id: number; name: string; icon: string; minutes: number }
    >(),
    buckets = new Map<string, number>(),
    daily = new Map<string, number>(),
    qualityFlags: string[] = [];
  let total = 0,
    unmapped = 0;
  const intervals: Interval[] = [];
  for (const e of entries) {
    if (e.status !== "logged") continue;
    const a = +new Date(e.period_start),
      b = +new Date(e.period_end),
      x = Math.max(lo, a),
      y = Math.min(hi, b);
    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      b <= a ||
      e.duration_minutes < 0
    ) {
      qualityFlags.push(`invalid:${e.id}`);
      continue;
    }
    if (y <= x) continue;
    if (Math.abs(e.duration_minutes - (b - a) / 60000) > 0.01)
      qualityFlags.push(`duration:${e.id}`);
    intervals.push([x, y]);
    const weight = (e.duration_minutes * (y - x)) / (b - a);
    total += weight;
    const row = activity.get(e.activity_id) ?? {
      id: e.activity_id,
      name: e.activity_name ?? "",
      icon: e.activity_icon ?? "",
      minutes: 0,
    };
    row.minutes += weight;
    activity.set(e.activity_id, row);
    const c = classes.find((c) => c.entry_id === e.id && c.is_current === 1),
      root = rootCode(c?.code ?? null);
    if (root) buckets.set(root, (buckets.get(root) ?? 0) + weight);
    else unmapped += weight;
    let t = x;
    while (t < y) {
      const d = zoned(new Date(t), zone),
        next = Math.min(y, d.startOfDay().add({ days: 1 }).epochMilliseconds);
      const key = d.toPlainDate().toString();
      daily.set(
        key,
        (daily.get(key) ?? 0) + (e.duration_minutes * (next - t)) / (b - a),
      );
      t = next;
    }
  }
  const elapsed = intervals.reduce((sum, [a, b]) => sum + (b - a) / 60000, 0);
  if (unionMinutes([...intervals]) < elapsed) qualityFlags.push("overlap");
  const expected: Interval[] = slots
    .filter((s) => +new Date(s.period_end) <= now)
    .map((s) => [
      Math.max(lo, +new Date(s.period_start)),
      Math.min(hi, +new Date(s.period_end)),
    ])
    .filter(([a, b]) => b! > a!) as Interval[];
  const matched: Interval[] = [];
  for (const [a, b] of expected)
    for (const [x, y] of intervals)
      if (Math.min(b, y) > Math.max(a, x))
        matched.push([Math.max(a, x), Math.min(b, y)]);
  const expectedMinutes = unionMinutes([...expected]),
    loggedMinutes = unionMinutes(matched),
    skippedMinutes = unionMinutes(
      slots
        .filter((s) => s.state === "skipped" && +new Date(s.period_end) <= now)
        .map(
          (s) =>
            [
              Math.max(lo, +new Date(s.period_start)),
              Math.min(hi, +new Date(s.period_end)),
            ] as Interval,
        ),
    );
  return {
    total,
    activities: [...activity.values()].sort(
      (a, b) => b.minutes - a.minutes || a.id - b.id,
    ),
    buckets: nodes
      .filter((n) => n.level === 1)
      .map((n) => ({ ...n, minutes: buckets.get(n.code) ?? 0 })),
    unmappedMinutes: unmapped,
    classificationCoverage: total ? (total - unmapped) / total : null,
    daily: [...daily].sort(([a], [b]) => a.localeCompare(b)),
    coverage: expectedMinutes ? loggedMinutes / expectedMinutes : null,
    expectedMinutes,
    loggedMinutes,
    skippedMinutes,
    pendingMinutes: Math.max(
      0,
      expectedMinutes - loggedMinutes - skippedMinutes,
    ),
    qualityFlags,
  };
}
async function reportTx(tx: SQL, q: Query, now: Date, zone: string) {
  const first = (await getMeta(tx, "first_used_at")) ?? now.toISOString(),
    range = resolveReportRange(q, first, now, zone),
    entries = await tx.getAllAsync<TimeEntry>(
      "SELECT e.*,a.name activity_name,a.icon activity_icon FROM time_entries e JOIN activities a ON a.id=e.activity_id WHERE period_start<? AND period_end>?",
      range.effectiveEnd,
      range.effectiveStart,
    ),
    classes = await tx.getAllAsync<Assignment>(
      "SELECT c.* FROM entry_classifications c JOIN time_entries e ON e.id=c.entry_id WHERE c.is_current=1 AND c.scheme_id=? AND e.period_start<? AND e.period_end>?",
      SCHEME,
      range.effectiveEnd,
      range.effectiveStart,
    ),
    slots = await tx.getAllAsync<Slot>(
      "SELECT * FROM expected_slots WHERE period_start<? AND period_end>?",
      range.effectiveEnd,
      range.effectiveStart,
    );
  return {
    range,
    ...aggregate(
      entries,
      classes,
      slots,
      range.effectiveStart,
      range.effectiveEnd,
      zone,
      +now,
    ),
    historicalCoverageUnknown:
      range.effectiveStart <
        ((await getMeta(tx, "ledger_started_at")) ?? first) ||
      JSON.parse((await getMeta(tx, "coverage_unknown_ranges")) ?? "[]").some(
        (g: { start: string; end: string }) =>
          g.start < range.effectiveEnd && g.end > range.effectiveStart,
      ),
  };
}
export async function getReport(q: Query, zone = timezone()) {
  const now = new Date();
  return readSnapshot(async (tx) => {
    const current = await reportTx(tx, q, now, zone),
      previous =
        q.mode === "custom"
          ? null
          : await reportTx(tx, { ...q, offset: q.offset - 1 }, now, zone);
    return {
      ...current,
      previousTotal: previous?.total ?? null,
      changePercent: previous?.total
        ? ((current.total - previous.total) / previous.total) * 100
        : null,
    };
  });
}
