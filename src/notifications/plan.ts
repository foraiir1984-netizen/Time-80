import type { AppSettings, Anchor, Slot } from "../types/domain";
import { Temporal } from "@js-temporal/polyfill";
import { marks, zoned, generateSlots } from "../utils/slots";
export function notificationPlan(
  s: AppSettings,
  anchor: Anchor | null,
  now: Date,
  current: Slot | null,
) {
  const out: {
    key: string;
    weekday?: number;
    hour?: number;
    minute?: number;
    date?: string;
    data: Record<string, unknown>;
  }[] = [];
  if (!s.notification_enabled) return out;
  const reset = anchor?.resetLocalDate
    ? Temporal.PlainDate.from(anchor.resetLocalDate).toZonedDateTime(
        anchor.timezone,
      ).epochMilliseconds
    : null;
  const boundary =
    reset ?? (anchor?.effectiveAt ? +new Date(anchor.effectiveAt) : 0);
  for (const weekday of s.active_days)
    for (const start of marks(
      s,
      anchor?.resetLocalMinute ?? anchor?.anchorLocalMinute,
    )) {
      const end = start + s.interval_minutes;
      out.push({
        key: `w-${weekday}-${end}`,
        weekday,
        hour: Math.floor(end / 60),
        minute: end % 60,
        data: {
          kind: "time80-checkin",
          payloadVersion: 2,
          weekday,
          fireHour: Math.floor(end / 60),
          fireMinute: end % 60,
          intervalMinutes: s.interval_minutes,
          time80NotBefore: boundary ? boundary + s.interval_minutes * 60000 : 0,
        },
      });
    }
  if (reset && reset > +now && anchor) {
    for (const slot of generateSlots(
      s,
      new Date(Math.max(+now, +new Date(anchor.effectiveAt))),
      new Date(reset),
      anchor,
      anchor.timezone,
    )) {
      out.push({
        key: `transition-${slot.period_start}`,
        date: slot.period_end,
        data: {
          kind: "time80-checkin",
          payloadVersion: 2,
          periodStart: slot.period_start,
          periodEnd: slot.period_end,
        },
      });
    }
  }
  if (current && +new Date(current.period_end) > +now) {
    const end = zoned(new Date(current.period_end));
    const same = out.find(
      (p) =>
        p.weekday === (end.dayOfWeek % 7) + 1 &&
        p.hour === end.hour &&
        p.minute === end.minute &&
        current.duration_minutes === s.interval_minutes,
    );
    if (same && (!reset || reset <= +now))
      same.data.time80NotBefore = Math.min(
        Number(same.data.time80NotBefore),
        +new Date(current.period_end),
      );
    else
      out.push({
        key: `d-${current.id}`,
        date: current.period_end,
        data: {
          kind: "time80-checkin",
          payloadVersion: 2,
          periodStart: current.period_start,
          periodEnd: current.period_end,
        },
      });
  }
  return out;
}
