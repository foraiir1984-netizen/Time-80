import { Temporal } from "@js-temporal/polyfill";
import type { NotificationResponse } from "expo-notifications";
export const occurrenceId = (scheduleId: string, end: number) =>
  `time80-occ-v3:${scheduleId.length}:${scheduleId}:${end}`;
export const ownedSchedule = (id: string) =>
  id.startsWith("time80-") &&
  !id.startsWith("time80-test-") &&
  !id.startsWith("time80-occ-v3:");
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export function responseKey(r: NotificationResponse) {
  const d = r.notification.request.content.data ?? {};
  return JSON.stringify([
    r.notification.request.identifier,
    String(
      typeof d.occurrenceId === "string"
        ? d.occurrenceId
        : Number.isFinite(Number(d.time80OccurrenceEnd)) &&
            Number(d.time80OccurrenceEnd) > 0
          ? Number(d.time80OccurrenceEnd)
          : r.notification.date,
    ),
    r.actionIdentifier,
  ]);
}
export type ParsedPeriod = {
  start: string;
  end: string;
  revision?: string;
  version: 2 | 3;
};
export type PayloadResult =
  | { kind: "parsed"; period: ParsedPeriod }
  | { kind: "unresolved"; reason: string };
export function parseNotificationPayload(
  data: Record<string, unknown>,
  requestId: string,
  now = Date.now(),
): PayloadResult {
  const fail = (reason: string): PayloadResult => ({
    kind: "unresolved",
    reason,
  });
  if (data.kind !== "time80-checkin") return fail("invalid-payload");
  const version = data.payloadVersion ?? 2;
  if (version !== 2 && version !== 3) return fail("unsupported-version");
  let start: number, end: number;
  if (version === 3) {
    if (
      typeof data.scheduleId !== "string" ||
      !ownedSchedule(data.scheduleId) ||
      typeof data.scheduleRevision !== "string" ||
      typeof data.scheduleTimezone !== "string" ||
      typeof data.occurrenceId !== "string" ||
      typeof data.periodStart !== "string" ||
      typeof data.periodEnd !== "string"
    )
      return fail("invalid-payload");
    try {
      Temporal.Instant.from(data.periodStart);
      Temporal.Instant.from(data.periodEnd);
      Temporal.Now.zonedDateTimeISO(data.scheduleTimezone);
    } catch {
      return fail("invalid-payload");
    }
    start = +new Date(data.periodStart);
    end = +new Date(data.periodEnd);
    if (
      occurrenceId(data.scheduleId, end) !== data.occurrenceId ||
      requestId !== data.occurrenceId
    )
      return fail("conflicting-fields");
  } else if (data.periodStart !== undefined || data.periodEnd !== undefined) {
    if (
      typeof data.periodStart !== "string" ||
      typeof data.periodEnd !== "string"
    )
      return fail("invalid-payload");
    try {
      Temporal.Instant.from(data.periodStart);
      Temporal.Instant.from(data.periodEnd);
    } catch {
      return fail("invalid-payload");
    }
    start = +new Date(data.periodStart);
    end = +new Date(data.periodEnd);
  } else {
    if (data.time80OccurrenceEnd === undefined)
      return fail("ambiguous-occurrence");
    end = Number(data.time80OccurrenceEnd);
    const duration = Number(data.intervalMinutes);
    if (!Number.isInteger(duration) || duration <= 0 || duration > 1440)
      return fail("invalid-payload");
    start = end - duration * 60000;
  }
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start >= end ||
    end <= 0
  )
    return fail("invalid-payload");
  if (
    data.time80OccurrenceEnd !== undefined &&
    Number(data.time80OccurrenceEnd) !== end
  )
    return fail("conflicting-fields");
  if (
    data.intervalMinutes !== undefined &&
    Number(data.intervalMinutes) * 60000 !== end - start
  )
    return fail("conflicting-fields");
  if (end > now) return fail("future-period");
  return {
    kind: "parsed",
    period: {
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      version,
      revision:
        typeof data.scheduleRevision === "string"
          ? data.scheduleRevision
          : undefined,
    },
  };
}
