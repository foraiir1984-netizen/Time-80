export const state = {
  granted: true,
  scheduled: new Map(),
  failAfter: Infinity,
  created: 0,
  os: new Set(),
  presented: new Map(),
  dismissed: [],
  channels: new Map(),
};
/** @type {{permission:null|(()=>Promise<any>),request:null|(()=>Promise<any>),channels:null|(()=>Promise<any[]>)}} */
export const notificationReads = {
  permission: null,
  request: null,
  channels: null,
};
export const AndroidImportance = { DEFAULT: 3 };
export const SchedulableTriggerInputTypes = {
  DATE: "date",
  WEEKLY: "weekly",
  TIME_INTERVAL: "timeInterval",
};
const responseListeners = new Set();
export function setNotificationHandler() {}
export function addNotificationResponseReceivedListener(fn) {
  responseListeners.add(fn);
  return { remove: () => responseListeners.delete(fn) };
}
export const emitNotificationResponse = (r) =>
  responseListeners.forEach((fn) => fn(r));
export async function getPermissionsAsync() {
  if (notificationReads.permission) return notificationReads.permission();
  return {
    granted: state.granted,
    canAskAgain: true,
    status: state.granted ? "granted" : "denied",
  };
}
export async function requestPermissionsAsync() {
  if (notificationReads.request) return notificationReads.request();
  return getPermissionsAsync();
}
export async function getNotificationChannelsAsync() {
  if (notificationReads.channels) return notificationReads.channels();
  return [...state.channels.values()];
}
export async function setNotificationChannelAsync() {}
export async function getAllScheduledNotificationsAsync() {
  return [...state.scheduled.values()];
}
export async function cancelScheduledNotificationAsync(id) {
  state.scheduled.delete(id);
  state.os.delete(id);
}
export async function scheduleNotificationAsync(request) {
  if (state.created++ >= state.failAfter) throw Error("Injected OS failure");
  state.scheduled.set(request.identifier, structuredClone(request));
  state.os.add(request.identifier);
  return request.identifier;
}

export async function dismissNotificationAsync(identifier) {
  state.dismissed.push(identifier);
  state.presented.delete(identifier);
}
