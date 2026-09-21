import { Temporal } from "@js-temporal/polyfill";
import { zoned, iso, timezone } from "./slots";
export type Mode =
  | "day"
  | "week"
  | "month"
  | "usage7"
  | "usage30"
  | "rolling7"
  | "rolling30"
  | "custom";
export type Query = {
  mode: Mode;
  offset: number;
  calendar: "persian" | "gregory";
  weekStart: number;
  customStart?: string;
  customEnd?: string;
};
export function resolveReportRange(
  q: Query,
  firstUsedAt: string,
  now = new Date(),
  zone = timezone(),
) {
  const today = zoned(now, zone).startOfDay();
  let start = today,
    end = today.add({ days: 1 });
  if (q.mode === "day") {
    start = today.add({ days: q.offset });
    end = start.add({ days: 1 });
  }
  if (q.mode === "week") {
    const weekday = (today.dayOfWeek % 7) + 1;
    start = today
      .subtract({ days: (weekday - q.weekStart + 7) % 7 })
      .add({ weeks: q.offset });
    end = start.add({ weeks: 1 });
  }
  if (q.mode === "month") {
    const c = today.withCalendar(q.calendar);
    start = c.with({ day: 1 }).add({ months: q.offset });
    end = start.add({ months: 1 });
  }
  if (q.mode === "usage7" || q.mode === "usage30") {
    const n = q.mode === "usage7" ? 7 : 30,
      origin = zoned(new Date(firstUsedAt), zone).startOfDay();
    const days = origin.toPlainDate().until(today.toPlainDate()).days;
    start = origin.add({ days: (Math.floor(days / n) + q.offset) * n });
    end = start.add({ days: n });
  }
  if (q.mode === "rolling7" || q.mode === "rolling30") {
    const n = q.mode === "rolling7" ? 7 : 30;
    end = today.add({ days: 1 + q.offset * n });
    start = end.subtract({ days: n });
  }
  if (q.mode === "custom") {
    if (!q.customStart || !q.customEnd) throw Error("دو تاریخ لازم است");
    start = Temporal.PlainDate.from(q.customStart).toZonedDateTime(zone);
    end = Temporal.PlainDate.from(q.customEnd)
      .add({ days: 1 })
      .toZonedDateTime(zone);
  }
  if (end.epochMilliseconds <= start.epochMilliseconds)
    throw Error("ترتیب تاریخ‌ها نادرست است");
  const effectiveStart = new Date(
      Math.max(start.epochMilliseconds, +new Date(firstUsedAt)),
    ),
    effectiveEnd = new Date(Math.min(end.epochMilliseconds, +now));
  return {
    start: iso(start),
    end: iso(end),
    effectiveStart: effectiveStart.toISOString(),
    effectiveEnd: effectiveEnd.toISOString(),
    timezone: zone,
    partial:
      effectiveStart.getTime() !== start.epochMilliseconds ||
      effectiveEnd.getTime() !== end.epochMilliseconds,
  };
}
