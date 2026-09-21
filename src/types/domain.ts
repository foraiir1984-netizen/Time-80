import type { Activity, AppSettings, TimeEntry } from "./models";
export type { Activity, AppSettings, TimeEntry };
export type SQL = {
  execAsync(sql: string): Promise<void>;
  runAsync(
    sql: string,
    ...params: any[]
  ): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(sql: string, ...params: any[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]>;
};
export type Slot = {
  id: number;
  period_start: string;
  period_end: string;
  duration_minutes: number;
  state: "pending" | "skipped";
  timezone_id: string | null;
  timezone_provenance: string | null;
  created_at: string;
  updated_at: string;
};
export type Assignment = {
  id: number;
  entry_id: number;
  scheme_id: string;
  code: string | null;
  revision: number;
  is_current: number;
  supersedes_id: number | null;
  method: string;
  source_activity_id: number | null;
  default_revision: number | null;
  assigned_at: string;
  reason: string | null;
};
export type TimeContext = {
  entry_id: number;
  timezone_id: string | null;
  utc_offset_start_minutes: number | null;
  provenance: string;
  captured_at: string;
};
export type Selection =
  { mode: "inherit" } | { mode: "explicit"; code: string | null };
export type EntryContext = {
  entry: TimeEntry | null;
  classification: Assignment | null;
  context: TimeContext | null;
};
export type SlotView = {
  period_start: string;
  period_end: string;
  slot: Slot | null;
  entry: TimeEntry | null;
};
export type Anchor = {
  effectiveAt: string;
  anchorLocalDate: string;
  anchorLocalMinute: number;
  resetLocalDate?: string;
  resetLocalMinute?: number;
  timezone: string;
};
export type Node = {
  code: string;
  parent_code: string | null;
  level: number;
  title_en: string;
  title_fa?: string;
};
