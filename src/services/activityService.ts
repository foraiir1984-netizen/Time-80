import { getMeta } from "../db/metaRepository";
import { iconMetaKey } from "../icons/iconModel";
import { readSnapshot, transaction } from "../db/connection";
import type { Activity, SQL } from "../types/domain";
import { zoned, iso, timezone } from "../utils/slots";
import { attachActivityIcons } from "../icons/iconRepository";
export async function getRankedActivities(now = new Date(), zone = timezone()) {
  if (!Number.isFinite(+now)) throw Error("زمان نامعتبر است");
  const start = iso(zoned(now, zone).startOfDay().subtract({ days: 6 }));
  return readSnapshot(async (tx) => ({
    allActivities: await attachActivityIcons(
      tx,
      await tx.getAllAsync<Activity>(
        `SELECT a.* FROM activities a LEFT JOIN (SELECT activity_id,COUNT(*) usage_count FROM time_entries WHERE status='logged' AND julianday(period_start)>=julianday(?) AND julianday(period_start)<=julianday(?) AND julianday(period_start)<julianday(period_end) AND julianday(period_end)<=julianday(?) GROUP BY activity_id) u ON u.activity_id=a.id WHERE a.is_archived=0 ORDER BY COALESCE(u.usage_count,0) DESC,a.sort_order ASC,a.id ASC`,
        start,
        now.toISOString(),
        now.toISOString(),
      ),
    ),
  }));
}
const activityState = (a: Activity) =>
  JSON.stringify([
    a.id,
    a.name,
    a.icon,
    a.sort_order,
    a.is_archived,
    a.created_at,
    a.updated_at,
  ]);
async function archiveState(tx: SQL, a: Activity) {
  const category = await tx.getFirstAsync<{ revision: number }>(
    "SELECT revision FROM activity_classification_defaults WHERE activity_id=?",
    a.id,
  );
  return JSON.stringify([
    activityState(a),
    await getMeta(tx, iconMetaKey(a.id)),
    category?.revision ?? null,
  ]);
}
export type ArchiveUndo = { id: number; expected: string; deadline: number };
async function activity(tx: SQL, id: number) {
  const a = await tx.getFirstAsync<Activity>(
    "SELECT * FROM activities WHERE id=?",
    id,
  );
  if (!a) throw Error("فعالیت موجود نیست");
  return a;
}
export async function archiveActivity(expected: Activity) {
  return transaction(async (tx) => {
    const a = await activity(tx, expected.id);
    if (activityState(a) !== activityState(expected) || a.is_archived)
      throw Error("فعالیت تغییر کرده؛ دوباره باز کن");
    await tx.runAsync(
      "UPDATE activities SET is_archived=1,updated_at=? WHERE id=?",
      new Date().toISOString(),
      a.id,
    );
    return {
      id: a.id,
      expected: await archiveState(tx, await activity(tx, a.id)),
      deadline: performance.now() + 10000,
    } as ArchiveUndo;
  });
}
export async function undoActivityArchive(token: ArchiveUndo) {
  return transaction(async (tx) => {
    if (
      performance.now() > token.deadline ||
      (await archiveState(tx, await activity(tx, token.id))) !== token.expected
    )
      throw Error("امکان واگرد این تغییر دیگر وجود ندارد");
    await tx.runAsync(
      "UPDATE activities SET is_archived=0,updated_at=? WHERE id=?",
      new Date().toISOString(),
      token.id,
    );
  });
}

export async function restoreActivity(expected: Activity) {
  return transaction(async (tx) => {
    const a = await activity(tx, expected.id);
    if (!a.is_archived || activityState(a) !== activityState(expected))
      throw Error("فعالیت تغییر کرده؛ دوباره باز کن");
    await tx.runAsync(
      "UPDATE activities SET is_archived=0,updated_at=? WHERE id=?",
      new Date().toISOString(),
      a.id,
    );
  });
}
