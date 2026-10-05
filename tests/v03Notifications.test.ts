import { test } from "node:test";
import assert from "node:assert/strict";
import {
  occurrenceId,
  parseNotificationPayload,
  responseKey,
} from "../src/notifications/notificationContracts";
import {
  createResponseCoordinator,
  resolveNotificationTarget,
  type Resolution,
} from "../src/notifications/notificationResponseService";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { reconcileNotifications } from "../src/notifications/scheduler";
import { ensureSlotHorizon } from "../src/services/slotService";
import { applySettingsPatch } from "../src/services/settingsService";
import { state, scheduleNotificationAsync } from "./notifications.mjs";
const end = +new Date("2026-07-01T11:00:00Z"),
  start = end - 1800000,
  schedule = "time80-2-w-4-660";
const data = () => ({
  kind: "time80-checkin",
  payloadVersion: 3,
  scheduleId: schedule,
  occurrenceId: occurrenceId(schedule, end),
  scheduleRevision: "2",
  scheduleTimezone: "UTC",
  periodStart: new Date(start).toISOString(),
  periodEnd: new Date(end).toISOString(),
});
const response = (id = "A") =>
  ({
    actionIdentifier: "expo.modules.notifications.actions.DEFAULT",
    notification: {
      date: 123,
      request: {
        identifier: `time80-test-${id}`,
        content: { data: { kind: "time80-test" } },
      },
    },
  }) as any;
