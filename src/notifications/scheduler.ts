import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { db, serialized } from "../db/connection";
import { getSettings } from "../db/database";
import { getMeta, setMeta } from "../db/metaRepository";
import type { Slot, Anchor, AppSettings } from "../types/domain";
import { notificationPlan } from "./plan";
import { zoned, validateSettings } from "../utils/slots";
export async function ensureAndroidChannel(s: AppSettings) {
  const id = `time80-s${s.sound_enabled}-v${s.vibration_enabled}`;
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync(id, {
      name: "یادآوری ثبت زمان",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: s.sound_enabled ? "default" : null,
      enableVibrate: !!s.vibration_enabled,
      vibrationPattern: s.vibration_enabled ? [0, 180] : null,
    });
  return id;
}
export async function ensureNotificationPermission(s: AppSettings) {
  await ensureAndroidChannel(s);
  const p = await Notifications.getPermissionsAsync();
  return (
    p.granted ||
    (p.canAskAgain && (await Notifications.requestPermissionsAsync()).granted)
  );
}
export async function reconcileNotifications(reason = "resume") {
  return serialized(async () => {
    const conn = await db(),
      s = await getSettings(conn),
      permission = await Notifications.getPermissionsAsync(),
      revision = (await getMeta(conn, "schedule_revision")) ?? "0",
      anchor = JSON.parse(
        (await getMeta(conn, "schedule_anchor")) ?? "null",
      ) as Anchor | null,
      now = new Date(),
      current = await conn.getFirstAsync<Slot>(
        "SELECT * FROM expected_slots WHERE period_start<=? AND period_end>? LIMIT 1",
        now.toISOString(),
        now.toISOString(),
      );
    await setMeta(conn, "schedule_dirty", "true");
    validateSettings(s);
    const plan = notificationPlan(s, anchor, now, current),
      channelId = await ensureAndroidChannel(s);
    if (plan.length > 550) throw Error("تعداد اعلان زیاد است");
    if (s.notification_enabled && !permission.granted) {
      await setMeta(conn, "schedule_dirty", "true");
      throw Error("تنظیمات ذخیره شد؛ مجوز اعلان داده نشده است");
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync(),
      desired = new Set(plan.map((p) => `time80-${revision}-${p.key}`));
    for (const n of scheduled)
      if (
        n.identifier.startsWith("time80-") &&
        !n.identifier.startsWith("time80-test-") &&
        !desired.has(n.identifier)
      )
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
    for (const p of plan) {
      const id = `time80-${revision}-${p.key}`;
      if (scheduled.some((n) => n.identifier === id)) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: "Time80",
          body: "این بازه را بیشتر صرف چه کاری کردی؟",
          sound: s.sound_enabled ? "default" : undefined,
          data: { ...p.data, scheduleRevision: revision },
        },
        trigger: p.date
          ? {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(p.date),
              channelId,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: p.weekday!,
              hour: p.hour!,
              minute: p.minute!,
              channelId,
            },
      });
    }
    const actual = await Notifications.getAllScheduledNotificationsAsync();
    if ([...desired].some((id) => !actual.some((n) => n.identifier === id)))
      throw Error("زمان‌بندی کامل نشد؛ دوباره تلاش کن");
    await conn.execAsync("BEGIN");
    try {
      await conn.runAsync("DELETE FROM scheduled_notifications");
      for (const n of actual.filter((n) => desired.has(n.identifier)))
        await conn.runAsync(
          "INSERT INTO scheduled_notifications(expo_notification_id,weekday,fire_time) VALUES(?,?,?)",
          n.identifier,
          Number(n.content.data?.weekday ?? 0),
          JSON.stringify(n.trigger),
        );
      await setMeta(
        conn,
        "notification_schedule_signature",
        JSON.stringify({ revision, ids: [...desired].sort() }),
      );
      await setMeta(conn, "schedule_dirty", "false");
      await conn.execAsync("COMMIT");
    } catch (e) {
      await conn.execAsync("ROLLBACK");
      throw e;
    }
    return { count: desired.size };
  });
}
export async function sendTestNotification() {
  const s = await getSettings();
  if (!(await ensureNotificationPermission(s)))
    throw Error("مجوز اعلان لازم است");
  const channelId = await ensureAndroidChannel(s);
  return Notifications.scheduleNotificationAsync({
    identifier: `time80-test-${Date.now()}`,
    content: {
      title: "Time80 — تست",
      body: "اعلان آزمایشی دریافت شد",
      data: { kind: "time80-test" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId,
    },
  });
}
export async function resolveNotificationPeriod(
  notification: Notifications.Notification,
) {
  const d = notification.request.content.data ?? {};
  if (d.kind !== "time80-checkin") return null;
  const conn = await db();
  if (d.periodStart && d.periodEnd) {
    const slot = await conn.getFirstAsync<Slot>(
      "SELECT * FROM expected_slots WHERE period_start=? AND period_end=?",
      String(d.periodStart),
      String(d.periodEnd),
    );
    return slot && +new Date(slot.period_end) <= Date.now() ? slot : null;
  }
  const occurrence = Number(d.time80OccurrenceEnd);
  if (Number.isFinite(occurrence) && occurrence > 0 && occurrence <= Date.now())
    return conn.getFirstAsync<Slot>(
      "SELECT * FROM expected_slots WHERE period_end=? AND duration_minutes=?",
      new Date(occurrence).toISOString(),
      Number(d.intervalMinutes),
    );
  // Older payloads have no absolute occurrence: never guess the day after delayed delivery.
  return null;
}
export async function getNextReminder() {
  const s = await getSettings();
  if (
    !s.notification_enabled ||
    !(await Notifications.getPermissionsAsync()).granted
  )
    return null;
  return (await db()).getFirstAsync<Slot>(
    "SELECT * FROM expected_slots WHERE period_end>? ORDER BY period_end LIMIT 1",
    new Date().toISOString(),
  );
}
