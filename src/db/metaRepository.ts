import type { SQL } from "../types/domain";
export async function getMeta(tx: SQL, key: string) {
  return (
    (
      await tx.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_meta WHERE key=?",
        key,
      )
    )?.value ?? null
  );
}
export async function setMeta(tx: SQL, key: string, value: string) {
  await tx.runAsync(
    "INSERT INTO app_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    key,
    value,
  );
}
