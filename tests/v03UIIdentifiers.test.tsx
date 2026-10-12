import React from "react";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Button, IdentifierBadge } from "../src/components/Ui";
import {
  uiIdentifiers,
  validateUiIdentifierRegistry,
  uiIdentifierReferenceComplete,
  reservedUiCodesInThisStage,
} from "../src/components/uiIdentifiers";
import { generateUiCodeGuide } from "../scripts/generate-ui-code-guide";
import { collectUiIdentifierUses } from "../scripts/inspect-ui-identifiers";
import { NotificationDiagnosticsScreen } from "../src/screens/NotificationDiagnosticsScreen";
import { initDatabase } from "../src/db/database";
import { readFailures } from "./sqlite.mjs";
import { notificationReads, state } from "./notifications.mjs";
import { dimensions, I18nManager, emitAppState } from "./react-native.mjs";
import { theme } from "../src/theme/time80Theme";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const live = new Set<ReactTestRenderer>();
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++)
      await new Promise<void>((r) => setImmediate(r));
  });
}
async function mount(element: React.ReactElement) {
  let r!: ReactTestRenderer;
  await run(() => {
    r = create(element);
    live.add(r);
  });
  return r;
}
afterEach(async () => {
  await act(async () => {
    for (const r of live) r.unmount();
  });
  live.clear();
  notificationReads.permission = null;
  notificationReads.channels = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  dimensions.fontScale = 1;
});
const flatten = (s: any): any =>
  Object.assign({}, ...(Array.isArray(s) ? s.map(flatten) : [s || {}]));
function luminance(hex: string) {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return c[0]! * 0.2126 + c[1]! * 0.7152 + c[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test("available explicit allocations stay pinned; duplicate, retired reuse and invalid kind are rejected", () => {
  assert.equal(uiIdentifierReferenceComplete, true);
  const history = JSON.parse(
    readFileSync("docs/v0.3/rc3-id01/allocations-Rev01.json", "utf8"),
  );
  assert.equal(Object.keys(history).length, 121);
  validateUiIdentifierRegistry(uiIdentifiers, history);
  const uses = collectUiIdentifierUses();
  for (const [key, e] of Object.entries(uiIdentifiers)) {
    const bindings = uses
      .filter((u) => u.key === key)
      .map((u) => `${u.file}:${u.line} (${u.context})`);
    if (e.status === "active")
      assert.deepEqual([...e.sites].sort(), bindings.sort());
    else assert.equal(bindings.length, 0);
  }
  assert.equal(Object.keys(uiIdentifiers).length, 122);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(uiIdentifiers)
        .filter(([k]) =>
          [
            "requestNotificationPermission",
            "openPhoneNotificationSettings",
            "sendTestNotification",
            "reconcileNotificationsManually",
            "retryNotificationResponse",
            "moreReportsDialog",
            "openMoreReports",
            "showPreviousCalendarDay",
            "expandAllResultActivities",
          ].includes(k),
        )
        .map(([k, e]) => [k, e.code]),
    ),
    {
      requestNotificationPermission: "X69",
      openPhoneNotificationSettings: "X70",
      sendTestNotification: "X71",
      reconcileNotificationsManually: "X72",
      retryNotificationResponse: "X75",
      moreReportsDialog: "D08",
      openMoreReports: "X99",
      showPreviousCalendarDay: "X100",
      expandAllResultActivities: "X101",
    },
  );
  validateUiIdentifierRegistry(uiIdentifiers);
  assert.equal(uiIdentifiers.openActivitiesFromEmptyCheckIn.code, "X102");
  assert.throws(
    () =>
      validateUiIdentifierRegistry(
        { renamed: uiIdentifiers.retryNotificationResponse },
        { retryNotificationResponse: "X75" },
      ),
    /Historical/,
  );
  const retry = uiIdentifiers.retryNotificationResponse;
  assert.throws(
    () =>
      validateUiIdentifierRegistry({
        old: { ...retry, status: "retired", sites: [] },
        other: retry,
      }),
    /Duplicate/,
  );
  assert.throws(
    () => validateUiIdentifierRegistry({ wrong: { ...retry, kind: "screen" } }),
    /kind mismatch/,
  );
  for (const code of reservedUiCodesInThisStage)
    assert.throws(
      () =>
        validateUiIdentifierRegistry({
          forbidden: {
            ...retry,
            code,
            kind: code.startsWith("D") ? "dialog" : "action",
          },
        }),
      /Reserved/,
    );
});

test("complete generated guide and CSV match the registry and include reserved allocations", () => {
  const { markdown, csv } = generateUiCodeGuide();
  assert.equal(
    readFileSync("docs/v0.3/RC3_UI_Code_Guide_FA.md", "utf8"),
    markdown,
  );
  assert.equal(readFileSync("docs/v0.3/RC3_UI_Code_Guide_FA.csv", "utf8"), csv);
  assert.ok(!markdown.includes("پیش‌نویس ناقص"));
  assert.ok(markdown.includes("الحاقیهٔ ۶-ب"));
  const rows = csv.trimEnd().split(/\r?\n/);
  assert.equal(rows.length, Object.keys(uiIdentifiers).length + 1);
  for (const [key, e] of Object.entries(uiIdentifiers)) {
    assert.ok(markdown.includes(`| ${e.code} | ${key} |`));
    assert.ok(markdown.includes(e.nameFa));
    assert.ok(
      rows.some(
        (r) =>
          r.includes(`"${e.code}","${key}"`) && r.includes(`"${e.status}"`),
      ),
    );
  }
});

