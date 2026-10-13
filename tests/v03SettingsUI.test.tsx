import React from "react";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { SettingsScreen } from "../src/screens/SettingsScreen";
import { SettingsGlyph } from "../src/components/SettingsGlyph";
import { Input, IdentifierBadge } from "../src/components/Ui";
import { getSettings, initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { getMeta } from "../src/db/metaRepository";
import { dimensions, I18nManager, alertState } from "./react-native.mjs";
import { readFailures, readIO } from "./sqlite.mjs";
import { notificationReads, state } from "./notifications.mjs";
import { theme } from "../src/theme/time80Theme";
import { fontState } from "./fonts.mjs";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const live = new Set<ReactTestRenderer>(),
  releases = new Set<() => void>();
const tick = () => new Promise<void>((r) => setImmediate(r));
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await tick();
  });
}
function nav() {
  const listeners = new Set<(e: any) => void>(),
    routes: any[] = [];
  return {
    listeners,
    routes,
    navigation: {
      addListener: (_: string, fn: (e: any) => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      navigate: (...args: any[]) => routes.push(args),
      dispatch: (a: any) => routes.push(a),
    },
  };
}
async function mount(n = nav()) {
  let r!: ReactTestRenderer;
  await run(() => {
    r = create(<SettingsScreen navigation={n.navigation} />);
    live.add(r);
  });
  return { r, n };
}
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const field = (r: ReactTestRenderer, code: string) =>
  r.root
    .findAllByType(Input)
    .find((n) => n.props.actionCode === code)!
    .findByType("TextInput" as any);
const target = (r: ReactTestRenderer, code: string, index = 0) =>
  r.root
    .findAllByType("Pressable" as any)
    .filter((p) =>
      p.findAllByType(IdentifierBadge).some((b) => b.props.code === code),
    )[index]!;
async function press(r: ReactTestRenderer, code: string, index = 0) {
  const p = target(r, code, index);
  assert.ok(p, code);
  assert.ok(!p.props.disabled, code);
  await run(() => p.props.onPress());
}
async function edit(r: ReactTestRenderer, code: string, value: string) {
  await run(() => field(r, code).props.onChangeText(value));
}
async function blur(r: ReactTestRenderer, code: string) {
  await run(() => field(r, code).props.onBlur({}));
}
async function revision() {
  return Number(await getMeta(await db(), "schedule_revision"));
}
const flatten = (s: any): any =>
  Object.assign({}, ...(Array.isArray(s) ? s.map(flatten) : [s || {}]));
beforeEach(async (t) => {
  assert.ok("mock" in t);
  t.mock.timers.enable({
    apis: ["Date"],
    now: Date.parse("2026-10-12T12:00:00Z"),
  });
  await initDatabase();
  await (
    await db()
  ).runAsync(
    "UPDATE settings SET notification_enabled=0,interval_minutes=60,day_start='08:00',day_end='23:00',active_days='[1,2,3,4,5,6,7]',sound_enabled=1,vibration_enabled=1",
  );
  state.granted = true;
  state.failAfter = Infinity;
  readIO.before = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  alertState.autoConfirm = false;
  alertState.calls.length = 0;
  fontState.ready = true;
  fontState.error = null;
});
afterEach(async (t) => {
  for (const resolve of releases) resolve();
  releases.clear();
  await run(() => {
    for (const r of live) r.unmount();
  });
  live.clear();
  readIO.before = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  notificationReads.permission = null;
  notificationReads.request = null;
  dimensions.fontScale = 1;
  dimensions.width = 400;
  state.granted = true;
  alertState.autoConfirm = true;
  fontState.ready = true;
  fontState.error = null;
  assert.ok("mock" in t);
  t.mock.timers.reset();
});

test("M-02 valid/invalid interval and hours retain draft, save once on blur, reload and never advertise stale success", async () => {
  const { r } = await mount();
  const base = await getSettings();
  const before = await revision();
  let permissionReads = 0;
  notificationReads.permission = async () => {
    permissionReads++;
    return { granted: true, canAskAgain: true, status: "granted" };
  };
  await edit(r, "X60", "90");
  await press(r, "X60");
  assert.deepEqual(await getSettings(), base);
  assert.equal(await revision(), before);
  await blur(r, "X60");
  assert.equal((await getSettings()).interval_minutes, 90);
  assert.equal(await revision(), before + 1);
  assert.equal(permissionReads, 1); // Exactly one real reconcile permission read.
  await blur(r, "X60");
  assert.equal(await revision(), before + 1);
  assert.equal(permissionReads, 1);
  assert.match(text(r), /تنظیمات ذخیره/);
  for (const value of ["14", "241", "15.5", "nope"]) {
    const old = await getSettings(),
      rev = await revision();
    await edit(r, "X60", value);
    await blur(r, "X60");
    assert.deepEqual(await getSettings(), old);
    assert.equal(await revision(), rev);
    assert.match(text(r), /فاصله باید/);
    assert.doesNotMatch(text(r), /تنظیمات ذخیره و اعلان‌ها هماهنگ شدند/);
  }
  await edit(r, "X60", "90");
  for (const [code, value, key] of [
    ["X61", "09:15", "day_start"],
    ["X62", "22:30", "day_end"],
  ] as const) {
    const rev = await revision();
    await edit(r, code, value);
    assert.notEqual((await getSettings())[key], value);
    await blur(r, code);
    assert.equal((await getSettings())[key], value);
    assert.equal(await revision(), rev + 1);
  }
  for (const [code, value] of [
    ["X61", "25:00"],
    ["X62", "09:15"],
    ["X62", "07:00"],
  ]) {
    const old = await getSettings(),
      rev = await revision();
    await edit(r, code!, value!);
    await blur(r, code!);
    assert.deepEqual(await getSettings(), old);
    assert.equal(await revision(), rev);
    assert.match(text(r), /پایان باید بعد از شروع/);
    assert.doesNotMatch(text(r), /تنظیمات ذخیره و اعلان‌ها هماهنگ شدند/);
  }
  const saved = await getSettings();
  const reload = await mount();
  assert.equal(
    field(reload.r, "X60").props.value,
    String(saved.interval_minutes),
  );
  assert.equal(field(reload.r, "X61").props.value, saved.day_start);
  assert.equal(field(reload.r, "X62").props.value, saved.day_end);
});

test("M-02 D04 continue/discard keeps incomplete draft separate from earlier persisted settings", async () => {
  const { r, n } = await mount();
  await edit(r, "X60", "90");
  await blur(r, "X60");
  const saved = await getSettings();
  await edit(r, "X61", "incomplete");
  const action = { type: "GO_BACK", source: "M02-fixture" };
  let prevented = 0;
  await run(() =>
    n.listeners.forEach((fn) =>
      fn({ preventDefault: () => prevented++, data: { action } }),
    ),
  );
  assert.equal(prevented, 1);
  const alert = (alertState.calls as any[]).at(-1);
  assert.match(alert.title, /D04/);
  const cont = alert.actions.find((a: any) => a.text.includes("X67")),
    discard = alert.actions.find((a: any) => a.text.includes("X68"));
  assert.ok(cont);
  assert.ok(discard);
  await run(() => cont.onPress?.());
  assert.equal(n.routes.length, 0);
  assert.equal(field(r, "X61").props.value, "incomplete");
  assert.deepEqual(await getSettings(), saved);
  await run(() => discard.onPress());
  assert.deepEqual(n.routes, [action]);
  assert.deepEqual(await getSettings(), saved);
  const fresh = await mount();
  assert.equal(field(fresh.r, "X60").props.value, "90");
  assert.equal(field(fresh.r, "X61").props.value, saved.day_start);
});

test("M-02 chips and single switch targets preserve save/permission policy and A04 to A09", async () => {
  const { r, n } = await mount();
  for (const code of ["X63", "X64", "X65"]) {
    const before = await getSettings(),
      rev = await revision();
    await press(r, code);
    assert.equal(await revision(), rev + 1);
    const after = await getSettings();
    if (code === "X63")
      assert.equal(after.active_days.length, before.active_days.length - 1);
    else
      assert.equal(
        after[code === "X64" ? "sound_enabled" : "vibration_enabled"],
        0,
      );
  }
  let requests = 0;
  state.granted = false;
  notificationReads.request = async () => {
    requests++;
    return { granted: false, canAskAgain: true, status: "denied" };
  };
  const rev = await revision();
  await press(r, "X59");
  assert.equal(requests, 1);
  assert.equal(await revision(), rev + 1);
  assert.equal((await getSettings()).notification_enabled, 1);
  assert.match(text(r), /مجوز اعلان داده نشده/);
  assert.doesNotMatch(text(r), /اعلان‌ها هماهنگ شدند/);
  await press(r, "X59");
  state.granted = true;
  notificationReads.request = null;
  await press(r, "X59");
  assert.equal((await getSettings()).notification_enabled, 1);
  assert.match(text(r), /اعلان‌ها هماهنگ شدند/);
  await press(r, "X66");
  assert.deepEqual(n.routes, [["Diagnostics"]]);
  for (const code of ["X59", "X64", "X65"]) {
    const p = target(r, code),
      s = p.findByType("Switch" as any);
    assert.equal(s.props.pointerEvents, "none");
    assert.equal(s.props.onValueChange, undefined);
    assert.equal(p.findAllByType("Pressable" as any).length, 1);
  }
});

for (const scale of [1, 1.5, 2])
  test(`M-02 RTL scale ${scale}: normalized cards, wrapping targets, long labels, busy codes and keyboard inputs`, async () => {
    dimensions.fontScale = scale;
    assert.equal(I18nManager.isRTL, true);
    const { r } = await mount();
    assert.equal(r.root.findAllByType(SettingsGlyph).length, 8);
    for (const glyph of r.root.findAllByType(SettingsGlyph)) {
      assert.equal(glyph.findAllByType("Pressable" as any).length, 0);
      const vector = glyph.findAllByType("Svg" as any)[0];
      if (vector) {
        assert.equal(vector.props.width, 20);
        assert.equal(vector.props.pointerEvents, "none");
      }
    }
    for (const id of [
      "settings-reminder-card",
      "settings-interval-card",
      "settings-hours-card",
      "settings-days-card",
      "settings-notifications-card",
    ]) {
      const card = r.root.findByProps({ testID: id });
      assert.equal(card.props.style.borderRadius, 16);
      assert.equal(card.props.style.padding, 16);
    }
    const scroll = r.root.findByType("ScrollView" as any);
    assert.equal(scroll.props.keyboardShouldPersistTaps, "handled");
    assert.equal(scroll.props.contentContainerStyle.padding, 16);
    assert.equal(field(r, "X60").props.keyboardType, "number-pad");
    const hours = r.root
      .findByProps({ testID: "settings-hours-card" })
      .findAllByType("View" as any)
      .find((v) => v.props.style?.gap === 12)!;
    assert.equal(
      hours.props.style.flexDirection,
      scale === 1 ? "row-reverse" : "column",
    );
    for (const code of [
      "X59",
      "X60",
      "X61",
      "X62",
      "X63",
      "X64",
      "X65",
      "X66",
    ]) {
      const p = target(r, code);
      const style = flatten(p.props.style({ pressed: false }));
      assert.ok(style.minHeight >= 48);
      assert.ok(style.minWidth >= 48);
      const badge = p.findByType(IdentifierBadge).findByType("Text" as any);
      assert.equal(flatten(badge.props.style).fontSize, 14);
      assert.equal(flatten(badge.props.style).writingDirection, "ltr");
      assert.equal(badge.props.allowFontScaling, true);
      assert.equal(p.findAllByType("Pressable" as any).length, 1);
    }
    for (const t of r.root.findAllByType("Text" as any)) {
      assert.equal(t.props.numberOfLines, undefined);
      assert.equal(t.props.adjustsFontSizeToFit, undefined);
    }
    let release!: () => void;
    const gate = new Promise<void>((res) => (release = res));
    releases.add(release);
    readIO.before = async (sql) => {
      if (sql.includes("SELECT * FROM settings")) await gate;
    };
    await press(r, "X64");
    assert.match(text(r), /در حال ذخیره/);
    for (const code of ["X59", "X63", "X64", "X65"]) {
      assert.equal(target(r, code).props.disabled, true);
      assert.ok(text(r).includes(code));
    }
    await run(() => release());
    readIO.before = null;
    await run();
    assert.equal(target(r, "X64").props.disabled, false);
    assert.doesNotMatch(text(r), /ICATUS|طبقه‌بندی|دسته/);
  });

test("M-02 loading/read error and font fallback retain A04 without writes on entry", async () => {
  let release!: () => void;
  const gate = new Promise<void>((res) => (release = res));
  releases.add(release);
  readIO.before = async (sql) => {
    if (sql.includes("SELECT * FROM settings")) await gate;
  };
  const { r } = await mount();
  assert.match(text(r), /A04/);
  assert.match(text(r), /در حال بارگذاری/);
  await run(() => release());
  readIO.before = null;
  await run();
  const rev = await revision(),
    settings = await getSettings();
  await mount();
  assert.equal(await revision(), rev);
  assert.deepEqual(await getSettings(), settings);
  readFailures.match = "SELECT * FROM settings";
  readFailures.remaining = 1;
  const failed = await mount();
  assert.match(text(failed.r), /A04/);
  assert.match(text(failed.r), /Injected read failure/);
  const alertText = failed.r.root
    .findAllByType("Text" as any)
    .find((t) => t.props.accessibilityRole === "alert")!;
  assert.equal(flatten(alertText.props.style).color, theme.danger);
  assert.doesNotMatch(text(failed.r), /در حال بارگذاری/);
  readFailures.match = null;
  fontState.ready = false;
  fontState.error = new Error("font IO failed");
  const fallback = await mount();
  assert.match(text(fallback.r), /فونت سیستم/);
  assert.ok(target(fallback.r, "X60"));
});
