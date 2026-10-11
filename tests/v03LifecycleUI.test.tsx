import React from "react";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import App from "../App";
import { NotificationDiagnosticsScreen } from "../src/screens/NotificationDiagnosticsScreen";
import { Button } from "../src/components/Ui";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { setMeta } from "../src/db/metaRepository";
import { readIO, readFailures } from "./sqlite.mjs";
import {
  state,
  notificationReads,
  emitNotificationResponse,
} from "./notifications.mjs";
import { responseIO, diagnosticIO } from "./notificationPlatform.mjs";
import { navigationState } from "./app-navigation.mjs";
import { emitFocus, focusListenerCount } from "./navigation.mjs";
import {
  emitAppState,
  appStateListenerCount,
  Linking,
  dimensions,
  I18nManager,
} from "./react-native.mjs";

// Real App, screen, diagnostics, scheduler and SQLite fixture; only OS/navigation
// ports and native hosts are doubled. This is not Android or layout evidence.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const renderers = new Set<ReactTestRenderer>();
const originalOpenSettings = Linking.openSettings;
const tick = () => new Promise<void>((r) => setImmediate(r));
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await tick();
  });
}
async function mount(element: React.ReactElement) {
  let r!: ReactTestRenderer;
  await run(() => {
    r = create(element);
    renderers.add(r);
  });
  return r;
}
async function dispose(r: ReactTestRenderer) {
  await act(async () => r.unmount());
  renderers.delete(r);
}
afterEach(async () => {
  for (const r of renderers) await dispose(r);
  Linking.openSettings = originalOpenSettings;
  readIO.before = null;
  notificationReads.permission = notificationReads.request = null;
  notificationReads.channels = null;
  diagnosticIO.capabilities = null;
  emitFocus(true);
  assert.equal(appStateListenerCount(), 0);
  assert.equal(focusListenerCount(), 0);
});
async function setup() {
  readIO.before = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  notificationReads.permission = notificationReads.request = null;
  notificationReads.channels = null;
  diagnosticIO.capabilities = null;
  responseIO.pending = async () => [];
  responseIO.dismiss = responseIO.ack = async () => {};
  navigationState.ready = navigationState.autoReady = true;
  navigationState.dispatches = [];
  navigationState.dispatch = null;
  state.granted = false;
  state.created = 0;
  state.failAfter = Infinity;
  state.scheduled.clear();
  state.os.clear();
  state.channels.clear();
  emitFocus(true);
  dimensions.width = 320;
  dimensions.fontScale = 1;
  await initDatabase();
  await setMeta(await db(), "onboarding_completed", "true");
  await (await db()).runAsync("UPDATE settings SET notification_enabled=1");
}
function deferred<T = void>() {
  let resolve!: (value: T) => void, reject!: (e: Error) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const rows = (r: ReactTestRenderer) =>
  r.root
    .findAllByType("Text" as any)
    .map((node) => node.children.filter((c) => typeof c === "string").join(""));
const row = (r: ReactTestRenderer, prefix: string) =>
  rows(r).find((s) => s.startsWith(prefix));
const target = (r: ReactTestRenderer, label: string) =>
  r.root
    .findAllByType("Pressable" as any)
    .find((p) => p.props.accessibilityLabel === label)!;
const press = (r: ReactTestRenderer, label: string) =>
  run(target(r, label).props.onPress);
const permissionError = "تنظیمات ذخیره شد؛ مجوز اعلان داده نشده است";
const retryLabel = "تلاش دوباره برای بازکردن اعلان";
const diagnosticResponse = (id: string) =>
  ({
    actionIdentifier: "default",
    notification: {
      date: 1,
      request: {
        identifier: `time80-${id}`,
        content: { data: { kind: "time80-test" } },
      },
    },
  }) as any;

test("App denied -> granted -> resume clears only its warning after a real reconcile", async () => {
  await setup();
  const r = await mount(<App />);
  assert.ok(text(r).includes(permissionError));
  const tx = await db(),
    before = await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id");
  state.granted = true;
  await run(() => emitAppState("active"));
  assert.ok(!text(r).includes(permissionError));
  assert.ok(state.scheduled.size > 0);
  assert.equal(
    await tx
      .getFirstAsync<{ value: string }>(
        "SELECT value FROM app_meta WHERE key='schedule_dirty'",
      )
      .then((v) => v?.value),
    "false",
  );
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    before,
  );
});

