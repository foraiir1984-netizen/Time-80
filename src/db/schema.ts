export const SCHEMA_VERSION = 3;
export const BASELINE_ID = "time80-v0.2-icatus2016-schema3";
export const SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER NOT NULL,
  period_start TEXT NOT NULL UNIQUE,
  period_end TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  recorded_at TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('notification','manual')),
  status TEXT NOT NULL DEFAULT 'logged' CHECK(status IN ('logged','missed','skipped')),
  FOREIGN KEY(activity_id) REFERENCES activities(id)
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  notification_enabled INTEGER NOT NULL DEFAULT 0,
  interval_minutes INTEGER NOT NULL DEFAULT 30,
  day_start TEXT NOT NULL DEFAULT '08:00',
  day_end TEXT NOT NULL DEFAULT '23:00',
  active_days TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
  sound_enabled INTEGER NOT NULL DEFAULT 1,
  vibration_enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expo_notification_id TEXT NOT NULL UNIQUE,
  weekday INTEGER NOT NULL,
  fire_time TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (id) VALUES (1);

CREATE TABLE expected_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start TEXT NOT NULL UNIQUE,
  period_end TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK(state IN ('pending','skipped')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK(period_end > period_start)
);
CREATE INDEX idx_expected_slots_state_end
  ON expected_slots(state, period_end);
CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- این قطعه به همراه چهار جدول پایه و DDL بخش ۱۵.۲، baseline نصب تازه را می‌سازد.
-- فقط runner پس از validation کامل user_version=3 را ثبت می‌کند.

ALTER TABLE expected_slots ADD COLUMN timezone_id TEXT;
ALTER TABLE expected_slots ADD COLUMN timezone_provenance TEXT
  CHECK (timezone_provenance IS NULL OR timezone_provenance IN
    ('captured_at_slot_creation','user_confirmed','unknown'));

CREATE TABLE classification_schemes (
  scheme_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  revision TEXT NOT NULL,
  source_url TEXT NOT NULL,
  dataset_sha256 TEXT NOT NULL CHECK(length(dataset_sha256)=64),
  installed_at TEXT NOT NULL
);
CREATE TABLE classification_nodes (
  scheme_id TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_code TEXT,
  level INTEGER NOT NULL CHECK(level IN (1,2,3)),
  title_en TEXT NOT NULL,
  title_fa TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(scheme_id,code),
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,parent_code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT,
  CHECK((level=1 AND parent_code IS NULL) OR (level IN (2,3) AND parent_code IS NOT NULL))
);
CREATE TABLE activity_classification_defaults (
  activity_id INTEGER NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT,
  revision INTEGER NOT NULL CHECK(revision>=1),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(activity_id,scheme_id),
  FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT
);
CREATE TABLE entry_classifications (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT,
  revision INTEGER NOT NULL CHECK(revision>=1),
  is_current INTEGER NOT NULL CHECK(is_current IN (0,1)),
  supersedes_id INTEGER,
  method TEXT NOT NULL CHECK(method IN
    ('inherited_default','user_selected','user_reclassified','unmapped')),
  source_activity_id INTEGER,
  default_revision INTEGER,
  assigned_at TEXT NOT NULL,
  reason TEXT,
  UNIQUE(entry_id,scheme_id,revision),
  FOREIGN KEY(entry_id) REFERENCES time_entries(id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT,
  FOREIGN KEY(source_activity_id) REFERENCES activities(id) ON DELETE RESTRICT,
  FOREIGN KEY(supersedes_id) REFERENCES entry_classifications(id) ON DELETE RESTRICT,
  CHECK((code IS NULL AND method='unmapped') OR
        (code IS NOT NULL AND method<>'unmapped')),
  CHECK((method='inherited_default' AND source_activity_id IS NOT NULL
      AND default_revision IS NOT NULL AND default_revision>=1) OR
        (method<>'inherited_default' AND source_activity_id IS NULL
      AND default_revision IS NULL)),
  CHECK((revision=1 AND supersedes_id IS NULL) OR
        (revision>1 AND supersedes_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_entry_classification_current
  ON entry_classifications(entry_id,scheme_id) WHERE is_current=1;
CREATE INDEX idx_entry_classification_report
  ON entry_classifications(scheme_id,is_current,code,entry_id);
CREATE TABLE entry_time_context (
  entry_id INTEGER PRIMARY KEY,
  timezone_id TEXT,
  utc_offset_start_minutes INTEGER,
  provenance TEXT NOT NULL CHECK(provenance IN
    ('captured_at_slot_creation','user_confirmed','unknown')),
  captured_at TEXT NOT NULL,
  FOREIGN KEY(entry_id) REFERENCES time_entries(id) ON DELETE RESTRICT,
  CHECK((provenance='unknown' AND timezone_id IS NULL AND utc_offset_start_minutes IS NULL)
    OR (provenance<>'unknown' AND timezone_id IS NOT NULL AND utc_offset_start_minutes IS NOT NULL))
);
`;
