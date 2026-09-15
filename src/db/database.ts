import * as SQLite from 'expo-sqlite';
import { Activity, AppSettings, InsightRow, TimeEntry } from '../types/models';

const DB_NAME = 'time80.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function db() {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync(DB_NAME);
  return databasePromise;
}

const DEFAULT_ACTIVITIES = [
  ['مطالعه', '📚'],
  ['کار', '💼'],
  ['خانواده', '👨‍👩‍👦'],
  ['ورزش', '🏃'],
  ['موبایل / شبکه اجتماعی', '📱'],
  ['سرگرمی', '🎬'],
  ['رفت‌وآمد', '🚗'],
  ['استراحت', '😴'],
] as const;

export async function initDatabase() {
  const conn = await db();
  await conn.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      period_start TEXT NOT NULL UNIQUE,
      period_end TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      recorded_at TEXT NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('notification','manual')),
      status TEXT NOT NULL DEFAULT 'logged' CHECK(status IN ('logged','missed','skipped')),
      FOREIGN KEY(activity_id) REFERENCES activities(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      notification_enabled INTEGER NOT NULL DEFAULT 0,
      interval_minutes INTEGER NOT NULL DEFAULT 30,
      day_start TEXT NOT NULL DEFAULT '08:00',
      day_end TEXT NOT NULL DEFAULT '23:00',
      active_days TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      vibration_enabled INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS scheduled_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expo_notification_id TEXT NOT NULL UNIQUE,
      weekday INTEGER NOT NULL,
      fire_time TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (id) VALUES (1);
  `);

  const row = await conn.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM activities');
  if ((row?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    for (let i = 0; i < DEFAULT_ACTIVITIES.length; i += 1) {
      const item = DEFAULT_ACTIVITIES[i];
      if (!item) continue;
      await conn.runAsync(
        'INSERT INTO activities (name, icon, sort_order, is_archived, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
        item[0], item[1], i + 1, now, now,
      );
    }
  }
}

export async function getActivities(includeArchived = false): Promise<Activity[]> {
  const conn = await db();
  const where = includeArchived ? '' : 'WHERE is_archived = 0';
  return conn.getAllAsync<Activity>(`SELECT * FROM activities ${where} ORDER BY sort_order ASC, id ASC`);
}

export async function createActivity(name: string, icon: string) {
  const conn = await db();
  const max = await conn.getFirstAsync<{ maxOrder: number | null }>('SELECT MAX(sort_order) AS maxOrder FROM activities');
  const now = new Date().toISOString();
  return conn.runAsync(
    'INSERT INTO activities (name, icon, sort_order, is_archived, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
    name.trim(), icon, (max?.maxOrder ?? 0) + 1, now, now,
  );
}

export async function updateActivity(id: number, name: string, icon: string) {
  const conn = await db();
  await conn.runAsync(
    'UPDATE activities SET name = ?, icon = ?, updated_at = ? WHERE id = ?',
    name.trim(), icon, new Date().toISOString(), id,
  );
}

export async function setActivityArchived(id: number, archived: boolean) {
  const conn = await db();
  await conn.runAsync(
    'UPDATE activities SET is_archived = ?, updated_at = ? WHERE id = ?',
    archived ? 1 : 0, new Date().toISOString(), id,
  );
}

export async function getSettings(): Promise<AppSettings> {
  const conn = await db();
  const row = await conn.getFirstAsync<{
    notification_enabled: number;
    interval_minutes: number;
    day_start: string;
    day_end: string;
    active_days: string;
    sound_enabled: number;
    vibration_enabled: number;
  }>('SELECT notification_enabled, interval_minutes, day_start, day_end, active_days, sound_enabled, vibration_enabled FROM settings WHERE id = 1');

  if (!row) throw new Error('Settings row is missing');
  let activeDays: number[] = [1, 2, 3, 4, 5, 6, 7];
  try {
    const parsed = JSON.parse(row.active_days);
    if (Array.isArray(parsed)) activeDays = parsed.filter((d) => Number.isInteger(d) && d >= 1 && d <= 7);
  } catch {
    // Keep defaults if old/corrupt data is encountered.
  }
  return { ...row, active_days: activeDays };
}

export async function saveSettings(settings: AppSettings) {
  const conn = await db();
  await conn.runAsync(
    `UPDATE settings
     SET notification_enabled = ?, interval_minutes = ?, day_start = ?, day_end = ?, active_days = ?, sound_enabled = ?, vibration_enabled = ?
     WHERE id = 1`,
    settings.notification_enabled,
    settings.interval_minutes,
    settings.day_start,
    settings.day_end,
    JSON.stringify(settings.active_days),
    settings.sound_enabled,
    settings.vibration_enabled,
  );
}

export async function saveTimeEntry(params: {
  activityId: number;
  periodStart: Date;
  periodEnd: Date;
  source: 'notification' | 'manual';
}) {
  const conn = await db();
  const duration = Math.max(1, Math.round((params.periodEnd.getTime() - params.periodStart.getTime()) / 60_000));
  await conn.runAsync(
    `INSERT INTO time_entries (activity_id, period_start, period_end, duration_minutes, recorded_at, source, status)
     VALUES (?, ?, ?, ?, ?, ?, 'logged')
     ON CONFLICT(period_start) DO UPDATE SET
       activity_id = excluded.activity_id,
       period_end = excluded.period_end,
       duration_minutes = excluded.duration_minutes,
       recorded_at = excluded.recorded_at,
       source = excluded.source,
       status = 'logged'`,
    params.activityId,
    params.periodStart.toISOString(),
    params.periodEnd.toISOString(),
    duration,
    new Date().toISOString(),
    params.source,
  );
}

export async function getEntriesBetween(start: Date, end: Date): Promise<TimeEntry[]> {
  const conn = await db();
  return conn.getAllAsync<TimeEntry>(
    `SELECT te.*, a.name AS activity_name, a.icon AS activity_icon
     FROM time_entries te
     JOIN activities a ON a.id = te.activity_id
     WHERE te.period_start >= ? AND te.period_start < ?
     ORDER BY te.period_start DESC`,
    start.toISOString(),
    end.toISOString(),
  );
}

export async function getInsightsBetween(start: Date, end: Date): Promise<InsightRow[]> {
  const conn = await db();
  return conn.getAllAsync<InsightRow>(
    `SELECT
       a.id AS activity_id,
       a.name AS activity_name,
       a.icon AS activity_icon,
       CAST(SUM(te.duration_minutes) AS INTEGER) AS minutes
     FROM time_entries te
     JOIN activities a ON a.id = te.activity_id
     WHERE te.period_start >= ? AND te.period_start < ? AND te.status = 'logged'
     GROUP BY a.id, a.name, a.icon
     ORDER BY minutes DESC`,
    start.toISOString(),
    end.toISOString(),
  );
}

export async function getScheduledNotificationIds() {
  const conn = await db();
  return conn.getAllAsync<{ expo_notification_id: string }>('SELECT expo_notification_id FROM scheduled_notifications');
}

export async function clearScheduledNotificationRows() {
  const conn = await db();
  await conn.runAsync('DELETE FROM scheduled_notifications');
}

export async function addScheduledNotificationRow(expoId: string, weekday: number, fireTime: string) {
  const conn = await db();
  await conn.runAsync(
    'INSERT OR REPLACE INTO scheduled_notifications (expo_notification_id, weekday, fire_time) VALUES (?, ?, ?)',
    expoId, weekday, fireTime,
  );
}
