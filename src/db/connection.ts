import * as SQLite from "expo-sqlite";
import type { SQL } from "../types/domain";
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
export const db = () => (connection ??= SQLite.openDatabaseAsync("time80.db"));
let tail: Promise<unknown> = Promise.resolve();
export function serialized<T>(work: () => Promise<T>): Promise<T> {
  const result = tail.then(work);
  tail = result.catch(() => {});
  return result;
}
export function transaction<T>(work: (tx: SQL) => Promise<T>): Promise<T> {
  return serialized(async () => atomic(await db(), work));
}
export function readSnapshot<T>(work: (tx: SQL) => Promise<T>): Promise<T> {
  return serialized(async () => {
    const conn = await db();
    await conn.execAsync("BEGIN DEFERRED");
    try {
      const result = await work(conn);
      await conn.execAsync("COMMIT");
      return result;
    } catch (e) {
      await conn.execAsync("ROLLBACK");
      throw e;
    }
  });
}

// Keep foreign_keys enabled on the same connection used for writes. Expo's exclusive
// helper opens a different connection, whose PRAGMAs are not inherited.
export async function atomic<T>(
  conn: SQL,
  work: (tx: SQL) => Promise<T>,
): Promise<T> {
  await conn.execAsync("BEGIN IMMEDIATE");
  try {
    const result = await work(conn);
    await conn.execAsync("COMMIT");
    return result;
  } catch (e) {
    await conn.execAsync("ROLLBACK");
    throw e;
  }
}