test("resume success preserves response error; X75 success owns only its response error", async () => {
  await setup();
  let fail = true,
    acks = 0;
  responseIO.dismiss = async () => {
    if (fail) throw Error("response still unresolved");
  };
  responseIO.ack = async () => {
    acks++;
  };
  const r = await mount(<App />);
  await run(() =>
    emitNotificationResponse(diagnosticResponse("independent-errors")),
  );
  assert.ok(text(r).includes("response still unresolved"));
  state.granted = true;
  await run(() => emitAppState("active"));
  assert.ok(!text(r).includes(permissionError));
  assert.ok(text(r).includes("response still unresolved"));
  state.granted = false;
  await run(() => emitAppState("active"));
  fail = false;
  await press(r, retryLabel);
  assert.ok(text(r).includes(permissionError));
  assert.ok(!text(r).includes("response still unresolved"));
  assert.equal(acks, 1);
});

test("bootstrap failure survives not-ready X75; successful bootstrap cannot clear response read failure", async () => {
  await setup();
  readFailures.match = "SELECT value FROM app_meta WHERE key=?";
  readFailures.remaining = 1;
  responseIO.pending = async () => {
    throw Error("pending response read failed");
  };
  const r = await mount(<App />);
  await press(r, retryLabel);
  assert.ok(text(r).includes("Injected read failure"));
  assert.ok(text(r).includes("pending response read failed"));
  await press(r, "تلاش دوباره");
  assert.ok(!text(r).includes("Injected read failure"));
  assert.ok(text(r).includes("pending response read failed"));
  assert.ok(text(r).includes(permissionError));
});

for (const late of ["failure", "success"] as const)
  test(`App older resume ${late} cannot overwrite a newer resume result`, async () => {
    await setup();
    const r = await mount(<App />),
      old = deferred();
    let intercepted = false;
    readIO.before = async (sql, args) => {
      if (
        !intercepted &&
        sql.includes("SELECT value FROM app_meta") &&
        args[0] === "schedule_timezone"
      ) {
        intercepted = true;
        await old.promise;
      }
    };
    await run(() => emitAppState("active"));
    assert.ok(intercepted);
    if (late === "failure") state.granted = true;
    else
      notificationReads.permission = async () => {
        throw Error("new resume failure");
      };
    await run(() => emitAppState("active"));
    if (late === "failure") {
      assert.ok(!text(r).includes(permissionError));
      await run(() => old.reject(Error("old resume failure")));
      assert.ok(!text(r).includes("old resume failure"));
    } else {
      assert.ok(text(r).includes("new resume failure"));
      notificationReads.permission = null;
      state.granted = true;
      await run(() => old.resolve());
      assert.ok(text(r).includes("new resume failure"));
    }
  });

for (const owner of ["bootstrap", "resume"] as const)
  test(`App ${owner} unmount stops pending continuation and removes listeners`, async () => {
    await setup();
    let r: ReactTestRenderer | undefined;
    if (owner === "resume") r = await mount(<App />);
    const hold = deferred();
    let intercepted = false,
      permissions = 0;
    readIO.before = async (sql, args) => {
      if (
        !intercepted &&
        sql.includes("SELECT value FROM app_meta") &&
        args[0] === "schedule_timezone"
      ) {
        intercepted = true;
        await hold.promise;
      }
    };
    notificationReads.permission = async () => {
      permissions++;
      return { granted: true };
    };
    if (!r) r = await mount(<App />);
    else await run(() => emitAppState("active"));
    assert.ok(intercepted);
    await dispose(r);
    await run(() => {
      hold.resolve();
      emitAppState("active");
    });
    assert.equal(permissions, 0);
    assert.equal(navigationState.dispatches.length, 0);
  });

