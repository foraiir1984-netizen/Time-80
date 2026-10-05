import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  theme,
  activityColumns,
  navigationColors,
  tabVisualOptions,
  iconTone,
} from "../src/theme/time80Theme";
import { ActivityGrid } from "../src/components/ActivityGrid";
import { ActivityIcon } from "../src/components/ActivityIcon";
import {
  TodayOverview,
  dayPresentationProgress,
} from "../src/components/TodayOverview";
import { TodayScreen } from "../src/screens/TodayScreen";
import { SlotRow } from "../src/components/SlotRow";
import { Button, Input, ErrorText } from "../src/components/Ui";
import { dimensions, FlatList } from "./react-native.mjs";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
async function mount(element: React.ReactElement) {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(element);
    await new Promise((resolve) => setImmediate(resolve));
  });
  return r;
}
async function click(fn: () => unknown) {
  await act(async () => {
    fn();
    await new Promise((resolve) => setImmediate(resolve));
  });
}
async function close(r: ReactTestRenderer) {
  await act(async () => r.unmount());
}
function flatten(styles: any): any {
  return Array.isArray(styles)
    ? Object.assign({}, ...styles.map(flatten))
    : styles || {};
}
function styles(p: any, pressed = false) {
  return flatten(
    typeof p.props.style === "function"
      ? p.props.style({ pressed })
      : p.props.style,
  );
}
test("approved warm tokens, tab hierarchy, icon tones and responsive boundaries", () => {
  assert.deepEqual(
    [
      theme.background,
      theme.surface,
      theme.text,
      theme.secondary,
      theme.border,
      theme.accent,
    ],
    ["#FAF7F0", "#FFFDFA", "#302E2A", "#746E64", "#E7DFD3", "#A7462E"],
  );
  assert.deepEqual(Object.values(theme.spacing), [4, 8, 12, 16, 24, 32]);
  assert.equal(navigationColors.background, theme.background);
  assert.equal(tabVisualOptions.tabBarActiveTintColor, theme.accent);
  assert.equal(tabVisualOptions.tabBarInactiveTintColor, theme.secondary);
  assert.ok(tabVisualOptions.tabBarItemStyle.minHeight >= 48);
  assert.equal(activityColumns(348, 1), 2);
  assert.equal(activityColumns(347, 1), 1);
  assert.equal(activityColumns(400, 1.5), 1);
  assert.equal(activityColumns(400, 1.49), 2);
  assert.equal(
    new Set(
      ["rest", "work", "exercise", "study"].map((k) => iconTone(k).background),
    ).size,
    4,
  );
});
test("buttons/inputs expose focus and disabled state, retain handlers, errors include text", async () => {
  let count = 0;
  const r = await mount(
    <>
      <Button title="ثبت" iconKey="check" onPress={() => count++} />
      <Input accessibilityLabel="نام" onBlur={() => count++} />
      <ErrorText error="خواندن ناموفق" />
    </>,
  );
  const p = r.root.findByType("Pressable" as any);
  assert.equal(p.props.accessibilityLabel, "ثبت");
  assert.equal(styles(p).minHeight, 56);
  assert.equal(styles(p).borderRadius, 28);
  await click(p.props.onPress);
  assert.equal(count, 1);
  await click(() => p.props.onFocus({}));
  assert.equal(styles(p).outlineWidth, 3);
  const input = r.root.findByType("TextInput" as any);
  await click(() => input.props.onFocus({}));
  assert.equal(styles(input).outlineColor, theme.accent);
  await click(() => input.props.onBlur({}));
  assert.equal(count, 2);
  assert.ok(JSON.stringify(r.toJSON()).includes("خطا: "));
  await close(r);
  const disabled = await mount(
    <Button title="ثبت" disabled onPress={() => count++} />,
  );
  assert.equal(
    disabled.root.findByType("Pressable" as any).props.accessibilityState
      .disabled,
    true,
  );
  await close(disabled);
});
test("picker retains full caller ranking and immediate taps with two/one columns, no search or persistent selection", async () => {
  const activities = [17, 3, 9].map((id) => ({
    id,
    name: `فعالیت ${id}`,
    icon: "✨",
  })) as any;
  const selected: number[] = [];
  const r = await mount(
    <ActivityGrid
      activities={activities}
      onSelect={(a) => selected.push(a.id)}
    />,
  );
  assert.deepEqual(
    r.root.findByType(FlatList).props.data.map((a: any) => a.id),
    [17, 3, 9],
  );
  assert.equal(r.root.findByType(FlatList).props.numColumns, 2);
  assert.equal(r.root.findAllByType("TextInput" as any).length, 0);
  const p = r.root.findAllByType("Pressable" as any)[0];
  assert.ok(p);
  assert.ok(styles(p).minHeight >= 48);
  assert.equal(styles(p, true).backgroundColor, theme.pressed);
  await click(p.props.onPress);
  assert.deepEqual(selected, [17]);
  assert.equal(p.props.accessibilityState.selected, undefined);
  dimensions.fontScale = 1.5;
  await act(async () =>
    r.update(
      <ActivityGrid
        activities={activities}
        onSelect={(a) => selected.push(a.id)}
      />,
    ),
  );
  assert.equal(r.root.findByType(FlatList).props.numColumns, 1);
  dimensions.fontScale = 1;
  await close(r);
});
test("Style A hosts are 52dp, symbols 32dp, legacy icon strings remain literal", async () => {
  const r = await mount(
    <ActivityIcon
      icon={{ kind: "asset", key: "exercise", raw: "🏃", unresolved: false }}
    />,
  );
  const image = r.root.findByType("Image" as any);
  assert.equal(image.props.style.width, 32);
  assert.ok(
    r.root
      .findAllByType("View" as any)
      .some((p) => p.props.style.width === 52 && p.props.style.height === 52),
  );
  assert.equal(image.props.style.tintColor, iconTone("exercise").foreground);
  await close(r);
  const legacy = await mount(<ActivityIcon legacy="👨‍👩‍👦" />);
  assert.ok(JSON.stringify(legacy.toJSON()).includes("👨‍👩‍👦"));
  await close(legacy);
});
test("Today overview is read-only, shows clock/context/reminder/due count and preserves callback target", async () => {
  const now = new Date("2026-06-04T12:00:00Z");
  const items = [
    {
      period_start: "2026-06-04T10:00:00Z",
      period_end: "2026-06-04T10:30:00Z",
      slot: { id: 1, state: "pending" },
    },
    {
      period_start: "2026-06-04T11:00:00Z",
      period_end: "2026-06-04T11:30:00Z",
      entry: { status: "logged", activity_name: "مطالعه", activity_icon: "📚" },
    },
    {
      period_start: "2026-06-04T12:00:00Z",
      period_end: "2026-06-04T12:30:00Z",
      slot: { id: 3, state: "pending" },
    },
  ] as any;
  const before = JSON.stringify(items);
  const actions: unknown[] = [];
  const r = await mount(
    <TodayOverview
      now={now}
      items={items}
      next="۱۲:۳۰"
      pending={items[0]}
      onDue={() => actions.push(items[0])}
      onReview={() => actions.push("review")}
    />,
  );
  const output = JSON.stringify(r.toJSON());
  for (const text of [
    "زمان اکنون",
    "یادآوری بعدی",
    "آخرین بازهٔ تکمیل‌شده",
    "بازهٔ جاری",
    "بازه‌های سررسیدشدهٔ ثبت‌نشده",
  ])
    assert.ok(output.includes(text));
  assert.equal(
    r.root
      .findAllByType("View" as any)
      .find((p) => p.props.accessibilityRole === "progressbar")!.props
      .accessibilityValue.now,
    50,
  );
  await click(
    r.root
      .findAllByType(Button)
      .find((p) => p.props.title === "تکمیل آخرین بازهٔ ثبت‌نشده")!.props
      .onPress,
  );
  assert.equal(actions[0], items[0]);
  assert.equal(JSON.stringify(items), before);
  await close(r);
  assert.equal(dayPresentationProgress(new Date("2026-06-04T00:00:00Z")), 0);
  const previousZone = process.env.TZ;
  try {
    process.env.TZ = "America/New_York";
    const noon = new Date("2026-03-08T12:00:00-04:00");
    assert.equal(dayPresentationProgress(noon), 11 / 23);
  } finally {
    process.env.TZ = previousZone;
  }
});
test("Today landing/review retain exact CheckIn routing, previous-day access, Backlog and all slot rows", async () => {
  await initDatabase();
  const tx = await db();
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const start = midnight.toISOString(),
    end = new Date(+midnight + 60000).toISOString();
  await tx.runAsync(
    "INSERT OR IGNORE INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,1,?,?)",
    start,
    end,
    start,
    start,
  );
  const calls: any[] = [];
  const r = await mount(
    <TodayScreen
      navigation={{ navigate: (...args: any[]) => calls.push(args) }}
    />,
  );
  const byTitle = (title: string) =>
    r.root.findAllByType(Button).find((p) => p.props.title === title)!;
  assert.equal(r.root.findByType(FlatList).props.data.length, 0);
  await click(byTitle("تکمیل آخرین بازهٔ ثبت‌نشده").props.onPress);
  assert.equal(calls[0][0], "CheckIn");
  assert.equal(calls[0][1].start, start);
  assert.equal(calls[0][1].end, end);
  assert.equal(calls[0][1].source, "manual");
  await click(byTitle("مرور امروز / خط زمان").props.onPress);
  assert.ok(r.root.findByType(FlatList).props.data.length > 0);
  await click(byTitle("روز قبل").props.onPress);
  assert.ok(byTitle("بازگشت به امروز"));
  await click(byTitle("بازه‌های ثبت‌نشدهٔ روزهای قبل").props.onPress);
  assert.deepEqual(calls[1], ["Backlog"]);
  await click(byTitle("بازگشت به امروز").props.onPress);
  assert.equal(r.root.findByType(FlatList).props.data.length, 0);
  await close(r);
});
test("timeline keeps disabled future and neutral pending/skipped states with accessible exact times", async () => {
  for (const state of ["pending", "skipped"]) {
    let tapped = false;
    const r = await mount(
      <SlotRow
        item={
          {
            period_start: "2026-01-01T10:00:00Z",
            period_end: "2026-01-01T10:30:00Z",
            slot: { state },
          } as any
        }
        displayTimezone="UTC"
        onPress={() => (tapped = true)}
      />,
    );
    const p = r.root.findByType("Pressable" as any);
    assert.equal(p.props.disabled, false);
    assert.ok(
      p.props.accessibilityLabel.includes(
        state === "skipped" ? "رد شده" : "ثبت نشده",
      ),
    );
    await click(p.props.onPress);
    assert.equal(tapped, true);
    await close(r);
  }
  const future = await mount(
    <SlotRow
      item={
        {
          period_start: "2099-01-01T10:00:00Z",
          period_end: "2099-01-01T10:30:00Z",
        } as any
      }
      onPress={() => {}}
    />,
  );
  assert.equal(
    future.root.findByType("Pressable" as any).props.accessibilityState
      .disabled,
    true,
  );
  await close(future);
});