const flush = () => new Promise<void>((r) => setImmediate(r));
test("v3 immutable identity resolves original period independent of click date; v2 absolute and dated compatibility", () => {
  const d = data();
  const parsed = parseNotificationPayload(d, d.occurrenceId, end + 86400000);
  assert.equal(parsed.kind, "parsed");
  assert.equal(
    parseNotificationPayload(
      { ...d, scheduleRevision: "old" },
      d.occurrenceId,
      end + 1,
    ).kind,
    "parsed",
  );
  assert.equal(
    parseNotificationPayload(
      {
        kind: "time80-checkin",
        payloadVersion: 2,
        time80OccurrenceEnd: end,
        intervalMinutes: 30,
      },
      schedule,
      end + 1,
    ).kind,
    "parsed",
  );
  assert.equal(
    parseNotificationPayload(
      {
        kind: "time80-checkin",
        periodStart: d.periodStart,
        periodEnd: d.periodEnd,
      },
      schedule,
      end + 1,
    ).kind,
    "parsed",
  );
  assert.notEqual(
    occurrenceId(schedule, end),
    occurrenceId(schedule, end + 7 * 86400000),
  );
});
test("unknown, malformed, conflicting and future payloads return typed unresolved without guessing", () => {
  const d = data();
  for (const change of [
    { payloadVersion: 4 },
    { scheduleTimezone: "bad/zone" },
    { periodStart: "yesterday" },
    { occurrenceId: "wrong" },
    { intervalMinutes: 60 },
    { time80OccurrenceEnd: end + 1 },
  ])
    assert.equal(
      parseNotificationPayload({ ...d, ...change }, d.occurrenceId, end + 1)
        .kind,
      "unresolved",
    );
  assert.deepEqual(parseNotificationPayload(d, d.occurrenceId, end - 1), {
    kind: "unresolved",
    reason: "future-period",
  });
  assert.deepEqual(
    parseNotificationPayload(
      { kind: "time80-checkin", payloadVersion: 2 },
      schedule,
      end + 1,
    ),
    { kind: "unresolved", reason: "ambiguous-occurrence" },
  );
});
test("read-only resolver handles original ledger period, missing/future/conflicting and skipped targets", async () => {
  await initDatabase();
  const tx = await db(),
    d = data();
  await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,30,'skipped',?,?)",
    d.periodStart,
    d.periodEnd,
    d.periodStart,
    d.periodStart,
  );
  const before = await tx.getAllAsync("SELECT * FROM app_meta ORDER BY key"),
    slots = await tx.getAllAsync("SELECT * FROM expected_slots ORDER BY id");
  const n = {
    request: { identifier: d.occurrenceId, content: { data: d } },
  } as any;
  const result = await resolveNotificationTarget(n);
  assert.equal(result.kind, "resolved");
  if (result.kind === "resolved") assert.equal(result.entryState, "skipped");
  await resolveNotificationTarget({
    ...n,
    request: { ...n.request, content: { data: { ...d, payloadVersion: 99 } } },
  });
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM app_meta ORDER BY key"),
    before,
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM expected_slots ORDER BY id"),
    slots,
  );
  assert.equal((await tx.getAllAsync("SELECT * FROM time_entries")).length, 0);
});
test("cold/listener duplicate and before-ready A/B produce one route each and do not lose the second response", async () => {
  const routed: string[] = [],
    acked: string[] = [];
  const a = response("A"),
    b = response("B");
  a.notification.request.content.data.kind = "time80-checkin";
  b.notification.request.content.data.kind = "time80-checkin";
  const c = createResponseCoordinator({
    resolve: async (n) => ({
      kind: "unresolved",
      reason: n.request.identifier,
    }),
    route: async (r) => {
      routed.push((r as any).reason);
    },
    dismiss: async () => {},
    ack: async (key) => {
      acked.push(key);
    },
    error: (e) => {
      throw e;
    },
  });
  c.enqueue(a);
  c.enqueue(a);
  c.enqueue(b);
  assert.equal(c.size(), 2);
  assert.equal(routed.length, 0);
  c.setReady(true);
  await flush();
  assert.deepEqual(routed, ["time80-test-A", "time80-test-B"]);
  assert.equal(acked.length, 2);
  c.enqueue(a);
  await flush();
  assert.equal(routed.length, 2);
});
test("startup/resolve failure remains retryable; accepted navigation is not repeated after cleanup failure", async () => {
  let failResolve = true,
    failDismiss = true,
    routes = 0,
    errors = 0;
  const a = response();
  a.notification.request.content.data.kind = "time80-checkin";
  const c = createResponseCoordinator({
    resolve: async () => {
      if (failResolve) throw Error("startup");
      return { kind: "unresolved", reason: "missing-slot" };
    },
    route: async () => {
      routes++;
    },
    dismiss: async () => {
      if (failDismiss) throw Error("dismiss");
    },
    ack: async () => {},
    error: () => {
      errors++;
    },
  });
  c.enqueue(a);
  c.setReady(true);
  await flush();
  assert.equal(routes, 0);
  assert.equal(c.size(), 1);
  failResolve = false;
  await c.retry();
  assert.equal(routes, 1);
  failDismiss = false;
  await c.retry();
  assert.equal(routes, 1);
  assert.equal(c.size(), 0);
  assert.equal(errors, 2);
});
test("diagnostic response cleans up without resolving or routing", async () => {
  let dismiss = 0,
    ack = 0;
  const c = createResponseCoordinator({
    resolve: async () => {
      throw Error("must not resolve");
    },
    route: async () => {
      throw Error("must not route");
    },
    dismiss: async () => {
      dismiss++;
    },
    ack: async () => {
      ack++;
    },
    error: (e) => {
      throw e;
    },
  });
  c.enqueue(response());
  c.setReady(true);
  await flush();
  assert.equal(dismiss, 1);
  assert.equal(ack, 1);
});
test("occurrence/action dedupe keys differ for A/B and normalize absolute v2 occurrence", () => {
  const a = response(),
    b = response();
  a.notification.request.content.data = {
    kind: "time80-checkin",
    occurrenceId: "A",
  };
  b.notification.request.content.data = {
    kind: "time80-checkin",
    occurrenceId: "B",
  };
  assert.notEqual(responseKey(a), responseKey(b));
  b.notification.request.content.data = {
    kind: "time80-checkin",
    occurrenceId: { bad: true },
  };
  assert.doesNotThrow(() => responseKey(b));
});
test("manual stale-cache repair actually calls scheduling even when all identifiers remain; partial failure retries cleanly", async () => {
  await ensureSlotHorizon();
  await applySettingsPatch({ notification_enabled: 1 });
  await reconcileNotifications("manual");
  const before = state.created;
  state.os.clear();
  await reconcileNotifications("manual");
  assert.ok(state.created > before);
  assert.equal(state.os.size, state.scheduled.size);
  state.failAfter = state.created + 2;
  await assert.rejects(reconcileNotifications("manual"), /Injected/);
  state.failAfter = Infinity;
  await reconcileNotifications("manual");
  assert.equal(new Set(state.scheduled.keys()).size, state.scheduled.size);
});

