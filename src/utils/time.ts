import { AppSettings, TimeEntry } from "../types/models";

export type DaySlot = {
  start: Date;
  end: Date;
  isFuture: boolean;
  entry?: TimeEntry;
};

export const expoWeekdayForDate = (date: Date) => date.getDay() + 1; // Sunday=1 ... Saturday=7

export function parseHHMM(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

export function minutesToHHMM(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function localDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function getReminderMinuteMarks(settings: AppSettings): number[] {
  const start = parseHHMM(settings.day_start);
  const end = parseHHMM(settings.day_end);
  if (start === null || end === null || end <= start) return [];
  const step = Math.max(5, Math.floor(settings.interval_minutes));
  const marks: number[] = [];
  for (let t = start + step; t <= end; t += step) marks.push(t);
  return marks;
}

export function scheduledAlarmCount(settings: AppSettings): number {
  if (!settings.notification_enabled) return 0;
  return getReminderMinuteMarks(settings).length * settings.active_days.length;
}

export function buildDaySlots(
  settings: AppSettings,
  date: Date,
  entries: TimeEntry[],
): DaySlot[] {
  const weekday = expoWeekdayForDate(date);
  if (!settings.active_days.includes(weekday)) return [];

  const entryMap = new Map(entries.map((entry) => [entry.period_start, entry]));
  const now = new Date();
  const marks = getReminderMinuteMarks(settings);

  return marks.map((endMinute) => {
    const end = new Date(date);
    end.setHours(Math.floor(endMinute / 60), endMinute % 60, 0, 0);
    const start = new Date(end.getTime() - settings.interval_minutes * 60_000);
    const iso = start.toISOString();
    return {
      start,
      end,
      isFuture: end.getTime() > now.getTime(),
      entry: entryMap.get(iso),
    };
  });
}

export function mostRecentCompletedPeriod(
  settings: AppSettings,
  now = new Date(),
) {
  const weekday = expoWeekdayForDate(now);
  if (!settings.active_days.includes(weekday)) return null;
  const marks = getReminderMinuteMarks(settings);
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const completed = marks.filter((m) => m <= currentMinute);
  const endMinute = completed.at(-1);
  if (endMinute === undefined) return null;
  const end = new Date(now);
  end.setHours(Math.floor(endMinute / 60), endMinute % 60, 0, 0);
  const start = new Date(end.getTime() - settings.interval_minutes * 60_000);
  return { start, end };
}

export function toPersianDuration(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h} ساعت و ${m} دقیقه`;
}
