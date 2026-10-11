import * as N from "./notifications.mjs";
import { state } from "./notifications.mjs";
const native = {
  generation: null,
  dirty: true,
  epoch: 0,
  recoveryBlocked: null,
};
export async function invalidateOwnedPlan() {
  native.dirty = true;
  native.epoch++;
}
export async function readNativeSchedulingState() {
  return { ...native };
}
export async function readNotificationCapabilities() {
  if (diagnosticIO.capabilities) return diagnosticIO.capabilities();
  const c = (value) => ({
    supported: true,
    value,
    checkedAt: "2026-01-01T00:00:00Z",
  });
  return {
    displayPermission: c(state.granted),
    channelEnabled: c(true),
    exactAlarmAllowed: c(true),
    batteryOptimizationExempt: c(false),
    backgroundRestricted: c(false),
  };
}
/** @type {{capabilities:null|(()=>Promise<any>)}} */
export const diagnosticIO = { capabilities: null };
export async function applyOwnedPlan(requests, generation, force) {
  if (!force && !native.dirty && native.generation === generation)
    return { ...native };
  await invalidateOwnedPlan();
  const ids = new Set(requests.map((r) => r.identifier));
  for (const [id] of state.scheduled)
    if (
      id.startsWith("time80-") &&
      !id.startsWith("time80-test-") &&
      !id.startsWith("time80-occ-v3:") &&
      !ids.has(id)
    )
      await N.cancelScheduledNotificationAsync(id);
  for (const r of requests) await N.scheduleNotificationAsync(r);
  native.generation = generation;
  native.dirty = false;
  return { ...native };
}
/** @type {{pending:()=>Promise<import('expo-notifications').NotificationResponse[]>,ack:(key:string)=>Promise<void>,dismiss:(response:import('expo-notifications').NotificationResponse)=>Promise<void>}} */
export const responseIO = {
  pending: async () => [],
  ack: async () => {},
  dismiss: async () => {},
};
export async function pendingResponses() {
  return responseIO.pending();
}
export async function acknowledgeResponse(key) {
  return responseIO.ack(key);
}
export async function dismissTappedOccurrence(response) {
  return responseIO.dismiss(response);
}
