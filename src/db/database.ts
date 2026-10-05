import { loadIconMetadata } from "../icons/iconRepository";
import { resolveActivityIcon, iconMetaKey } from "../icons/iconModel";
import { attachActivityIcons } from "../icons/iconRepository";
import {
  saveActivity,
  getActivityEditorSnapshot,
} from "../services/classificationService";
import { db, transaction, readSnapshot } from "./connection";
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
  return readSnapshot(async (tx) =>
    attachActivityIcons(
      tx,
      await tx.getAllAsync<Activity>(
        `SELECT * FROM activities ${includeArchived ? "" : "WHERE is_archived=0"} ORDER BY sort_order,id`,
      ),
    ),
  );
}
export async function createActivity(name: string, icon: string) {
  return {
    lastInsertRowId: await saveActivity(
      null,
      name,
      { kind: "selectLegacy", raw: icon },
      null,
      null,
    ),
    changes: 1,
  };
}
export async function updateActivity(id: number, name: string, icon: string) {
  const s = await getActivityEditorSnapshot(id);
  await saveActivity(
    id,
    name,
    icon === s.activity.icon
      ? { kind: "keep" }
      : { kind: "selectLegacy", raw: icon },
    s.category?.code ?? null,
    s.category?.revision ?? null,
    s.icon,
  );
  return { lastInsertRowId: id, changes: 1 };
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
  return readSnapshot(async (tx) => {
    const entries = await tx.getAllAsync<TimeEntry>(
      "SELECT e.*,a.name activity_name,a.icon activity_icon FROM time_entries e JOIN activities a ON a.id=e.activity_id WHERE period_end>? AND period_start<? ORDER BY period_start DESC",
      start.toISOString(),
      end.toISOString(),
    );
    const meta = await loadIconMetadata(tx);
    for (const e of entries)
      e.activity_icon_view = resolveActivityIcon(
        e.activity_id,
        e.activity_icon ?? "",
        meta.get(iconMetaKey(e.activity_id)) ?? null,
      );
    return entries;
  });
}
