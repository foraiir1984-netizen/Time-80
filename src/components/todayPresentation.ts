import type { AppSettings } from "../types/domain";
import { minute, timezone, zoned } from "../utils/slots";

// UI-only: the service accepts a configured interval within one local day.
// Invalid/equal/overnight hours have no service fallback; display unknown.
export function dayPresentationProgress(
  now: Date,
  settings: Pick<AppSettings, "day_start" | "day_end"> | null,
  zone = timezone(),
): number | null {
  if (!settings || !Number.isFinite(+now)) return null;
  const startMinute = minute(settings.day_start),
    endMinute = minute(settings.day_end);
  if (
    !Number.isFinite(startMinute) ||
    !Number.isFinite(endMinute) ||
    endMinute <= startMinute
  )
    return null;
  try {
    const date = zoned(now, zone).toPlainDate();
    const boundary = (m: number) =>
      date.toZonedDateTime({
        timeZone: zone,
        plainTime: { hour: Math.floor(m / 60), minute: m % 60 },
      }).epochMilliseconds;
    const start = boundary(startMinute),
      end = boundary(endMinute);
    if (end <= start) return null;
    return Math.max(0, Math.min(1, (+now - start) / (end - start)));
  } catch {
    return null;
  }
}