test("pending response resolution cannot route after App unmount", async () => {
  await setup();
  const r = await mount(<App />),
    hold = deferred();
  let intercepted = false,
    dismissed = 0,
    acked = 0;
  readIO.before = async (sql) => {
    if (sql.startsWith("SELECT * FROM expected_slots WHERE period_start=?")) {
      intercepted = true;
      await hold.promise;
    }
  };
  responseIO.dismiss = async () => {
    dismissed++;
  };
  responseIO.ack = async () => {
    acked++;
  };
  const response = diagnosticResponse("unmount-resolve");
  response.notification.request.content.data = {
    kind: "time80-checkin",
    payloadVersion: 2,
    periodStart: "2026-06-01T10:00:00Z",
    periodEnd: "2026-06-01T10:30:00Z",
  };
  await run(() => emitNotificationResponse(response));
  assert.ok(intercepted);
  await dispose(r);
  await run(() => hold.resolve());
  assert.equal(navigationState.dispatches.length, 0);
  assert.equal(dismissed, 0);
  assert.equal(acked, 0);
});

test("diagnostics distinguishes loading, unknown and denied without false dirty=false", async () => {
  await setup();
  const hold = deferred<any>();
  notificationReads.permission = () => hold.promise;
  const r = await mount(<NotificationDiagnosticsScreen />);
  assert.equal(row(r, "مجوز:"), "مجوز: در حال بررسی…");
  assert.equal(row(r, "نیاز به هماهنگی:"), "نیاز به هماهنگی: در حال بررسی…");
  assert.equal(row(r, "کانال اعلان:"), "کانال اعلان: در حال بررسی…");
  await run(() => hold.reject(Error("diagnostics read failed")));
  assert.equal(row(r, "مجوز:"), "مجوز: نامعلوم");
  assert.equal(row(r, "نیاز به هماهنگی:"), "نیاز به هماهنگی: نامعلوم");
  assert.ok(text(r).includes("diagnostics read failed"));
  notificationReads.permission = null;
  await run(() => emitAppState("active"));
  assert.equal(row(r, "مجوز:"), "مجوز: داده نشده");
  assert.ok(!text(r).includes("diagnostics read failed"));
  notificationReads.permission = async () => ({
    granted: false,
    status: "undetermined",
  });
  await run(() => emitAppState("active"));
  assert.equal(row(r, "مجوز:"), "مجوز: نامعلوم");
});

test("diagnostics independently renders granted display, closed channel and unknown exact", async () => {
  await setup();
  state.granted = true;
  const cap = (supported: boolean, value: boolean | null) => ({
    supported,
    value,
    checkedAt: "2026-10-11T00:00:00Z",
  });
  diagnosticIO.capabilities = async () => ({
    displayPermission: cap(true, true),
    channelEnabled: cap(true, false),
    exactAlarmAllowed: cap(true, null),
    batteryOptimizationExempt: cap(false, true),
    backgroundRestricted: cap(false, null),
  });
  const r = await mount(<NotificationDiagnosticsScreen />);
  assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
  assert.equal(row(r, "مجوز نمایش:"), "مجوز نمایش: مجاز");
  assert.equal(row(r, "کانال اعلان:"), "کانال اعلان: بسته");
  assert.equal(row(r, "دسترسی alarm دقیق:"), "دسترسی alarm دقیق: نامعلوم");
  assert.equal(
    row(r, "معافیت بهینه‌سازی باتری:"),
    "معافیت بهینه‌سازی باتری: نامعلوم",
  );
});

