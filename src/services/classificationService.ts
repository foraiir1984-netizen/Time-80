import type { SQL } from "../types/domain";
import { db, transaction } from "../db/connection";
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
  icon: string,
  code: string | null,
  expected: number | null,
) {
  if (!name.trim() || !icon.trim()) throw Error("نام و آیکون لازم است");
  return transaction(async (tx) => {
    const now = new Date().toISOString();
    if (id) {
      await tx.runAsync(
        "UPDATE activities SET name=?,icon=?,updated_at=? WHERE id=?",
        name.trim(),
        icon,
        now,
        id,
      );
    } else {
      id = (
        await tx.runAsync(
          "INSERT INTO activities(name,icon,sort_order,created_at,updated_at) VALUES(?,?,(SELECT COALESCE(MAX(sort_order),0)+1 FROM activities),?,?)",
          name.trim(),
          icon,
          now,
          now,
        )
      ).lastInsertRowId;
    }
    await setActivityDefaultTx(tx, id, code, expected);
    return id;
  });
}
