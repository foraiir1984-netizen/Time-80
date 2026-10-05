/** @type {{match:string|null,remaining:number}} */
export const readFailures = { match: null, remaining: 0 };
function fail(sql) {
  if (
    readFailures.remaining > 0 &&
    readFailures.match &&
    sql.includes(readFailures.match)
  ) {
    readFailures.remaining--;
    throw Error("Injected read failure");
  }
}
import { DatabaseSync, backup } from "node:sqlite";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const paths = new Map();

export async function openDatabaseAsync(name = "time80.db") {
  let database = new DatabaseSync(paths.get(name) ?? ":memory:");
  const db = {
    get __native() {
      return database;
    },
    __replace(path) {
      database.close();
      paths.set(name, path);
      database = new DatabaseSync(path);
    },
    closeAsync: async () => database.close(),
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
    getAllAsync: async (sql, ...args) => {
      fail(sql);
      return database
        .prepare(sql)
        .all(...args)
        .map((x) => ({ ...x }));
    },
    getFirstAsync: async (sql, ...args) => {
      fail(sql);
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

export async function backupDatabaseAsync({ sourceDatabase, destDatabase }) {
  const dir = mkdtempSync(join(tmpdir(), "time80-backup-test-")),
    path = join(dir, "backup.db");
  await backup(sourceDatabase.__native, path);
  destDatabase.__replace(path);
}
