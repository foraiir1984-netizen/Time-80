import { test } from "node:test";
import assert from "node:assert/strict";
import { state } from "./notifications.mjs";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { getMeta } from "../src/db/metaRepository";
import { applySettingsPatch } from "../src/services/settingsService";
import { ensureSlotHorizon } from "../src/services/slotService";
import {
  reconcileNotifications,
  resolveNotificationPeriod,
} from "../src/notifications/scheduler";
import { notificationPlan } from "../src/notifications/plan";
import type { AppSettings } from "../src/types/domain";

test("OS partial failure remains dirty and reconciles without duplicates; disabling cancels owned alarms", async () => {
  await initDatabase();
  await ensureSlotHorizon();
  await applySettingsPatch({ notification_enabled: 1 });
  state.scheduled.set("other-app", { identifier: "other-app", content: {} });
  state.failAfter = 2;
  await assert.rejects(reconcileNotifications(), /Injected/);
  assert.equal(await getMeta(await db(), "schedule_dirty"), "true");
  state.failAfter = Infinity;
  await reconcileNotifications();
  const n = state.scheduled.size;
  await reconcileNotifications();
  assert.equal(state.scheduled.size, n);
  assert.equal(await getMeta(await db(), "schedule_dirty"), "false");
  state.granted = false;
  await assert.rejects(reconcileNotifications(), /مجوز/);
  assert.equal(await getMeta(await db(), "schedule_dirty"), "true");
  await applySettingsPatch({ notification_enabled: 0 });
  await reconcileNotifications();
  assert.deepEqual([...state.scheduled.keys()], ["other-app"]);
});

test("day-start change uses dated transition only until next full day and then persistent weekly triggers", () => {
  const s: AppSettings = {
    notification_enabled: 1,
    interval_minutes: 60,
    day_start: "09:00",
    day_end: "23:00",
    active_days: [1, 2, 3, 4, 5, 6, 7],
    sound_enabled: 1,
    vibration_enabled: 1,
  };
  const anchor = {
    effectiveAt: "2026-02-01T10:30:00.000Z",
    anchorLocalDate: "2026-02-01",
    anchorLocalMinute: 630,
    timezone: "UTC",
    resetLocalDate: "2026-02-02",
    resetLocalMinute: 540,
  };
  const plan = notificationPlan(
    s,
    anchor,
    new Date("2026-02-01T10:15:00Z"),
    null,
  );
  assert.ok(plan.some((p) => p.date === "2026-02-01T11:30:00.000Z"));
  assert.ok(plan.filter((p) => !p.date).every((p) => p.minute === 0));
  assert.ok(
    plan
      .filter((p) => !p.date)
      .every(
        (p) =>
          Number(p.data.time80NotBefore) >= +new Date("2026-02-02T00:00:00Z"),
      ),
  );
});

test("delayed weekly notification resolves absolute scheduled occurrence; ambiguous old payload opens backlog", async () => {
  const conn = await db();
  const start = "2026-01-20T10:00:00.000Z",
    end = "2026-01-20T10:30:00.000Z";
  await conn.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,30,?,?)",
    start,
    end,
    start,
    start,
  );
  const base = {
    date: +new Date("2026-01-21T10:31:00Z"),
    request: {
      identifier: "test",
      content: {
        data: {
          kind: "time80-checkin",
          intervalMinutes: 30,
          fireHour: 10,
          fireMinute: 30,
          time80OccurrenceEnd: +new Date(end),
        },
      },
    },
  };
  assert.equal(
    (await resolveNotificationPeriod(base as any))?.period_start,
    start,
  );
  delete (base.request.content.data as any).time80OccurrenceEnd;
  assert.equal(await resolveNotificationPeriod(base as any), null);
});
