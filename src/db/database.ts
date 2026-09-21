import { db, transaction } from "./connection";
import { runMigrations } from "./migrations";
import type { SQL, Activity, AppSettings, TimeEntry } from "../types/domain";
export const initDatabase = runMigrations;
export async function getSettings(tx?: SQL): Promise<AppSettings> {
  const row = await (tx ?? (await db())).getFirstAsync<any>(
    "SELECT * FROM settings WHERE id=1",
  );
  if (!row) throw Error("تنظیمات موجود نیست");
  return { ...row, active_days: JSON.parse(row.active_days) };
}
export async function getActivities(includeArchived = false) {
  return (await db()).getAllAsync<Activity>(
    `SELECT * FROM activities ${includeArchived ? "" : "WHERE is_archived=0"} ORDER BY sort_order,id`,
  );
}
export async function createActivity(name: string, icon: string) {
  if (!name.trim() || !icon.trim()) throw Error("نام و آیکون لازم است");
  return transaction((tx) =>
    tx.runAsync(
      "INSERT INTO activities(name,icon,sort_order,created_at,updated_at) VALUES(?,?,(SELECT COALESCE(MAX(sort_order),0)+1 FROM activities),?,?)",
      name.trim(),
      icon,
      new Date().toISOString(),
      new Date().toISOString(),
    ),
  );
}
export async function updateActivity(id: number, name: string, icon: string) {
  if (!name.trim() || !icon.trim()) throw Error("نام و آیکون لازم است");
  return transaction((tx) =>
    tx.runAsync(
      "UPDATE activities SET name=?,icon=?,updated_at=? WHERE id=?",
      name.trim(),
      icon,
      new Date().toISOString(),
      id,
    ),
  );
}
export async function setActivityArchived(id: number, value: boolean) {
  return transaction((tx) =>
    tx.runAsync(
      "UPDATE activities SET is_archived=?,updated_at=? WHERE id=?",
      value ? 1 : 0,
      new Date().toISOString(),
      id,
    ),
  );
}
export async function getEntriesBetween(start: Date, end: Date) {
  return (await db()).getAllAsync<TimeEntry>(
    "SELECT e.*,a.name activity_name,a.icon activity_icon FROM time_entries e JOIN activities a ON a.id=e.activity_id WHERE period_end>? AND period_start<? ORDER BY period_start DESC",
    start.toISOString(),
    end.toISOString(),
  );
}