test("capability adapter reports unknown native capabilities and preserves owned-only v2 Expo scheduling outside Android", async () => {
  const { execFileSync } = await import("node:child_process");
  execFileSync(
    process.execPath,
    [
      "--import",
      "./tests/register.mjs",
      "--import",
      "tsx",
      "--input-type=commonjs",
      "-e",
      `
 const assert=require('node:assert/strict');
 const {Platform}=require('./tests/react-native.mjs');
 const N=require('./tests/notifications.mjs');
 const A=require('./src/notifications/notificationPlatform.ts');
 (async()=>{
 const caps=await A.readNotificationCapabilities('test');assert.equal(caps.exactAlarmAllowed.value,null);assert.equal(caps.exactAlarmAllowed.supported,false);
 await assert.rejects(A.applyOwnedPlan([],'g',true,'UTC','2027-01-01T00:00:00Z'));
 Platform.OS='ios';
 for(const identifier of ['unrelated','time80-test-1','time80-occ-v3:A','time80-old'])await N.scheduleNotificationAsync({identifier,content:{data:{}},trigger:{type:'date'}});
 await A.applyOwnedPlan([{identifier:'time80-new',content:{data:{kind:'time80-checkin',payloadVersion:3}},trigger:{type:'date',timestamp:1}}],'g',true,'UTC','2027-01-01T00:00:00Z');
 for(const id of ['unrelated','time80-test-1','time80-occ-v3:A'])assert.ok(N.state.scheduled.has(id));
 assert.equal(N.state.scheduled.has('time80-old'),false);assert.equal(N.state.scheduled.get('time80-new').content.data.payloadVersion,2);
 const a='time80-occ-v3:1:x:1',b='time80-occ-v3:1:x:2';N.state.presented.set(a,{});N.state.presented.set(b,{});const scheduled=[...N.state.os];
 await A.dismissTappedOccurrence({notification:{request:{identifier:a,content:{data:{kind:'time80-checkin',payloadVersion:3,occurrenceId:a}}}}});
 assert.deepEqual(N.state.dismissed,[a]);assert.ok(N.state.presented.has(b));assert.deepEqual([...N.state.os],scheduled);
 await A.dismissTappedOccurrence({notification:{request:{identifier:'time80-new',content:{data:{kind:'time80-checkin',payloadVersion:2}}}}});assert.deepEqual(N.state.dismissed,[a]);

 })().catch(e=>{console.error(e);process.exitCode=1;});
 `,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, TIME80_REAL_PLATFORM_TEST: "1" },
      stdio: "pipe",
    },
  );
});

test("disabling notifications cancels only owned future schedules and preserves user records and durable icon metadata", async () => {
  const tx = await db(),
    tables = [
      "activities",
      "time_entries",
      "entry_classifications",
      "entry_time_context",
    ];
  await tx.runAsync(
    "INSERT INTO app_meta VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    "activity_icon_ref:v1:999999",
    "unknown durable selection",
  );
  const before = await Promise.all(
    tables.map((t) => tx.getAllAsync(`SELECT * FROM ${t} ORDER BY rowid`)),
  );
  for (const identifier of [
    "unrelated",
    "time80-test-protected",
    "time80-occ-v3:protected",
  ])
    await scheduleNotificationAsync({
      identifier,
      content: { data: {} },
      trigger: { type: "date" },
    });
  await applySettingsPatch({ notification_enabled: 0 });
  await reconcileNotifications("manual");
  assert.deepEqual(
    [...state.scheduled.keys()].sort(),
    ["unrelated", "time80-test-protected", "time80-occ-v3:protected"].sort(),
  );
  assert.deepEqual(
    await Promise.all(
      tables.map((t) => tx.getAllAsync(`SELECT * FROM ${t} ORDER BY rowid`)),
    ),
    before,
  );
  assert.equal(
    (await tx.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key=?",
      "activity_icon_ref:v1:999999",
    ))!.value,
    "unknown durable selection",
  );
});
