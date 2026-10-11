import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import App from "../App";
import { Button } from "../src/components/Ui";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { setMeta } from "../src/db/metaRepository";
import { readFailures } from "./sqlite.mjs";
import { state, emitNotificationResponse } from "./notifications.mjs";
import { responseIO } from "./notificationPlatform.mjs";
import { navigationState } from "./app-navigation.mjs";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const tick = () => new Promise<void>((r) => setImmediate(r));
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const retry = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Button)
    .find((b) => b.props.title === "تلاش دوباره برای بازکردن اعلان")!;
const response = (id: string, diagnostic = true) =>
  ({
    actionIdentifier: "default",
    notification: {
      date: 1,
      request: {
        identifier: `time80-${id}`,
        content: {
          data: { kind: diagnostic ? "time80-test" : "time80-checkin" },
        },
      },
    },
  }) as any;
function deferred<T = void>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
async function setup() {
  readFailures.match = null;
  readFailures.remaining = 0;
  navigationState.ready = true;
  navigationState.autoReady = true;
  navigationState.dispatches = [];
  navigationState.dispatch = null;
  responseIO.pending = async () => [];
  responseIO.dismiss = async () => {};
  responseIO.ack = async () => {};
  state.granted = false;
  state.failAfter = Infinity;
  await initDatabase();
  await setMeta(await db(), "onboarding_completed", "true");
  await (await db()).runAsync("UPDATE settings SET notification_enabled=1");
}
async function mount() {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(<App />);
    for (let i = 0; i < 10; i++) await tick();
  });
  return r;
}
async function run(fn: () => unknown) {
  await act(async () => {
    fn();
    for (let i = 0; i < 4; i++) await tick();
  });
}
async function dispose(r: ReactTestRenderer) {
  await act(async () => r.unmount());
}
const permissionError = "تنظیمات ذخیره شد؛ مجوز اعلان داده نشده است";

test("real App X75 handler renders empty feedback and preserves independent reconcile error", async () => {
  await setup();
  const r = await mount();
  assert.ok(text(r).includes(permissionError));
  assert.ok(text(r).includes("X75"));
  await run(retry(r).props.onPress);
  assert.ok(text(r).includes("پاسخ اعلانی برای تلاش دوباره در صف نیست."));
  assert.ok(text(r).includes(permissionError));
  assert.equal(navigationState.dispatches.length, 0);
  await dispose(r);
});

test("not-ready X75 feedback preserves independent init error and queued response", async () => {
  await setup();
  readFailures.match = "SELECT value FROM app_meta WHERE key=?";
  readFailures.remaining = 1;
  responseIO.pending = async () => [response("before-ready")];
  const r = await mount();
  assert.ok(text(r).includes("Injected read failure"));
  await run(retry(r).props.onPress);
  assert.ok(
    text(r).includes("برنامه هنوز برای بازکردن پاسخ اعلان آماده نیست."),
  );
  assert.ok(text(r).includes("Injected read failure"));
  assert.equal(navigationState.dispatches.length, 0);
  await dispose(r);
});

test("real handler reports failure, running/repeated touch and success; clears only response error", async () => {
  await setup();
  let fail = true,
    dismisses = 0,
    acks = 0;
  responseIO.dismiss = async () => {
    dismisses++;
    if (fail) throw Error("response dismiss failure");
  };
  const r = await mount();
  await run(() => emitNotificationResponse(response("feedback")));
  assert.ok(text(r).includes("response dismiss failure"));
  await run(retry(r).props.onPress);
  assert.ok(text(r).includes("پردازش پاسخ اعلان کامل نشد؛ دوباره تلاش کنید."));
  fail = false;
  const hold = deferred();
  responseIO.ack = async () => {
    acks++;
    await hold.promise;
  };
  await run(retry(r).props.onPress);
  assert.ok(text(r).includes("در حال پردازش پاسخ اعلان…"));
  await run(retry(r).props.onPress);
  assert.ok(text(r).includes("در حال پردازش پاسخ اعلان…"));
  assert.equal(acks, 1);
  assert.equal(dismisses, 3);
  await run(() => hold.resolve());
  assert.ok(text(r).includes("پاسخ اعلان پردازش شد."));
  assert.ok(!text(r).includes("response dismiss failure"));
  assert.ok(!text(r).includes("در حال پردازش پاسخ اعلان…"));
  assert.ok(text(r).includes(permissionError));
  assert.equal(navigationState.dispatches.length, 0);
  await dispose(r);
});

