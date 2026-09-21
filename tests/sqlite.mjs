import { DatabaseSync } from "node:sqlite";
export async function openDatabaseAsync() {
  const database = new DatabaseSync(":memory:");
  const db = {
    execAsync: async (sql) => {
      database.exec(sql);
    },
    runAsync: async (sql, ...args) => {
      const r = database.prepare(sql).run(...args);
      return {
        changes: Number(r.changes),
        lastInsertRowId: Number(r.lastInsertRowid),
      };
    },
    getAllAsync: async (sql, ...args) =>
      database
        .prepare(sql)
        .all(...args)
        .map((x) => ({ ...x })),
    getFirstAsync: async (sql, ...args) => {
      const r = database.prepare(sql).get(...args);
      return r ? { ...r } : null;
    },
    withExclusiveTransactionAsync: async (fn) => {
      database.exec("BEGIN");
      try {
        await fn(db);
        database.exec("COMMIT");
      } catch (e) {
        database.exec("ROLLBACK");
        throw e;
      }
    },
  };
  return db;
}
