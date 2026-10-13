import React from "react";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { saveActivity } from "../src/services/classificationService";
import { commitCheckIn } from "../src/services/checkInService";
import { TodayScreen, timelinePresentation } from "../src/screens/TodayScreen";
import {
  TodayOverview,
  dayPresentationProgress,
} from "../src/components/TodayOverview";
import { DayPassage, DayCandle } from "../src/components/DayPassage";
import { SlotRow } from "../src/components/SlotRow";
import { ActivityIcon } from "../src/components/ActivityIcon";
import { Button, IdentifierBadge } from "../src/components/Ui";
import { reportTypography } from "../src/theme/reportTheme";
import { initDatabase, getSettings } from "../src/db/database";
import { db } from "../src/db/connection";
import { timezone, zoned, iso } from "../src/utils/slots";
import {
  dimensions,
  emitAppState,
  appStateListenerCount,
} from "./react-native.mjs";
import { emitFocus, focusListenerCount } from "./navigation.mjs";
import { readFailures, readIO } from "./sqlite.mjs";
import { fontState } from "./fonts.mjs";
import type { SlotView } from "../src/types/domain";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const fixed = Date.parse("2026-10-12T12:00:00Z"),
  hours = { day_start: "08:00", day_end: "16:00" };
const live = new Set<ReactTestRenderer>(),
  releases = new Set<() => void>();
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
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
async function close(r: ReactTestRenderer) {
  await run(() => r.unmount());
  live.delete(r);
}
const flatten = (s: any): any =>
  Object.assign({}, ...(Array.isArray(s) ? s.map(flatten) : [s || {}]));
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const button = (r: ReactTestRenderer, code: string) =>
  r.root.findAllByType(Button).find((n) => n.props.actionCode === code)!;
const overview = (r: ReactTestRenderer) => r.root.findByType(TodayOverview);
const progress = (r: ReactTestRenderer) =>
  r.root.findByType(DayPassage).props.progress;