test("X70 return and repeated focus refresh data with one listener and no repair or refresh loop", async () => {
  await setup();
  let reads = 0,
    settings = 0;
  notificationReads.permission = async () => {
    reads++;
    return { granted: state.granted };
  };
  Linking.openSettings = async () => {
    settings++;
  };
  const r = await mount(<NotificationDiagnosticsScreen />);
  assert.equal(reads, 1);
  assert.equal(appStateListenerCount(), 1);
  await press(r, "بازکردن تنظیمات گوشی");
  assert.equal(settings, 1);
  const prior = reads;
  state.granted = true;
  await run(() => {
    emitAppState("background");
    emitAppState("active");
  });
  assert.equal(reads, prior + 1);
  assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
  for (let i = 0; i < 3; i++) {
    await run(() => emitFocus(false));
    assert.equal(appStateListenerCount(), 0);
    const before: number = reads;
    await run(() => emitAppState("active"));
    assert.equal(reads, before);
    state.granted = !state.granted;
    await run(() => emitFocus(true));
    assert.equal(reads, before + 1);
    assert.equal(appStateListenerCount(), 1);
    assert.equal(
      row(r, "مجوز:"),
      `مجوز: ${state.granted ? "مجاز" : "داده نشده"}`,
    );
  }
  assert.equal(state.created, 0);
  const before = reads;
  await run();
  assert.equal(reads, before);
});

test("failed refresh never presents previous granted data as newly confirmed", async () => {
  await setup();
  state.granted = true;
  const r = await mount(<NotificationDiagnosticsScreen />);
  assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
  notificationReads.channels = async () => {
    throw Error("channel read failed");
  };
  await run(() => emitAppState("active"));
  assert.equal(row(r, "مجوز:"), "مجوز: نامعلوم");
  assert.equal(row(r, "نیاز به هماهنگی:"), "نیاز به هماهنگی: نامعلوم");
  assert.ok(text(r).includes("channel read failed"));
  notificationReads.channels = null;
  await run(() => emitAppState("active"));
  assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
  assert.ok(!text(r).includes("channel read failed"));
});

for (const owner of ["permission", "test", "reconcile"] as const)
  test(`diagnostics successful refresh or another action cannot clear unresolved ${owner} error`, async () => {
    await setup();
    const label =
      owner === "permission"
        ? "درخواست مجوز"
        : owner === "test"
          ? "اعلان آزمایشی در ۱۰ ثانیه"
          : "هماهنگ‌سازی مجدد";
    const error =
      owner === "permission"
        ? "مجوز داده نشد؛ تنظیمات گوشی را بررسی کن"
        : owner === "test"
          ? "Injected OS failure"
          : permissionError;
    if (owner === "test") {
      state.granted = true;
      state.failAfter = 0;
    }
    const r = await mount(<NotificationDiagnosticsScreen />);
    await press(r, label);
    assert.ok(text(r).includes(error));
    state.granted = true;
    state.failAfter = Infinity;
    await run(() => emitAppState("active"));
    assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
    assert.ok(text(r).includes(error));
    await press(
      r,
      owner === "permission" ? "اعلان آزمایشی در ۱۰ ثانیه" : "درخواست مجوز",
    );
    assert.ok(text(r).includes(error));
    assert.ok(
      !text(r).includes(
        owner === "permission" ? "تست زمان‌بندی شد" : "مجوز برقرار است",
      ),
    );
    await press(r, label);
    assert.ok(!text(r).includes(error));
  });

test("X70 opening failure is visible and cleared only after X70 succeeds", async () => {
  await setup();
  Linking.openSettings = async () => {
    throw Error("settings opening failed");
  };
  const r = await mount(<NotificationDiagnosticsScreen />);
  await press(r, "بازکردن تنظیمات گوشی");
  assert.ok(text(r).includes("settings opening failed"));
  await run(() => emitAppState("active"));
  assert.ok(text(r).includes("settings opening failed"));
  Linking.openSettings = originalOpenSettings;
  await press(r, "بازکردن تنظیمات گوشی");
  assert.ok(!text(r).includes("settings opening failed"));
});

