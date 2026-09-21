import * as Notifications from "expo-notifications";
import { db } from "../db/connection";
import { getMeta } from "../db/metaRepository";
export async function getNotificationDiagnostics() {
  return {
    permission: await Notifications.getPermissionsAsync(),
    channels: await Notifications.getNotificationChannelsAsync(),
    scheduled: (await Notifications.getAllScheduledNotificationsAsync()).filter(
      (n) => n.identifier.startsWith("time80-"),
    ).length,
    dirty: await getMeta(await db(), "schedule_dirty"),
    battery: "unknown",
    background: "unknown",
  };
}
