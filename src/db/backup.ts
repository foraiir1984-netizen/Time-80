import * as SQLite from "expo-sqlite";
export async function createPreMigrationBackup(conn: SQLite.SQLiteDatabase) {
  const name = `time80-backup-${Date.now()}.db`,
    dest = await SQLite.openDatabaseAsync(name);
  try {
    await SQLite.backupDatabaseAsync({
      sourceDatabase: conn,
      destDatabase: dest,
    });
    const check = await dest.getFirstAsync<{ integrity_check: string }>(
      "PRAGMA integrity_check",
    );
    if (check?.integrity_check !== "ok") throw Error("نسخهٔ پشتیبان سالم نیست");
    return name;
  } finally {
    await dest.closeAsync();
  }
}