test("new action/read failure removes an old success message without claiming delivery", async () => {
  await setup();
  state.granted = true;
  const r = await mount(<NotificationDiagnosticsScreen />);
  await press(r, "اعلان آزمایشی در ۱۰ ثانیه");
  assert.ok(text(r).includes("تست زمان‌بندی شد"));
  Linking.openSettings = async () => {
    throw Error("new action failed");
  };
  await press(r, "بازکردن تنظیمات گوشی");
  assert.ok(!text(r).includes("تست زمان‌بندی شد"));
  assert.ok(text(r).includes("new action failed"));
  Linking.openSettings = originalOpenSettings;
  await press(r, "بازکردن تنظیمات گوشی");
  await press(r, "اعلان آزمایشی در ۱۰ ثانیه");
  assert.ok(text(r).includes("تست زمان‌بندی شد"));
  notificationReads.permission = async () => {
    throw Error("new read failed");
  };
  await run(() => emitAppState("active"));
  assert.ok(!text(r).includes("تست زمان‌بندی شد"));
  assert.equal(row(r, "مجوز:"), "مجوز: نامعلوم");
  assert.ok(rows(r).some((s) => s.includes("دریافت اعلان را اثبات نمی‌کند")));
});

for (const late of ["failure", "success"] as const)
  test(`diagnostics older read ${late} cannot replace a newer snapshot/error`, async () => {
    await setup();
    const old = deferred<any>();
    let reads = 0;
    notificationReads.permission = () =>
      ++reads === 1 ? old.promise : Promise.resolve({ granted: true });
    const r = await mount(<NotificationDiagnosticsScreen />);
    if (late === "success")
      notificationReads.permission = async () => {
        throw Error("new diagnostics failure");
      };
    await run(() => emitAppState("active"));
    if (late === "failure") {
      assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
      await run(() => old.reject(Error("old diagnostics failure")));
      assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
      assert.ok(!text(r).includes("old diagnostics failure"));
    } else {
      assert.ok(text(r).includes("new diagnostics failure"));
      await run(() => old.resolve({ granted: false }));
      assert.ok(text(r).includes("new diagnostics failure"));
      assert.equal(row(r, "مجوز:"), "مجوز: نامعلوم");
    }
  });

for (const late of ["failure", "success"] as const)
  test(`diagnostics older X70 ${late} cannot overwrite a newer X70 outcome or start another refresh`, async () => {
    await setup();
    const old = deferred();
    let opens = 0,
      reads = 0;
    notificationReads.permission = async () => {
      reads++;
      return { granted: state.granted };
    };
    Linking.openSettings = async () => {
      if (++opens === 1) await old.promise;
      else if (late === "success") throw Error("new X70 failure");
    };
    const r = await mount(<NotificationDiagnosticsScreen />);
    await press(r, "بازکردن تنظیمات گوشی");
    state.granted = true;
    await press(r, "بازکردن تنظیمات گوشی");
    const before = reads;
    if (late === "failure")
      await run(() => old.reject(Error("old X70 failure")));
    else await run(() => old.resolve());
    assert.equal(reads, before);
    assert.equal(row(r, "مجوز:"), "مجوز: مجاز");
    assert.ok(!text(r).includes("old X70 failure"));
    assert.equal(text(r).includes("new X70 failure"), late === "success");
  });

test("blur invalidates an old diagnostics read; refocus gets a new snapshot", async () => {
  await setup();
  const old = deferred<any>();
  let reads = 0;
  notificationReads.permission = () =>
    ++reads === 1 ? old.promise : Promise.resolve({ granted: false });
  const r = await mount(<NotificationDiagnosticsScreen />);
  await run(() => emitFocus(false));
  await run(() => old.resolve({ granted: true }));
  assert.equal(row(r, "مجوز:"), "مجوز: در حال بررسی…");
  assert.equal(appStateListenerCount(), 0);
  await run(() => emitFocus(true));
  assert.equal(row(r, "مجوز:"), "مجوز: داده نشده");
  assert.equal(reads, 2);
});