for (const scale of [1, 1.5, 2])
  test(`coded target retains name, single handler, scaling and contrast in enabled/disabled/selected states at scale ${scale}`, async () => {
    dimensions.fontScale = scale;
    assert.ok(I18nManager.isRTL);
    let calls = 0;
    const name = "تلاش دوباره برای بازکردن اعلان با نام فارسی کامل و طولانی";
    const r = await mount(
      <Button
        title={name}
        actionCode={uiIdentifiers.retryNotificationResponse.code}
        onPress={() => calls++}
      />,
    );
    for (const variant of ["primary", "secondary"] as const)
      for (const selected of [false, true])
        for (const disabled of [false, true]) {
          await run(() =>
            r.update(
              <Button
                title={name}
                actionCode={uiIdentifiers.retryNotificationResponse.code}
                variant={variant}
                selected={selected}
                disabled={disabled}
                onPress={() => calls++}
              />,
            ),
          );
          const p = r.root.findByType("Pressable" as any);
          assert.equal(p.findAllByType("Pressable" as any).length, 1);
          assert.equal(p.props.disabled, disabled);
          assert.equal(p.props.accessibilityLabel, name);
          assert.equal(p.props.accessibilityState.selected, selected);
          const badge = p.findByType(IdentifierBadge).findByType("Text" as any);
          assert.equal(badge.children.join(""), "X75");
          assert.equal(badge.props.allowFontScaling, true);
          assert.equal(badge.props.style.fontSize, 14);
          assert.equal(badge.props.style.writingDirection, "ltr");
          assert.equal(badge.props.onPress, undefined);
          assert.equal(badge.props.numberOfLines, undefined);
          assert.equal(badge.props.adjustsFontSizeToFit, undefined);
          assert.equal(badge.props.maxFontSizeMultiplier, undefined);
          for (const pressed of [false, true]) {
            const style = flatten(p.props.style({ pressed }));
            assert.ok(style.minHeight >= 48 && style.minWidth >= 48);
            assert.equal(style.opacity, undefined);
            assert.ok(
              contrast(badge.props.style.color, style.backgroundColor) >= 4.5,
            );
          }
          assert.ok(
            p
              .findAllByType("View" as any)
              .some((v) => v.props.style.flexWrap === "wrap"),
          );
          const before = calls;
          if (!disabled) await run(() => p.props.onPress());
          assert.equal(calls, before + (disabled ? 0 : 1));
        }
    const plain = await mount(
      <Button title="ذخیره" onPress={() => calls++} disabled />,
    );
    const p = plain.root.findByType("Pressable" as any);
    assert.equal(flatten(p.props.style({ pressed: false })).opacity, 0.45);
    assert.equal(plain.root.findAllByType(IdentifierBadge).length, 0);
    // Renderer configurations are not native layout/target measurements.
    assert.ok(contrast(theme.onAccent, theme.accent) >= 4.5);
  });

test("real diagnostics keeps allocated action codes through loading, read failure and success; reservations stay absent", async () => {
  await initDatabase();
  let release!: (v: any) => void;
  notificationReads.permission = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const r = await mount(<NotificationDiagnosticsScreen />);
  const check = () => {
    const buttons = r.root.findAllByType(Button);
    assert.deepEqual(
      buttons.map((b) => [b.props.title, b.props.actionCode]),
      [
        ["درخواست مجوز", "X69"],
        [uiIdentifiers.openPhoneNotificationSettings.nameFa, "X70"],
        [uiIdentifiers.sendTestNotification.nameFa, "X71"],
        ["هماهنگ‌سازی مجدد", "X72"],
      ],
    );
    for (const b of buttons) {
      const p = b.findByType("Pressable" as any);
      assert.equal(p.findAllByType("Pressable" as any).length, 1);
      assert.equal(
        p.findByType(IdentifierBadge).props.code,
        b.props.actionCode,
      );
    }
    const visible = JSON.stringify(r.toJSON());
    for (const e of Object.values(uiIdentifiers).filter(
      (e) => e.status === "reserved",
    ))
      assert.ok(!visible.includes(e.code));
  };
  check();
  assert.ok(JSON.stringify(r.toJSON()).includes("در حال بررسی…"));
  // Fail the OS channel read after the held permission read completes.
  notificationReads.channels = async () => {
    throw Error("identifier-read-failure");
  };
  await run(() => release({ granted: false, status: "denied" }));
  check();
  assert.ok(JSON.stringify(r.toJSON()).includes("identifier-read-failure"));
  notificationReads.permission = null;
  notificationReads.channels = null;
  state.granted = true;
  await run(() => emitAppState("active"));
  check();
  assert.ok(!JSON.stringify(r.toJSON()).includes("identifier-read-failure"));
  assert.ok(JSON.stringify(r.toJSON()).includes("مجاز"));
});
