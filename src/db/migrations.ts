import fingerprint from "./schemaFingerprint.json";
import * as Crypto from "expo-crypto";
import { SCHEMA_SQL, SCHEMA_VERSION, BASELINE_ID } from "./schema";
import { db, serialized, atomic } from "./connection";
import { getMeta, setMeta } from "./metaRepository";
import {
  dataset,
  translation,
  nodes,
  SCHEME,
} from "../services/classificationDataset";
import type { SQL } from "../types/domain";
const names = [
  "activities",
  "time_entries",
  "settings",
  "scheduled_notifications",
  "expected_slots",
  "app_meta",
  "classification_schemes",
  "classification_nodes",
  "activity_classification_defaults",
  "entry_classifications",
  "entry_time_context",
];
export async function detectSchema(tx: SQL) {
  const rows = await tx.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  );
  if (!rows.length) return "empty";
  const v = await tx.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if (v?.user_version !== SCHEMA_VERSION) return "legacy";
  if (
    names.some((n) => !rows.some((r) => r.name === n)) ||
    (await getMeta(tx, "baseline_id")) !== BASELINE_ID
  )
    return "unsupported";
  const definitions = await tx.getAllAsync<{ name: string; sql: string }>(
    "SELECT name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'",
  );
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  if (
    Object.entries(fingerprint).some(
      ([name, sql]) =>
        normalize(definitions.find((r) => r.name === name)?.sql ?? "") !==
        normalize(sql),
    )
  )
    return "unsupported";
  return "current";
}
export async function runMigrations() {
  return serialized(async () => {
    const conn = await db();
    await conn.execAsync("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    const kind = await detectSchema(conn);
    if (kind === "legacy" || kind === "unsupported")
      throw Error(
        "این دیتابیس با نسخهٔ ۰.۲ سازگار نیست. داده‌ای پاک نشده است. برای انتقال از نسخهٔ آزمایشی ۰.۱، نصب تازه لازم است.",
      );
    if (kind === "current") {
      if ((await getMeta(conn, "active_classification_scheme_id")) !== SCHEME)
        throw Error("طرح طبقه‌بندی فعال ناشناخته است");
      const bad = await conn.getAllAsync("PRAGMA foreign_key_check");
      if (bad.length)
        throw Error("ارتباط داده‌ها ناسازگار است؛ هیچ reset انجام نشد.");
      return;
    }
    for (const d of [dataset, translation])
      if (
        (await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          d.canonical,
        )) !== d.sha256
      )
        throw Error("بستهٔ مرجع تغییر کرده است");
    await atomic(conn, async (tx) => {
      await tx.execAsync(SCHEMA_SQL);
      const now = new Date().toISOString();
      await tx.runAsync(
        "INSERT INTO classification_schemes VALUES(?,?,?,?,?,?,?)",
        SCHEME,
        "ICATUS",
        dataset.edition,
        dataset.revision,
        dataset.source_url,
        dataset.sha256,
        now,
      );
      for (const n of nodes)
        await tx.runAsync(
          "INSERT INTO classification_nodes VALUES(?,?,?,?,?,?,?)",
          SCHEME,
          n.code,
          n.parent_code,
          n.level,
          n.title_en,
          n.title_fa ?? null,
          Number(n.code),
        );
      const activities = [
        ["مطالعه", "📚"],
        ["کار", "💼"],
        ["خانواده", "👨‍👩‍👦"],
        ["ورزش", "🏃"],
        ["موبایل / شبکه اجتماعی", "📱"],
        ["سرگرمی", "🎬"],
        ["رفت‌وآمد", "🚗"],
        ["استراحت", "😴"],
      ];
      for (const [i, a] of activities.entries())
        await tx.runAsync(
          "INSERT INTO activities(name,icon,sort_order,created_at,updated_at) VALUES(?,?,?,?,?)",
          a[0]!,
          a[1]!,
          i,
          now,
          now,
        );
      const metadata: Record<string, string> = {
        baseline_id: BASELINE_ID,
        first_used_at: now,
        ledger_started_at: now,
        onboarding_completed: "false",
        slot_horizon_end: now,
        schedule_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        schedule_revision: "0",
        schedule_dirty: "true",
        report_calendar: "persian",
        report_week_start: "7",
        active_classification_scheme_id: SCHEME,
        icatus_fa_translation_manifest: JSON.stringify({
          version: translation.version,
          sha256: translation.sha256,
          locale: "fa",
        }),
      };
      for (const [k, v] of Object.entries(metadata)) await setMeta(tx, k, v);
      if ((await tx.getAllAsync("PRAGMA foreign_key_check")).length)
        throw Error("خطای schema");
      await tx.execAsync("PRAGMA user_version=3");
    });
  });
}
