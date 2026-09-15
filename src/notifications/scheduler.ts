import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  addScheduledNotificationRow,
  clearScheduledNotificationRows,
  getScheduledNotificationIds,
} from '../db/database';
import { AppSettings, CheckInPeriod } from '../types/models';
import { getReminderMinuteMarks, minutesToHHMM, scheduledAlarmCount } from '../utils/time';

const MAX_SCHEDULED_ALARMS = 450;

function channelIdFor(settings: AppSettings) {
  const sound = Boolean(settings.sound_enabled);
  const vibration = Boolean(settings.vibration_enabled);
  if (sound && vibration) return 'checkins-sound-vibrate-v1';
  if (sound) return 'checkins-sound-v1';
  if (vibration) return 'checkins-vibrate-v1';
  return 'checkins-silent-v1';
}

async function ensureAndroidChannel(settings: AppSettings) {
  if (Platform.OS !== 'android') return undefined;
  const channelId = channelIdFor(settings);
  await Notifications.setNotificationChannelAsync(channelId, {
    name: 'یادآوری ثبت زمان',
    description: 'یادآوری‌های دوره‌ای Time80 برای ثبت فعالیت',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: settings.sound_enabled ? 'default' : null,
    enableVibrate: Boolean(settings.vibration_enabled),
    vibrationPattern: settings.vibration_enabled ? [0, 180, 120, 180] : null,
    showBadge: false,
  });
  return channelId;
}

export async function ensureNotificationPermission(settings: AppSettings) {
  await ensureAndroidChannel(settings);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelTime80Notifications() {
  const rows = await getScheduledNotificationIds();
  for (const row of rows) {
    try {
      await Notifications.cancelScheduledNotificationAsync(row.expo_notification_id);
    } catch {
      // The OS may already have dropped an old schedule; DB cleanup still proceeds.
    }
  }
  await clearScheduledNotificationRows();
}

export async function rescheduleTime80Notifications(settings: AppSettings) {
  await cancelTime80Notifications();
  if (!settings.notification_enabled) return { count: 0 };

  const count = scheduledAlarmCount(settings);
  if (count > MAX_SCHEDULED_ALARMS) {
    throw new Error(`این تنظیمات ${count} یادآوری هفتگی می‌سازد. برای پایداری، حداکثر ${MAX_SCHEDULED_ALARMS} یادآوری مجاز است.`);
  }

  const granted = await ensureNotificationPermission(settings);
  if (!granted) throw new Error('مجوز نمایش اعلان داده نشده است.');

  const channelId = await ensureAndroidChannel(settings);
  const minuteMarks = getReminderMinuteMarks(settings);
  let scheduled = 0;

  for (const weekday of settings.active_days) {
    for (const totalMinutes of minuteMarks) {
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      const fireTime = minutesToHHMM(totalMinutes);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time80',
          body: `در ${settings.interval_minutes} دقیقه گذشته بیشتر مشغول چه کاری بودی؟`,
          sound: settings.sound_enabled ? 'default' : undefined,
          data: {
            kind: 'time80-checkin',
            fireHour: hour,
            fireMinute: minute,
            intervalMinutes: settings.interval_minutes,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId,
        },
      });
      await addScheduledNotificationRow(id, weekday, fireTime);
      scheduled += 1;
    }
  }

  return { count: scheduled };
}

export function checkInPeriodFromNotification(notification: Notifications.Notification): CheckInPeriod | null {
  const data = notification.request.content.data ?? {};
  if (data.kind !== 'time80-checkin') return null;

  const hour = Number(data.fireHour);
  const minute = Number(data.fireMinute);
  const interval = Number(data.intervalMinutes);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || !Number.isFinite(interval)) return null;

  const deliveredAt = new Date(notification.date);
  const end = new Date(deliveredAt);
  end.setHours(hour, minute, 0, 0);
  const start = new Date(end.getTime() - interval * 60_000);
  return { start, end, source: 'notification' };
}