test("bootstrap retry remains separate; X75 success preserves subsequent independent reconcile error", async () => {
  await setup();
  readFailures.match = "SELECT value FROM app_meta WHERE key=?";
  readFailures.remaining = 1;
  let fail = true;
  responseIO.dismiss = async () => {
    if (fail) throw Error("response failure");
  };
  const r = await mount();
  await run(() => emitNotificationResponse(response("bootstrap-response")));
  // Finish bootstrap through its own existing retry; retain a later independent
  // reconcile error, then complete response processing via X75.
  const initRetry = r.root
    .findAllByType(Button)
    .find((b) => b.props.title === "تلاش دوباره")!;
  await run(initRetry.props.onPress);
  assert.ok(text(r).includes(permissionError));
  fail = false;
  await run(retry(r).props.onPress);
  assert.ok(text(r).includes(permissionError));
  assert.ok(!text(r).includes("response failure"));
  await dispose(r);
});

test("accepted navigation removes retry feedback; response taps/retries and dedupe do not write ledger", async () => {
  await setup();
  const r = await mount(),
    tx = await db();
  const before = await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id");
  let fail = true;
  navigationState.dispatch = () => {
    if (fail) throw Error("navigation failure");
  };
  const a = response("unresolved-A", false),
    b = response("unresolved-B", false);
  await run(() => {
    emitNotificationResponse(a);
    emitNotificationResponse(b);
  });
  assert.ok(text(r).includes("navigation failure"));
  fail = false;
  await run(retry(r).props.onPress);
  assert.equal(navigationState.dispatches.length, 2);
  assert.ok(
    navigationState.dispatches.every(
      (a: any) => a.name === "NotificationResolution",
    ),
  );
  assert.ok(!text(r).includes("پاسخ اعلان پردازش شد."));
  assert.ok(!text(r).includes("در حال پردازش پاسخ اعلان…"));
  assert.ok(!text(r).includes("navigation failure"));
  await run(() => {
    emitNotificationResponse(a);
    emitNotificationResponse(b);
  });
  assert.equal(navigationState.dispatches.length, 2);
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    before,
  );
  await dispose(r);
});

test("real App resolved tap targets the original period without ledger writes", async () => {
  await setup();
  const r = await mount(),
    tx = await db();
  const start = "2026-06-01T10:00:00.000Z",
    end = "2026-06-01T10:30:00.000Z";
  await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,30,?,?)",
    start,
    end,
    start,
    start,
  );
  const tables = [
    "time_entries",
    "entry_classifications",
    "entry_time_context",
    "expected_slots",
  ];
  const before = await Promise.all(
    tables.map((t) => tx.getAllAsync(`SELECT * FROM ${t} ORDER BY 1`)),
  );
  const a = response("resolved", false);
  a.notification.request.content.data = {
    kind: "time80-checkin",
    payloadVersion: 2,
    periodStart: start,
    periodEnd: end,
  };
  await run(() => emitNotificationResponse(a));
  assert.equal(navigationState.dispatches.length, 1);
  assert.equal(navigationState.dispatches[0].name, "CheckIn");
  assert.equal(navigationState.dispatches[0].params.start, start);
  assert.equal(navigationState.dispatches[0].params.end, end);
  assert.equal(
    navigationState.dispatches[0].params.dayScope.localDate,
    "2026-06-01",
  );
  assert.deepEqual(
    await Promise.all(
      tables.map((t) => tx.getAllAsync(`SELECT * FROM ${t} ORDER BY 1`)),
    ),
    before,
  );
  await dispose(r);
});

test("old immediate retry result cannot overwrite a newer automatic run completion", async () => {
  await setup();
  const r = await mount();
  await run(() => {
    retry(r).props.onPress(); // empty result awaits a microtask
    emitNotificationResponse(response("newer-run"));
  });
  assert.ok(!text(r).includes("پاسخ اعلانی برای تلاش دوباره در صف نیست."));
  assert.ok(!text(r).includes("در حال پردازش پاسخ اعلان…"));
  assert.ok(text(r).includes(permissionError));
  await dispose(r);
});

test("old pending-response read failure cannot overwrite newer read/processing success", async () => {
  await setup();
  const old = deferred<any[]>();
  let reads = 0;
  responseIO.pending = () =>
    ++reads === 1 ? old.promise : Promise.resolve([response("fresh-read")]);
  const r = await mount();
  assert.equal(reads, 2);
  await run(() => old.reject(Error("stale pending response error")));
  assert.ok(!text(r).includes("stale pending response error"));
  assert.ok(text(r).includes(permissionError));
  await dispose(r);
});
