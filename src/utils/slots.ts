import { Temporal } from "@js-temporal/polyfill";
import type { AppSettings, Anchor } from "../types/domain";
export const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const zoned = (date: Date, zone = timezone()) =>
  Temporal.Instant.from(date.toISOString()).toZonedDateTimeISO(zone);
export const iso = (z: Temporal.ZonedDateTime) =>
  new Date(z.epochMilliseconds).toISOString();
export const minute = (s: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m || +m[1]! > 23 || +m[2]! > 59) return NaN;
  return +m[1]! * 60 + +m[2]!;
};
export function marks(s: AppSettings, anchorMinute = minute(s.day_start)) {
  if (!Number.isInteger(s.interval_minutes) || s.interval_minutes <= 0)
    throw Error("فاصله نامعتبر است");
  const start = minute(s.day_start),
    end = minute(s.day_end),
    step = s.interval_minutes;
  let first = anchorMinute + Math.ceil((start - anchorMinute) / step) * step;
  const out: number[] = [];
  for (let t = first; t + step <= end; t += step) out.push(t);
  return out;
}
export function generateSlots(
  s: AppSettings,
  from: Date,
  to: Date,
  anchor: Anchor | null,
  zone = timezone(),
) {
  const out: {
    period_start: string;
    period_end: string;
    duration_minutes: number;
  }[] = [];
  for (
    let day = zoned(from, zone).toPlainDate();
    Temporal.PlainDate.compare(day, zoned(to, zone).toPlainDate()) <= 0;
    day = day.add({ days: 1 })
  ) {
    if (!s.active_days.includes((day.dayOfWeek % 7) + 1)) continue;
    const anchorMinute =
      anchor?.resetLocalDate && day.toString() >= anchor.resetLocalDate
        ? anchor.resetLocalMinute!
        : (anchor?.anchorLocalMinute ?? minute(s.day_start));
    for (const m of marks(s, anchorMinute)) {
      const start = day.toZonedDateTime({
          timeZone: zone,
          plainTime: { hour: Math.floor(m / 60), minute: m % 60 },
        }),
        end = start.add({ minutes: s.interval_minutes });
      if (
        start.epochMilliseconds < from.getTime() ||
        end.epochMilliseconds > to.getTime() ||
        end.toPlainDate().toString() !== day.toString() ||
        end.hour * 60 + end.minute > minute(s.day_end)
      )
        continue;
      out.push({
        period_start: iso(start),
        period_end: iso(end),
        duration_minutes: s.interval_minutes,
      });
    }
  }
  return out;
}
export function validateSettings(s: AppSettings) {
  if (
    [s.notification_enabled, s.sound_enabled, s.vibration_enabled].some(
      (v) => v !== 0 && v !== 1,
    )
  )
    throw Error("تنظیمات نامعتبر است");
  if (
    !Number.isInteger(s.interval_minutes) ||
    s.interval_minutes < 15 ||
    s.interval_minutes > 240
  )
    throw Error("فاصله باید ۱۵ تا ۲۴۰ دقیقه باشد");
  if (
    !Number.isFinite(minute(s.day_start)) ||
    !Number.isFinite(minute(s.day_end)) ||
    minute(s.day_end) <= minute(s.day_start)
  )
    throw Error("پایان باید بعد از شروع در همان روز باشد");
  if (
    !s.active_days.length ||
    new Set(s.active_days).size !== s.active_days.length ||
    s.active_days.some((d) => !Number.isInteger(d) || d < 1 || d > 7)
  )
    throw Error("روزهای فعال نامعتبر است");
  if (marks(s).length * s.active_days.length > 450)
    throw Error("تعداد اعلان‌های هفتگی بیش از ۴۵۰ است");
}
