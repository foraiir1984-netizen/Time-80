import * as Notifications from "expo-notifications";
import { db } from "../db/connection";
import { getMeta } from "../db/metaRepository";
import { getSettings } from "../db/database";
import {
  readNotificationCapabilities,
  readNativeSchedulingState,
} from "./notificationPlatform";
export async function getNotificationDiagnostics() {
  const conn = await db(),
    s = await getSettings(conn),
    native = await readNativeSchedulingState();
  const dirty = await getMeta(conn, "schedule_dirty");
  const epoch = await getMeta(conn, "notification_native_epoch_applied");
  return {
    permission: await Notifications.getPermissionsAsync(),
    channels: await Notifications.getNotificationChannelsAsync(),
    scheduled: (await Notifications.getAllScheduledNotificationsAsync()).filter(
      (n) =>
        n.identifier.startsWith("time80-") &&
        !n.identifier.startsWith("time80-test-"),
    ).length,
    dirty:
      dirty === "true" || native.dirty || epoch !== String(native.epoch)
        ? "true"
        : "false",
    native,
    capabilities: await readNotificationCapabilities(
      `time80-s${s.sound_enabled}-v${s.vibration_enabled}`,
    ),
  };
}
