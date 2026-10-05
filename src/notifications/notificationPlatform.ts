import { requireOptionalNativeModule } from "expo";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ownedSchedule } from "./notificationContracts";
export type Capability = {
  supported: boolean;
  value: boolean | null;
  checkedAt: string;
  reason?: string;
};
export type NativeState = {
  generation: string | null;
  dirty: boolean;
  epoch: number;
  recoveryBlocked: string | null;
};
export type OwnedRequest = {
  identifier: string;
  content: Record<string, unknown>;
  trigger: Record<string, unknown>;
};
const scheduler = () =>
  requireOptionalNativeModule("ExpoNotificationScheduler");
const emitter = () => requireOptionalNativeModule("ExpoNotificationsEmitter");
export async function readNotificationCapabilities(channelId: string) {
  const bridge = scheduler();
  if (Platform.OS === "android" && bridge?.time80ReadCapabilities)
    return bridge.time80ReadCapabilities(channelId) as Promise<
      Record<string, Capability>
    >;
  const at = new Date().toISOString(),
    permission = await Notifications.getPermissionsAsync();
  const unknown: Capability = {
    supported: false,
    value: null,
    checkedAt: at,
    reason: "native adapter unavailable",
  };
  return {
    displayPermission: {
      supported: true,
      value: permission.granted,
      checkedAt: at,
    },
    channelEnabled: unknown,
    exactAlarmAllowed: unknown,
    batteryOptimizationExempt: unknown,
    backgroundRestricted: unknown,
  };
}
export async function readNativeSchedulingState(): Promise<NativeState> {
  const bridge = scheduler();
  if (!bridge?.time80GetSchedulingState)
    return {
      generation: null,
      dirty: true,
      epoch: 0,
      recoveryBlocked: "native adapter unavailable",
    };
  return bridge.time80GetSchedulingState();
}
export async function invalidateOwnedPlan() {
  const bridge = scheduler();
  if (bridge?.time80InvalidatePlan) await bridge.time80InvalidatePlan();
}
export async function applyOwnedPlan(
  requests: OwnedRequest[],
  generation: string,
  force: boolean,
  zone: string,
  validUntil: string,
) {
  const bridge = scheduler();
  if (Platform.OS !== "android") {
    // Preserve the existing Expo scheduling path on platforms outside the Android prototype.
    // v3 occurrence presentation requires the Android adapter; do not manufacture occurrence times.
    const current = await Notifications.getAllScheduledNotificationsAsync(),
      desired = new Set(requests.map((r) => r.identifier));
    for (const r of current)
      if (ownedSchedule(r.identifier) && !desired.has(r.identifier))
        await Notifications.cancelScheduledNotificationAsync(r.identifier);
    for (const r of requests)
      if (force || !current.some((n) => n.identifier === r.identifier)) {
        const data = r.content.data as Record<string, unknown>;
        await Notifications.scheduleNotificationAsync({
          identifier: r.identifier,
          content: { ...r.content, data: { ...data, payloadVersion: 2 } },
          trigger:
            r.trigger as unknown as Notifications.NotificationTriggerInput,
        });
      }
    return { generation, dirty: false, epoch: 0, recoveryBlocked: null };
  }
  if (!bridge?.time80ApplyPlan)
    throw Error(
      "آداپتور اعلان در این build موجود نیست؛ ثبت دستی همچنان در دسترس است",
    );
  return bridge.time80ApplyPlan(
    JSON.stringify({ requests, generation, force, zone, validUntil }),
  ) as Promise<NativeState>;
}
export async function pendingResponses(): Promise<
  Notifications.NotificationResponse[]
> {
  const bridge = emitter();
  const rows = bridge?.time80GetPendingResponses
    ? await bridge.time80GetPendingResponses()
    : [await Notifications.getLastNotificationResponseAsync()].filter(Boolean);
  return rows.map((r: any) => {
    const content = r.notification.request.content;
    if (content.dataString) {
      try {
        content.data = JSON.parse(content.dataString);
      } catch {
        content.data = {};
      }
    }
    return r;
  });
}
export async function acknowledgeResponse(key: string) {
  const bridge = emitter();
  if (bridge?.time80AcknowledgeResponse)
    await bridge.time80AcknowledgeResponse(
      key,
    ); /* No unsafe JS read-then-clear fallback. */
}
export async function dismissTappedOccurrence(
  r: Notifications.NotificationResponse,
) {
  const d = r.notification.request.content.data ?? {},
    id = r.notification.request.identifier;
  if (
    d.kind === "time80-test" ||
    (d.payloadVersion === 3 &&
      id === d.occurrenceId &&
      id.startsWith("time80-occ-v3:"))
  )
    await Notifications.dismissNotificationAsync(id);
  // Legacy shared identifiers: preserve native autoCancel; abstain from ambiguous additional cleanup.
}
