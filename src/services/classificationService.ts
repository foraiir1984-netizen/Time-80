import type { Activity } from "../types/domain";
import { getMeta, setMeta } from "../db/metaRepository";
import {
  iconMetaKey,
  ICON_SET,
  ICON_KEYS,
  resolveActivityIcon,
  type IconCommand,
  type IconSnapshot,
} from "../icons/iconModel";
import type { SQL } from "../types/domain";
import { db, transaction, readSnapshot } from "../db/connection";
import { SCHEME } from "./classificationDataset";
export type Default = {
  activity_id: number;
  scheme_id: string;
  code: string | null;
  revision: number;
  updated_at: string;
};
export async function getActivityDefault(id: number) {
  return (await db()).getFirstAsync<Default>(
    "SELECT * FROM activity_classification_defaults WHERE activity_id=? AND scheme_id=?",
    id,
    SCHEME,
  );
}
export async function setActivityDefault(
  id: number,
  code: string | null,
  expected: number | null,
) {
  return transaction((tx) => setActivityDefaultTx(tx, id, code, expected));
}
export async function setActivityDefaultTx(
  tx: SQL,
  id: number,
  code: string | null,
  expected: number | null,
) {
  const old = await tx.getFirstAsync<Default>(
    "SELECT * FROM activity_classification_defaults WHERE activity_id=? AND scheme_id=?",
    id,
    SCHEME,
  );
  if ((old?.revision ?? null) !== expected)
    throw Error("پیش‌فرض تغییر کرده؛ دوباره باز کن");
  if (old && old.code === code) return;
  await tx.runAsync(
    "INSERT INTO activity_classification_defaults VALUES(?,?,?,?,?) ON CONFLICT(activity_id,scheme_id) DO UPDATE SET code=excluded.code,revision=excluded.revision,updated_at=excluded.updated_at",
    id,
    SCHEME,
    code,
    (old?.revision ?? 0) + 1,
    new Date().toISOString(),
  );
}

export async function saveActivity(
  id: number | null,
  name: string,
  command: IconCommand | string,
  code: string | null,
  expected: number | null,
  iconSnapshot?: IconSnapshot,
) {
  if (!name.trim()) throw Error("نام فعالیت لازم است");
  const cmd: IconCommand =
    typeof command === "string"
      ? { kind: "selectLegacy", raw: command }
      : command;
  if (cmd.kind === "selectLegacy" && !cmd.raw.trim())
    throw Error("آیکون لازم است");
  if (
    cmd.kind === "selectAsset" &&
    (cmd.set !== ICON_SET || !ICON_KEYS.includes(cmd.key as any))
  )
    throw Error("آیکون ناشناخته است");
  if (id && !iconSnapshot) throw Error("ابتدا snapshot آیکون را بارگذاری کن");
  return transaction(async (tx) => {
    let legacy = "✨",
      meta: string | null = null;
    if (id) {
      const a = await tx.getFirstAsync<Activity>(
        "SELECT * FROM activities WHERE id=?",
        id,
      );
      if (!a) throw Error("فعالیت موجود نیست");
      legacy = a.icon;
      meta = await getMeta(tx, iconMetaKey(id));
      if (legacy !== iconSnapshot!.legacyRaw || meta !== iconSnapshot!.metaRaw)
        throw Error("آیکون تغییر کرده؛ دوباره باز کن");
    }
    if (cmd.kind === "selectLegacy") legacy = cmd.raw;
    const now = new Date().toISOString();
    if (id)
      await tx.runAsync(
        "UPDATE activities SET name=?,icon=?,updated_at=? WHERE id=?",
        name.trim(),
        legacy,
        now,
        id,
      );
    else
      id = (
        await tx.runAsync(
          "INSERT INTO activities(name,icon,sort_order,created_at,updated_at) VALUES(?,?,(SELECT COALESCE(MAX(sort_order),0)+1 FROM activities),?,?)",
          name.trim(),
          legacy,
          now,
          now,
        )
      ).lastInsertRowId;
    if (cmd.kind === "selectAsset") {
      const resolved = resolveActivityIcon(id, legacy, meta);
      if (resolved.kind !== "asset" || resolved.key !== cmd.key)
        await setMeta(
          tx,
          iconMetaKey(id),
          JSON.stringify({
            v: 1,
            kind: "asset",
            set: ICON_SET,
            key: cmd.key,
            legacyValue: legacy,
          }),
        );
    } else if (cmd.kind === "selectLegacy")
      await tx.runAsync("DELETE FROM app_meta WHERE key=?", iconMetaKey(id));
    await setActivityDefaultTx(tx, id, code, expected);
    return id;
  });
}

export async function getActivityEditorSnapshot(id: number) {
  return readSnapshot(async (tx) => {
    const activity = await tx.getFirstAsync<Activity>(
      "SELECT * FROM activities WHERE id=?",
      id,
    );
    if (!activity) throw Error("فعالیت موجود نیست");
    const metaRaw = await getMeta(tx, iconMetaKey(id));
    const category = await tx.getFirstAsync<Default>(
      "SELECT * FROM activity_classification_defaults WHERE activity_id=? AND scheme_id=?",
      id,
      SCHEME,
    );
    return {
      activity,
      icon: { legacyRaw: activity.icon, metaRaw },
      category,
      iconView: resolveActivityIcon(id, activity.icon, metaRaw),
    };
  });
}
