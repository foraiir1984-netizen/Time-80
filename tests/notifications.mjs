export const state = {
  granted: true,
  scheduled: new Map(),
  failAfter: Infinity,
  created: 0,
};
export const AndroidImportance = { DEFAULT: 3 };
export const SchedulableTriggerInputTypes = {
  DATE: "date",
  WEEKLY: "weekly",
  TIME_INTERVAL: "timeInterval",
};
export async function getPermissionsAsync() {
  return { granted: state.granted, canAskAgain: true };
}
export async function requestPermissionsAsync() {
  return getPermissionsAsync();
}
export async function setNotificationChannelAsync() {}
export async function getAllScheduledNotificationsAsync() {
  return [...state.scheduled.values()];
}
export async function cancelScheduledNotificationAsync(id) {
  state.scheduled.delete(id);
}
export async function scheduleNotificationAsync(request) {
  if (state.created++ >= state.failAfter) throw Error("Injected OS failure");
  state.scheduled.set(request.identifier, structuredClone(request));
  return request.identifier;
}
