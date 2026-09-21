export type Activity = {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

export type TimeEntry = {
  id: number;
  activity_id: number;
  period_start: string;
  period_end: string;
  duration_minutes: number;
  recorded_at: string;
  source: "notification" | "manual";
  status: "logged" | "missed" | "skipped";
  activity_name?: string;
  activity_icon?: string;
};

export type AppSettings = {
  notification_enabled: number;
  interval_minutes: number;
  day_start: string;
  day_end: string;
  active_days: number[];
  sound_enabled: number;
  vibration_enabled: number;
};

export type InsightRow = {
  activity_id: number;
  activity_name: string;
  activity_icon: string;
  minutes: number;
};

export type CheckInPeriod = {
  start: Date;
  end: Date;
  source: "notification" | "manual";
};