async function recordedState() {
  const tx = await db();
  return Promise.all([
    tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    tx.getAllAsync("SELECT * FROM entry_classifications ORDER BY entry_id"),
    tx.getAllAsync("SELECT * FROM entry_time_context ORDER BY entry_id"),
    tx.getFirstAsync("SELECT * FROM settings"),
  ]);
}
beforeEach(async (t) => {
  assert.ok("mock" in t);
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: fixed });
  await initDatabase();
  const tx = await db();
  await tx.runAsync(
    "UPDATE settings SET notification_enabled=0,interval_minutes=60,day_start='08:00',day_end='16:00',active_days='[1,2,3,4,5,6,7]'",
  );
  await tx.runAsync("DELETE FROM expected_slots");
  await tx.runAsync(
    "DELETE FROM app_meta WHERE key IN ('slot_horizon_end','schedule_timezone')",
  );
  if (!(await tx.getFirstAsync("SELECT id FROM time_entries LIMIT 1"))) {
    const id = await saveActivity(null, "سابقه محفوظ", "📚", "1", null);
    await commitCheckIn({
      activityId: id,
      periodStart: "2026-01-02T10:00:00Z",
      periodEnd: "2026-01-02T10:30:00Z",
      source: "manual",
      expectedEntry: null,
    });
  }
  readIO.before = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  fontState.ready = true;
  fontState.error = null;
});
afterEach(async (t) => {
  for (const release of releases) release();
  releases.clear();
  await run(() => {
    for (const r of live) r.unmount();
  });
  live.clear();
  readIO.before = null;
  readFailures.match = null;
  readFailures.remaining = 0;
  dimensions.fontScale = 1;
  dimensions.width = 400;
  fontState.ready = true;
  fontState.error = null;
  emitFocus(true);
  assert.equal(appStateListenerCount(), 0);
  assert.equal(focusListenerCount(), 0);
  assert.ok("mock" in t);
  t.mock.timers.reset();
});
test("configured-day progress derives from explicit zoned endpoints, clamps and rejects unsupported settings", () => {
  for (const [zone, offset] of [
    ["UTC", "Z"],
    ["Asia/Tehran", "+03:30"],
  ]) {
    for (const [time, expected] of [
      ["00:00", 0],
      ["07:59", 0],
      ["08:00", 0],
      ["12:00", 0.5],
      ["16:00", 1],
      ["23:59", 1],
    ] as const)
      assert.equal(
        dayPresentationProgress(
          new Date(`2026-06-04T${time}:00${offset}`),
          hours,
          zone,
        ),
        expected,
      );
    for (const bad of [
      { day_start: "bad", day_end: "16:00" },
      { day_start: "08:00", day_end: "08:00" },
      { day_start: "22:00", day_end: "06:00" },
      { day_start: "08:00", day_end: "25:00" },
    ])
      assert.equal(dayPresentationProgress(new Date(fixed), bad, zone), null);
    assert.equal(dayPresentationProgress(new Date(NaN), hours, zone), null);
  }
  assert.equal(dayPresentationProgress(new Date(fixed), null), null);
  assert.equal(
    dayPresentationProgress(new Date(fixed), hours, "bad/zone"),
    null,
  );
  assert.equal(
    dayPresentationProgress(
      new Date("2026-06-04T08:30Z"),
      hours,
      "Asia/Tehran",
    ),
    0.5,
  );
  assert.equal(
    dayPresentationProgress(new Date("2026-06-04T08:30Z"), hours, "UTC"),
    1 / 16,
  );
  assert.equal(
    dayPresentationProgress(
      new Date("2026-06-05T00:00+03:30"),
      hours,
      "Asia/Tehran",
    ),
    0,
  );
  assert.equal(
    dayPresentationProgress(
      new Date("2026-03-08T12:00-04:00"),
      { day_start: "00:00", day_end: "16:00" },
      "America/New_York",
    ),
    11 / 15,
  );
  assert.equal(
    dayPresentationProgress(
      new Date("2026-11-01T12:00-05:00"),
      { day_start: "00:00", day_end: "16:00" },
      "America/New_York",
    ),
    13 / 17,
  );
});
test("candle and donut share the exact progress; only displayed percent is rounded; no false percentage for unknown", async () => {
  for (const value of [0, 0.5, 1, 1 / 3, null]) {
    const r = await mount(
      <DayPassage progress={value} typography={reportTypography(true)} />,
    );
    const candle = r.root.findByType(DayCandle);
    assert.equal(candle.props.progress, value);
    const wax = r.root
      .findAllByType("SvgRect" as any)
      .find((n) => n.props.testID === "candle-wax")!;
    assert.equal(
      wax.props.height,
      value === null ? 78 : 24 + 108 * (1 - value),
    );
    const segment = r.root
      .findAllByType("SvgCircle" as any)
      .find((n) => n.props.testID === "day-passage-segment");
    if (value === null || value === 0) assert.equal(segment, undefined);
    else
      assert.equal(
        segment!.props.strokeDasharray[0] / (2 * Math.PI * 70),
        value,
      );
    const bar = r.root
      .findAllByType("View" as any)
      .find((n) => n.props.accessibilityRole === "progressbar");
    if (value === null) {
      assert.equal(bar, undefined);
      assert.ok(text(r).includes("درصد روز در دسترس نیست"));
    } else
      assert.equal(bar!.props.accessibilityValue.now, Math.round(value * 100));
    await close(r);
  }
});
test("timeline sorts a copy; live A01/A05 preserve original X07, exact X06 manual/past/skipped context and disabled future", async () => {
  const original = [
    { period_start: "2026-10-12T08:00Z" },
    { period_start: "2026-10-12T11:00Z" },
    { period_start: "2026-10-12T09:00Z" },
  ] as SlotView[];
  const frozen = JSON.stringify(original);
  assert.deepEqual(
    timelinePresentation(original).map((i) => i.period_start),
    [
      original[1]!.period_start,
      original[2]!.period_start,
      original[0]!.period_start,
    ],
  );
  assert.equal(JSON.stringify(original), frozen);
  const tx = await db(),
    local = zoned(new Date(fixed));
  const start = iso(local.startOfDay()),
    end = iso(local.startOfDay().add({ minutes: 30 }));
  await tx.runAsync(
    "INSERT OR IGNORE INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,30,'skipped',?,?)",
    start,
    end,
    start,
    start,
  );
  const dueStart = iso(local.startOfDay().add({ minutes: 30 })),
    dueEnd = iso(local.startOfDay().add({ minutes: 60 }));
  await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,30,'pending',?,?)",
    dueStart,
    dueEnd,
    dueStart,
    dueStart,
  );
  const routes: any[] = [];
  const r = await mount(
    <TodayScreen
      navigation={{ navigate: (...args: any[]) => routes.push(args) }}
    />,
  );
  const items = overview(r).props.items as SlotView[],
    before = JSON.stringify(items);
  const expected = items.find(
    (i) =>
      !i.entry &&
      i.slot?.state === "pending" &&
      +new Date(i.period_end) <= Date.now(),
  );
  assert.ok(expected);
  assert.equal(overview(r).props.pending, expected);
  await run(() => button(r, "X07").props.onPress());
  assert.deepEqual(routes.at(-1), [
    "CheckIn",
    {
      start: expected.period_start,
      end: expected.period_end,
      source: "manual",
      slotId: expected.slot?.id,
      entryState: expected.slot?.state,
    },
  ]);
  const rows = r.root.findAllByType(SlotRow);
  assert.deepEqual(
    rows.map((n) => n.props.item.period_start),
    timelinePresentation(items).map((i) => i.period_start),
  );
  for (const node of rows) {
    const i = node.props.item,
      target = node.findByType("Pressable" as any);
    if (+new Date(i.period_end) > Date.now()) {
      assert.equal(target.props.disabled, true);
      continue;
    }
    const prev = routes.length;
    await run(() => target.props.onPress());
    assert.equal(routes.length, prev + 1);
    assert.deepEqual(routes.at(-1), [
      "CheckIn",
      {
        start: i.period_start,
        end: i.period_end,
        source: "manual",
        slotId: i.slot?.id,
        entryState: i.slot?.state,
      },
    ]);
  }
  assert.equal(JSON.stringify(items), before);
  await run(() => button(r, "X08").props.onPress());
  assert.ok(text(r).includes("A05"));
  assert.ok(!text(r).includes("A01"));
  await run(() => button(r, "X10").props.onPress());
  assert.equal(button(r, "X12").props.disabled, false);
  await run(() => button(r, "X12").props.onPress());
  assert.equal(button(r, "X12").props.disabled, true);
  await run(() => button(r, "X11").props.onPress());
  assert.ok(text(r).includes("A05"));
  await run(() => button(r, "X13").props.onPress());
  assert.deepEqual(routes.at(-1), ["Backlog"]);
  await run(() => button(r, "X09").props.onPress());
  assert.ok(text(r).includes("A01"));
});
test("foreground minute is UI-only; background/focus resume refresh actual time/settings; cleanup stops reads and timers", async (t) => {
  const r = await mount(<TodayScreen navigation={{ navigate: () => {} }} />);
  let reads = 0;
  readIO.before = async () => {
    reads++;
  };
  const state = await recordedState(),
    tx = await db();
  const changes = await tx.getFirstAsync<{ n: number }>(
    "SELECT total_changes() n",
  );
  reads = 0;
  await run(() => t.mock.timers.tick(60000));
  assert.equal(+overview(r).props.now, fixed + 60000);
  assert.equal(reads, 0);
  assert.deepEqual(await recordedState(), state);
  assert.deepEqual(await tx.getFirstAsync("SELECT total_changes() n"), changes);
  await run(() => emitAppState("background"));
  await run(() => t.mock.timers.tick(3600000));
  assert.equal(+overview(r).props.now, fixed + 60000);
  await tx.runAsync("UPDATE settings SET day_start='09:00',day_end='17:00'");
  await run(() => emitAppState("active"));
  assert.equal(+overview(r).props.now, fixed + 3660000);
  assert.deepEqual(
    {
      day_start: overview(r).props.settings.day_start,
      day_end: overview(r).props.settings.day_end,
    },
    { day_start: "09:00", day_end: "17:00" },
  );
  assert.equal(
    progress(r),
    dayPresentationProgress(new Date(), await getSettings(), timezone()),
  );
  await run(() => emitFocus(false));
  const clock = +overview(r).props.now;
  reads = 0;
  await run(() => {
    t.mock.timers.tick(60000);
    emitAppState("background");
    emitAppState("active");
  });
  assert.equal(+overview(r).props.now, clock);
  assert.equal(reads, 0);
  await run(() => emitFocus(true));
  assert.equal(+overview(r).props.now, Date.now());
  assert.equal(appStateListenerCount(), 1);
  await close(r);
  reads = 0;
  await run(() => {
    t.mock.timers.tick(120000);
    emitAppState("background");
    emitAppState("active");
  });
  assert.equal(reads, 0);
});
test("midnight and timezone refresh pair timeline/date/progress context; no recording writes", async (t) => {
  const originalTZ = process.env.TZ;
  try {
    process.env.TZ = "UTC";
    t.mock.timers.setTime(Date.parse("2026-10-12T23:59:30Z"));
    const r = await mount(<TodayScreen navigation={{ navigate: () => {} }} />);
    const before = (await recordedState()).slice(0, 3);
    await run(() => t.mock.timers.tick(60000));
    assert.equal(overview(r).props.displayTimezone, "UTC");
    assert.equal(progress(r), 0);
    assert.ok(
      (overview(r).props.items as SlotView[]).every(
        (i) => zoned(new Date(i.period_start), "UTC").day === 13,
      ),
    );
    await run(() => emitAppState("background"));
    process.env.TZ = "Asia/Tehran";
    await run(() => emitAppState("active"));
    assert.equal(overview(r).props.displayTimezone, "Asia/Tehran");
    assert.ok(
      (overview(r).props.items as SlotView[]).every(
        (i) => zoned(new Date(i.period_start), "Asia/Tehran").day === 13,
      ),
    );
    assert.equal(
      progress(r),
      dayPresentationProgress(new Date(), hours, "Asia/Tehran"),
    );
    assert.deepEqual((await recordedState()).slice(0, 3), before);
  } finally {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  }
});
test("loading/error/empty retain screen identity; stale/unmounted reads cannot overwrite newer focus response", async () => {
  let release!: () => void,
    entered = false;
  const gate = new Promise<void>((r) => {
    release = r;
    releases.add(r);
  });
  readIO.before = async (sql) => {
    if (sql.includes("expected_slots WHERE period_start") && !entered) {
      entered = true;
      await gate;
    }
  };
  const r = await mount(<TodayScreen navigation={{ navigate: () => {} }} />);
  assert.ok(entered);
  assert.ok(text(r).includes("A01"));
  assert.ok(text(r).includes("در حال خواندن"));
  assert.equal(progress(r), null);
  await run(() => emitFocus(false));
  await run(() => emitFocus(true));
  // The real SQLite snapshot queue serializes these reads: a newer focus
  // waits for the older read. Its failed result must not set the new UI error.
  assert.equal(progress(r), null);
  readFailures.match = "expected_slots";
  readFailures.remaining = 1;
  await run(() => release());
  const fresh = JSON.stringify(overview(r).props.items);
  assert.equal(
    progress(r),
    dayPresentationProgress(new Date(), hours, timezone()),
  );
  assert.ok(!text(r).includes("Injected read failure"));
  assert.equal(JSON.stringify(overview(r).props.items), fresh);
  readFailures.match = "expected_slots";
  readFailures.remaining = 1;
  await run(() => emitFocus(false));
  await run(() => emitFocus(true));
  assert.ok(text(r).includes("Injected read failure"));
  assert.ok(text(r).includes("A01"));
  assert.equal(progress(r), null);
  readIO.before = null;
  await run(() => emitFocus(false));
  await run(() => emitFocus(true));
  assert.ok(!text(r).includes("Injected read failure"));
  await run(() => button(r, "X10").props.onPress());
  assert.ok(text(r).includes("A05"));
  assert.ok(text(r).includes("برای این روز بازه‌ای وجود ندارد"));
  await close(r);
  // Gate a new request, unmount before completion, then settle; no listeners remain.
  entered = false;
  const pending = new Promise<void>((r) => {
    release = r;
    releases.add(r);
  });
  readIO.before = async (sql) => {
    if (sql.includes("expected_slots WHERE period_start") && !entered) {
      entered = true;
      await pending;
    }
  };
  const old = await mount(<TodayScreen navigation={{ navigate: () => {} }} />);
  assert.ok(entered);
  await close(old);
  await run(() => release());
  assert.equal(appStateListenerCount(), 0);
});
test("invalid/equal/overnight configured hours expose a read error without percent or recording writes", async () => {
  const tx = await db();
  for (const [start, end] of [
    ["bad", "16:00"],
    ["08:00", "08:00"],
    ["22:00", "06:00"],
  ]) {
    await tx.runAsync(
      "UPDATE settings SET day_start=?,day_end=?",
      start!,
      end!,
    );
    const before = (await recordedState()).slice(0, 3);
    const r = await mount(<TodayScreen navigation={{ navigate: () => {} }} />);
    assert.ok(text(r).includes("A01"));
    assert.ok(text(r).includes("پایان باید بعد از شروع در همان روز باشد"));
    assert.equal(progress(r), null);
    assert.ok(text(r).includes("درصد روز در دسترس نیست"));
    assert.ok(!text(r).includes("در حال خواندن"));
    assert.deepEqual((await recordedState()).slice(0, 3), before);
    await close(r);
  }
});
test("M-10 source layout at scales 1/1.5/2 keeps full names, asset/legacy identity, code inside one target and shared caller defaults", async () => {
  const raw = "متن آزاد 👨‍👩‍👧‍👦 work",
    name = "نام بسیار بلند فعالیت برای آزمون خوانایی و حفظ تمام محتوای نام";
  for (const scale of [1, 1.5, 2]) {
    dimensions.fontScale = scale;
    const r = await mount(
      <TodayOverview
        now={new Date(fixed)}
        settings={hours}
        items={[]}
        onDue={() => {}}
        onReview={() => {}}
        fontReady
      />,
    );
    const header = r.root
      .findAllByType("View" as any)
      .find((n) => n.props.testID === "today-header")!;
    assert.equal(
      flatten(header.props.style).flexDirection,
      scale === 1 ? "row" : "column",
    );
    assert.equal(flatten(header.props.style).direction, "ltr");
    const image = r.root
      .findAllByType("Image" as any)
      .find((n) => n.props.resizeMode === "cover")!;
    assert.equal(image.props.resizeMode, "cover");
    assert.equal(image.props.accessible, false);
    for (const n of r.root.findAllByType("Text" as any)) {
      assert.notEqual(n.props.allowFontScaling, false);
      assert.equal(n.props.numberOfLines, undefined);
      assert.notEqual(n.props.adjustsFontSizeToFit, true);
    }
    await close(r);
    for (const icon of [
      { kind: "asset", key: "work", raw: "💼", unresolved: false },
      { kind: "legacy", raw, unresolved: false },
    ]) {
      let calls = 0;
      const row = await mount(
        <SlotRow
          typography={reportTypography(true)}
          item={
            {
              period_start: "2026-10-11T10:00Z",
              period_end: "2026-10-11T10:30Z",
              entry: {
                status: "logged",
                activity_name: name,
                activity_icon: raw,
                activity_icon_view: icon,
              },
            } as any
          }
          onPress={() => calls++}
        />,
      );
      assert.ok(text(row).includes(name));
      assert.ok(!text(row).includes("در حال انجام"));
      assert.equal(row.root.findAllByType("Pressable" as any).length, 1);
      const target = row.root.findByType("Pressable" as any);
      const style = flatten(
        typeof target.props.style === "function"
          ? target.props.style({ pressed: false })
          : target.props.style,
      );
      assert.ok(style.minHeight >= 48 && style.minWidth >= 48);
      const badge = target.findByType(IdentifierBadge);
      assert.equal(badge.props.code, "X06");
      assert.ok(
        flatten(badge.findByType("Text" as any).props.style).fontSize >= 14,
      );
      const activity = row.root.findByType(ActivityIcon);
      assert.deepEqual(activity.props.presentation, {
        containerSize: 40,
        iconSize: 20,
      });
      if (icon.kind === "legacy") assert.ok(text(row).includes(raw));
      else assert.equal(activity.props.icon.key, "work");
      await run(() => target.props.onPress());
      assert.equal(calls, 1);
      await close(row);
    }
  }
  const fallback = await mount(<ActivityIcon legacy={raw} size={30} />);
  const iconText = fallback.root.findByType("Text" as any);
  assert.equal(flatten(iconText.props.style).fontSize, 30);
  assert.ok(
    fallback.root
      .findAllByType("View" as any)
      .some((v) => flatten(v.props.style).width === 52),
  );
  await close(fallback);
  fontState.ready = false;
  const loadingFont = await mount(
    <TodayScreen navigation={{ navigate: () => {} }} />,
  );
  assert.ok(text(loadingFont).includes("A01"));
  assert.ok(overview(loadingFont).props.fontReady === false);
});