test("diagnostics unmount cancels read/action updates and follow-up refreshes", async () => {
  await setup();
  const read = deferred<any>(),
    action = deferred();
  let reads = 0;
  notificationReads.permission = () => {
    reads++;
    return read.promise;
  };
  Linking.openSettings = () => action.promise;
  const r = await mount(<NotificationDiagnosticsScreen />);
  await press(r, "بازکردن تنظیمات گوشی");
  await dispose(r);
  assert.equal(appStateListenerCount(), 0);
  await run(() => {
    action.resolve();
    read.resolve({ granted: true });
    emitAppState("active");
  });
  assert.equal(reads, 1);
});

for (const scale of [1, 1.5, 2])
  test(`RTL X75 is inside one target at font scale ${scale}, with scaling/wrap and one handler`, async () => {
    await setup();
    dimensions.fontScale = scale;
    const r = await mount(<App />),
      p = target(r, retryLabel);
    assert.ok(I18nManager.isRTL);
    const badge = p
      .findAllByType("Text" as any)
      .find((n) => n.children.join("") === "X75")!;
    assert.ok(badge);
    assert.equal(p.findAllByType("Pressable" as any).length, 1);
    assert.equal(badge.props.onPress, undefined);
    assert.equal(badge.props.allowFontScaling, true);
    assert.ok(badge.props.style.fontSize >= 14);
    assert.equal(badge.props.style.writingDirection, "ltr");
    assert.equal(badge.props.numberOfLines, undefined);
    assert.equal(badge.props.adjustsFontSizeToFit, undefined);
    assert.equal(badge.props.maxFontSizeMultiplier, undefined);
    assert.ok(
      p
        .findAllByType("View" as any)
        .some((n) => n.props.style.flexWrap === "wrap"),
    );
    const flatten = (s: any): any[] =>
      Array.isArray(s) ? s.flatMap(flatten) : s ? [s] : [];
    assert.ok(
      flatten(p.props.style({ pressed: false })).some(
        (s) => s.minHeight >= 48 && s.minWidth >= 48,
      ),
    );
    let starts = 0,
      acks = 0;
    const hold = deferred();
    responseIO.dismiss = async () => {
      starts++;
      throw Error("response target failure");
    };
    await run(() =>
      emitNotificationResponse(diagnosticResponse(`target-${scale}`)),
    );
    assert.equal(starts, 1);
    responseIO.dismiss = async () => {
      starts++;
    };
    responseIO.ack = async () => {
      acks++;
      await hold.promise;
    };
    await press(r, retryLabel);
    assert.equal(starts, 2);
    assert.equal(acks, 1);
    state.granted = true;
    await run(() => emitAppState("active"));
    assert.ok(!text(r).includes(permissionError));
    assert.ok(text(r).includes("در حال پردازش پاسخ اعلان…"));
    assert.ok(
      target(r, retryLabel)
        .findAllByType("Text" as any)
        .some((n) => n.children.join("") === "X75"),
    );
    await press(r, retryLabel);
    assert.equal(starts, 2);
    assert.equal(acks, 1);
    await run(() => hold.resolve());
    assert.equal(navigationState.dispatches.length, 0);
    assert.ok(text(r).includes("پاسخ اعلان پردازش شد."));
    // Existing callers without an action code retain their label and click path.
    await dispose(r);
    let clicks = 0;
    const ordinary = await mount(
      <Button title="ذخیره" onPress={() => clicks++} />,
    );
    await press(ordinary, "ذخیره");
    assert.equal(clicks, 1);
    assert.ok(!text(ordinary).includes("X75"));
  });
