import React from "react";
import { test, before, after, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { ReportRangeControls } from "../src/components/ReportRangeControls";
import {
  ReportActivitySummary,
  summarizeReportActivities,
  reportPercent,
} from "../src/components/ReportActivitySummary";
import { Button, Input, IdentifierBadge } from "../src/components/Ui";
import {
  uiIdentifiers,
  reservedClassificationUiCodes,
} from "../src/components/uiIdentifiers";
import {
  reportTheme,
  reportTypography,
  REPORT_SUMMARY_LIMIT,
} from "../src/theme/reportTheme";
import { initDatabase } from "../src/db/database";
import { db, transaction } from "../src/db/connection";
import { saveActivity } from "../src/services/classificationService";
import { commitCheckIn } from "../src/services/checkInService";
import { getReport } from "../src/services/reportService";
import { setMeta } from "../src/db/metaRepository";
import { timezone } from "../src/utils/slots";
import { toPersianDuration } from "../src/utils/time";
import { readIO, readFailures } from "./sqlite.mjs";
import {
  dimensions,
  I18nManager,
  appStateListenerCount,
  emitAppState,
} from "./react-native.mjs";
import { emitFocus, focusListenerCount } from "./navigation.mjs";
import { fontState } from "./fonts.mjs";
import type { Mode } from "../src/utils/reportPeriods";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const now = new Date("2026-10-12T12:00:00.000Z"),
  live = new Set<ReactTestRenderer>(),
  releases = new Set<() => void>();
const tick = () => new Promise<void>((r) => setImmediate(r));
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await tick();
  });
}
async function mount(element: React.ReactElement = <InsightsScreen />) {
  let r!: ReactTestRenderer;
  await run(() => {
    r = create(element);
    live.add(r);
  });
  return r;
}
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const inModal = (node: any) => {
  let p = node.parent;
  while (p) {
    if (p.type === "Modal") return true;
    p = p.parent;
  }
  return false;
};
const button = (r: ReactTestRenderer, code: string) => {
  const candidates = r.root
    .findAllByType(Button)
    .filter((b) => b.props.actionCode === code);
  return candidates.find(inModal) ?? candidates[0]!;
};
const field = (r: ReactTestRenderer, code: string) =>
  r.root
    .findAllByType(Input)
    .find((p) => p.props.actionCode === code)!
    .findByType("TextInput" as any);
const query = (r: ReactTestRenderer) =>
  r.root.findByType(ReportRangeControls).props.q;
async function press(r: ReactTestRenderer, code: string) {
  const b = button(r, code);
  assert.ok(b, code);
  assert.equal(!!b.props.disabled, false, code);
  if (r.root.findAllByType("Modal" as any).length)
    assert.ok(inModal(b), `${code} must be inside the open sheet`);
  await run(() => b.props.onPress());
}
async function readCount() {
  return (await (
    await db()
  ).getFirstAsync<{ n: number }>("SELECT total_changes() n"))!.n;
}
async function history() {
  const tx = await db();
  return Promise.all(
    [
      "activities",
      "time_entries",
      "entry_classifications",
      "entry_time_context",
      "activity_classification_defaults",
    ].map((t) => tx.getAllAsync(`SELECT * FROM ${t} ORDER BY 1`)),
  );
}
function noClassification(r: ReactTestRenderer) {
  assert.doesNotMatch(text(r), /ICATUS|طبقه‌بندی|دسته|پارتو|unstats\.un\.org/);
  for (const badge of r.root.findAllByType(IdentifierBadge))
    assert.ok(!reservedClassificationUiCodes.includes(badge.props.code));
}
function luminance(hex: string) {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return c[0]! * 0.2126 + c[1]! * 0.7152 + c[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const flatten = (value: any): any =>
  Object.assign(
    {},
    ...(Array.isArray(value) ? value.map(flatten) : [value ?? {}]),
  );
function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  releases.add(resolve);
  return { promise, resolve };
}
let reportNames: string[] = [];
before(async () => {
  mock.timers.enable({ apis: ["Date"], now });
  await initDatabase();
  await transaction(async (tx) => {
    await setMeta(tx, "first_used_at", "2025-01-01T00:00:00.000Z");
    await setMeta(tx, "report_calendar", "persian");
    await setMeta(tx, "report_week_start", "7");
  });
  const minutes = [150, 90, 30, 15, 10, 3, 2];
  let start = new Date("2026-10-12T06:00:00.000Z");
  for (let i = 0; i < minutes.length; i++) {
    const name = `فعالیت گزارش ${i + 1} با نام فارسی طولانی برای بررسی خوانایی`;
    reportNames.push(name);
    const id = await saveActivity(null, name, "📚", String(i + 1), null),
      end = new Date(+start + minutes[i]! * 60000);
    await commitCheckIn({
      activityId: id,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      source: "manual",
      expectedEntry: null,
    });
    start = end;
  }
});
afterEach(async () => {
  for (const release of releases) release();
  releases.clear();
  readIO.before = null;
  readFailures.remaining = 0;
  readFailures.match = null;
  for (const r of live) await act(async () => r.unmount());
  live.clear();
  dimensions.fontScale = 1;
  dimensions.width = 400;
  dimensions.height = 800;
  fontState.ready = true;
  fontState.error = null;
  emitFocus(true);
  assert.equal(appStateListenerCount(), 0);
  assert.equal(focusListenerCount(), 0);
  await transaction(async (tx) => {
    await setMeta(tx, "report_calendar", "persian");
    await setMeta(tx, "report_week_start", "7");
  });
});
after(() => mock.timers.reset());

test("M-01 normal view has five presets; D08 open/close/backdrop never changes query, reads or history", async () => {
  const r = await mount(),
    original = { ...query(r) },
    before = await history(),
    writes = await readCount();
  let reads = 0;
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*")) reads++;
  };
  for (const code of ["X77", "X100", "X82", "X83", "X99"])
    assert.ok(button(r, code));
  for (const code of ["X78", "X79", "X80", "X81", "X84", "X88", "X89", "X85"])
    assert.equal(button(r, code), undefined);
  await press(r, "X99");
  assert.ok(text(r).includes("D08"));
  assert.deepEqual(query(r), original);
  for (const code of ["X77", "X78", "X79", "X80", "X81", "X82", "X83", "X84"])
    assert.ok(button(r, code));
  const backdrop = r.root
    .findAllByType("Pressable" as any)
    .find((p) => p.props.accessibilityLabel === "بستن پنجره بدون انتخاب تازه")!;
  assert.equal(backdrop.findAllByType("Pressable" as any).length, 1);
  await run(() => backdrop.props.onPress());
  assert.ok(!text(r).includes("D08"));
  await press(r, "X99");
  const modal = r.root.findByType("Modal" as any);
  await run(() => modal.props.onRequestClose());
  assert.equal(reads, 0);
  assert.equal(await readCount(), writes);
  assert.deepEqual(await history(), before);
  noClassification(r);
});

test("every existing mode keeps its query/range/result; absolute X100 differs from relative X85 and presets reset offset", async () => {
  const r = await mount();
  await press(r, "X99");
  const modes: [string, Mode][] = [
    ["X77", "day"],
    ["X78", "week"],
    ["X79", "month"],
    ["X80", "usage7"],
    ["X81", "usage30"],
    ["X82", "rolling7"],
    ["X83", "rolling30"],
    ["X84", "custom"],
  ];
  for (const [code, mode] of modes) {
    await press(r, code);
    assert.equal(query(r).mode, mode);
    assert.equal(query(r).offset, 0);
    if (mode === "custom") {
      await run(() => {
        field(r, "X97").props.onChangeText("2026-10-01");
        field(r, "X98").props.onChangeText("2026-10-12");
      });
      await press(r, "X90");
    }
    const expected = await getReport(query(r), timezone(), now),
      actual = r.root.findByType(ReportActivitySummary);
    assert.equal(actual.props.total, expected.total);
    assert.deepEqual(actual.props.activities, expected.activities);
    assert.ok(
      text(r).includes(
        new Date(expected.range.start).toLocaleDateString(
          query(r).calendar === "persian" ? "fa-IR" : "en-GB",
          {
            timeZone: timezone(),
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
      ),
    );
  }
  await press(r, "X79");
  await press(r, "X85");
  await press(r, "X85");
  assert.equal(query(r).mode, "month");
  assert.equal(query(r).offset, -2);
  await press(r, "X18");
  await press(r, "X100");
  await press(r, "X99");
  assert.equal(query(r).mode, "day");
  assert.equal(query(r).offset, -1);
  await press(r, "X85");
  assert.equal(query(r).mode, "day");
  assert.equal(query(r).offset, -2);
  await press(r, "X86");
  assert.equal(query(r).mode, "day");
  assert.equal(query(r).offset, 0);
  assert.equal(button(r, "X87").props.disabled, true);
  await press(r, "X79");
  await press(r, "X85");
  await press(r, "X86");
  assert.equal(query(r).mode, "month");
  assert.equal(query(r).offset, 0);
  await press(r, "X82");
  assert.equal(query(r).mode, "rolling7");
  assert.equal(query(r).offset, 0);
  await press(r, "X85");
  await press(r, "X87");
  assert.equal(query(r).offset, 0);
  await press(r, "X83");
  assert.equal(query(r).mode, "rolling30");
  assert.equal(query(r).offset, 0);
  await press(r, "X18");
  assert.equal(query(r).mode, "rolling30");
  assert.equal(query(r).offset, 0);
  noClassification(r);
});

test("custom dates remain draft until X90, invalid/reversed dates show errors, valid end date remains inclusive", async () => {
  const r = await mount();
  await press(r, "X99");
  await press(r, "X84");
  assert.match(text(r), /دو تاریخ لازم است/);
  assert.equal(r.root.findAllByType(ReportActivitySummary).length, 0);
  let reads = 0;
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*")) reads++;
  };
  await run(() => {
    field(r, "X97").props.onChangeText("2026-02-30");
    field(r, "X98").props.onChangeText("2026-10-12");
  });
  assert.equal(reads, 0);
  await press(r, "X90");
  assert.equal(query(r).customStart, "2026-02-30");
  assert.equal(r.root.findAllByType(ReportActivitySummary).length, 0);
  assert.ok(
    r.root
      .findAllByType("Text" as any)
      .some((n) => n.props.accessibilityRole === "alert"),
  );
  await run(() => {
    field(r, "X97").props.onChangeText("2026-10-13");
    field(r, "X98").props.onChangeText("2026-10-12");
  });
  await press(r, "X90");
  assert.match(text(r), /ترتیب تاریخ‌ها نادرست است/);
  await run(() => {
    field(r, "X97").props.onChangeText("2026-10-12");
    field(r, "X98").props.onChangeText("2026-10-12");
  });
  await press(r, "X90");
  const data = await getReport(query(r), timezone(), now);
  assert.equal(data.total, 300);
  assert.equal(
    new Date(data.range.end).getTime() - new Date(data.range.start).getTime(),
    86400000,
  );
  await press(r, "X18");
  assert.equal(query(r).customStart, "2026-10-12");
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 300);
  noClassification(r);
});

test("day/week/month boundaries, calendar and week-start preferences keep existing contracts and metadata", async () => {
  const r = await mount(),
    zone = timezone(),
    tehran = zone === "Asia/Tehran";
  let data = await getReport(query(r), zone, now);
  assert.equal(
    data.range.start,
    tehran ? "2026-10-11T20:30:00.000Z" : "2026-10-12T00:00:00.000Z",
  );
  await press(r, "X99");
  await press(r, "X78");
  data = await getReport(query(r), zone, now);
  assert.equal(
    data.range.start,
    tehran ? "2026-10-09T20:30:00.000Z" : "2026-10-10T00:00:00.000Z",
  );
  await press(r, "X89");
  assert.equal(query(r).weekStart, 1);
  data = await getReport(query(r), zone, now);
  assert.equal(
    data.range.start,
    tehran ? "2026-10-10T20:30:00.000Z" : "2026-10-11T00:00:00.000Z",
  );
  await press(r, "X88");
  await press(r, "X79");
  data = await getReport(query(r), zone, now);
  assert.equal(
    data.range.start,
    tehran ? "2026-09-30T20:30:00.000Z" : "2026-10-01T00:00:00.000Z",
  );
  await press(r, "X88");
  data = await getReport(query(r), zone, now);
  assert.equal(
    data.range.start,
    tehran ? "2026-09-22T20:30:00.000Z" : "2026-09-23T00:00:00.000Z",
  );
  await press(r, "X18");
  assert.match(text(r), /تقویم شمسی/);
  assert.equal(button(r, "X99").props.selected, true);
  assert.match(text(r), /یکشنبه/);
  assert.ok(text(r).includes(zone));
  const tzText = r.root
    .findAllByType("Text" as any)
    .find((n) => n.children.join("") === zone)!;
  assert.equal(flatten(tzText.props.style).writingDirection, "ltr");
});

test("M-04 known five-hour result: three principal rows and exact Other, all inline with unchanged total/query and no read/write", async () => {
  const r = await mount(),
    snapshot = await history(),
    q = { ...query(r) },
    summary = r.root.findByType(ReportActivitySummary);
  assert.equal(summary.props.total, 300);
  assert.equal(REPORT_SUMMARY_LIMIT, 3);
  const view = summarizeReportActivities(
    summary.props.activities,
    summary.props.total,
  );
  assert.deepEqual(
    view.main.map((a) => a.minutes),
    [150, 90, 30],
  );
  assert.equal(view.otherMinutes, 30);
  assert.equal(view.remaining.length, 4);
  assert.deepEqual(
    view.segments.map((s) => s.share),
    [0.5, 0.3, 0.1, 0.1],
  );
  assert.deepEqual(
    view.segments.map((s) => reportPercent(s.minutes, 300)),
    ["۵۰٪", "۳۰٪", "۱۰٪", "۱۰٪"],
  );
  assert.ok(text(r).includes(reportNames[0]!));
  assert.ok(!text(r).includes(reportNames[6]!));
  assert.match(text(r), /سایر/);
  const arcs = summary
    .findAllByType("SvgCircle" as any)
    .filter((c) => c.props.strokeDasharray);
  assert.equal(arcs.length, 4);
  assert.ok(
    Math.abs(
      arcs.reduce((v, c) => v + c.props.strokeDasharray[0], 0) -
        2 * Math.PI * 76,
    ) < 1e-9,
  );
  let reads = 0;
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*")) reads++;
  };
  const writes = await readCount();
  await press(r, "X101");
  for (const name of reportNames) assert.ok(text(r).includes(name));
  assert.equal(summary.props.total, 300);
  assert.deepEqual(query(r), q);
  assert.equal(reads, 0);
  assert.equal(await readCount(), writes);
  assert.deepEqual(await history(), snapshot);
  assert.equal(button(r, "X101").props.disabled, true);
  assert.match(text(r), /سهم تا این ردیف/);
  assert.ok(text(r).includes("X101"));
  assert.equal(
    summary
      .findAllByType("SvgCircle" as any)
      .filter((c) => c.props.strokeDasharray).length,
    4,
  );
  await press(r, "X82");
  assert.equal(button(r, "X101").props.disabled, false);
  noClassification(r);
});

test("projection preserves service order and fractional minutes; rounding affects labels only", async () => {
  const rows = [150.123, 90.456, 30.789, 0.111, 0.222].map((minutes, id) =>
    Object.freeze({ id, name: `row ${id}`, minutes, icon: "📚" }),
  );
  Object.freeze(rows);
  const total = rows.reduce((v, r) => v + r.minutes, 0),
    before = JSON.stringify(rows),
    view = summarizeReportActivities(rows, total);
  assert.equal(view.otherMinutes, 0.111 + 0.222);
  assert.equal(view.main[0]!.minutes, 150.123);
  // Grouped addition may differ by one floating-point ULP; no minute is rounded.
  assert.ok(
    Math.abs(view.segments.reduce((v, s) => v + s.minutes, 0) - total) <=
      Number.EPSILON * total * 4,
  );
  assert.equal(view.segments[0]!.share, 150.123 / total);
  assert.equal(JSON.stringify(rows), before);
  const r = await mount(
    <ReportActivitySummary
      activities={rows}
      total={total}
      typography={reportTypography(true)}
    />,
  );
  await press(r, "X101");
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, total);
  assert.equal(JSON.stringify(rows), before);
  assert.equal(reportPercent(0, 0), "—");
});

test("zero/loading/error retain A03 and controls; retry recovers current result without stale successful totals", async () => {
  const r = await mount();
  await press(r, "X100");
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 0);
  assert.match(text(r), /بازه‌ای ثبت نشده است/);
  assert.ok(!text(r).includes("NaN"));
  assert.equal(
    r.root
      .findAllByType("SvgCircle" as any)
      .filter((c) => c.props.strokeDasharray).length,
    0,
  );
  const g = gate();
  let held = false;
  readIO.before = async (sql) => {
    if (!held && sql.includes("SELECT e.*")) {
      held = true;
      await g.promise;
    }
  };
  await press(r, "X77");
  assert.equal(r.root.findAllByType(ReportActivitySummary).length, 0);
  assert.ok(text(r).includes("A03"));
  assert.ok(button(r, "X99"));
  await run(() => g.resolve());
  readIO.before = null;
  readFailures.match = "SELECT e.*";
  readFailures.remaining = 1;
  await run(() => emitAppState("active"));
  assert.match(text(r), /Injected read failure/);
  assert.equal(r.root.findAllByType(ReportActivitySummary).length, 0);
  await press(r, "X91");
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 300);
  noClassification(r);
});

test("out-of-order reads and cleanup keep latest query/result; mere refocus and report interactions add no data writes", async () => {
  const r = await mount(),
    first = gate(),
    second = gate();
  let stage = 0;
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*") && stage === 0) {
      stage = 1;
      await first.promise;
    } else if (sql.includes("SELECT e.*") && stage === 1) {
      stage = 2;
      await second.promise;
    }
  };
  await press(r, "X82");
  await press(r, "X83");
  assert.equal(query(r).mode, "rolling30");
  await run(() => first.resolve());
  assert.equal(r.root.findAllByType(ReportActivitySummary).length, 0);
  await run(() => second.resolve());
  readIO.before = null;
  assert.equal(query(r).mode, "rolling30");
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 300);
  const writes = await readCount(),
    before = await history();
  await run(() => {
    emitFocus(false);
    emitFocus(true);
    emitAppState("active");
  });
  assert.equal(await readCount(), writes);
  assert.deepEqual(await history(), before);
  const pending = gate();
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*")) await pending.promise;
  };
  await press(r, "X77");
  await act(async () => r.unmount());
  live.delete(r);
  await run(() => pending.resolve());
  readIO.before = null;
  assert.equal(await readCount(), writes);
  assert.deepEqual(await history(), before);
});

for (const scale of [1, 1.5, 2])
  test(`RTL/long names/font scale ${scale}: code shares one 48dp target, wraps, no badge on donut and no ICATUS`, async () => {
    dimensions.fontScale = scale;
    assert.equal(I18nManager.isRTL, true);
    const r = await mount();
    await press(r, "X99");
    for (const badge of r.root.findAllByType(IdentifierBadge)) {
      const entry = Object.values(uiIdentifiers).find(
        (e) => e.code === badge.props.code,
      )!;
      const nativeText = badge.findByType("Text" as any);
      const style = flatten(nativeText.props.style);
      assert.ok(style.fontSize >= 14);
      assert.equal(style.writingDirection, "ltr");
      assert.equal(nativeText.props.allowFontScaling, true);
      assert.equal(nativeText.props.numberOfLines, undefined);
      if (entry.kind === "action") {
        let parent = badge.parent;
        while (parent && parent.type !== ("Pressable" as any))
          parent = parent.parent;
        assert.ok(parent, entry.code);
        assert.equal(parent.findAllByType("Pressable" as any).length, 1);
        const container = flatten(
          typeof parent.props.style === "function"
            ? parent.props.style({ pressed: false })
            : parent.props.style,
        );
        assert.ok(container.minHeight >= 48);
        assert.ok(container.minWidth >= 48);
        if (container.backgroundColor)
          assert.ok(
            contrast(style.color, container.backgroundColor) >= 4.5,
            entry.code,
          );
      }
    }
    const before = { ...query(r) };
    const native = r.root
      .findAllByType("Pressable" as any)
      .find(
        (p) =>
          p.props.accessibilityLabel === "روز قبل" &&
          p.findAllByType(IdentifierBadge).some((b) => b.props.code === "X100"),
      )!;
    await run(() => native.props.onPress());
    assert.equal(query(r).offset, -1);
    assert.equal(query(r).mode, "day");
    assert.equal(before.offset, 0);
    await press(r, "X77");
    const donut = r.root
      .findAllByType("Svg" as any)
      .find((p) => p.props.testID === "activity-share-donut")!;
    assert.equal(donut.findAllByType(IdentifierBadge).length, 0);
    const page = r.root
      .findAllByType("Text" as any)
      .find((p) => p.children.join("") === "گزارش زمان")!;
    assert.equal(flatten(page.props.style).fontFamily, "Time80ReportBold");
    assert.equal(flatten(page.props.style).fontSize, 26);
    noClassification(r);
  });

test("font IO loading/failure remains usable with explicit fallback and never changes report query or data", async () => {
  fontState.ready = false;
  const r = await mount();
  const original = { ...query(r) },
    writes = await readCount();
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 300);
  fontState.error = Error("font IO unavailable");
  await run(() => r.update(<InsightsScreen />));
  assert.match(text(r), /فونت گزارش بارگذاری نشد/);
  assert.deepEqual(query(r), original);
  assert.equal(await readCount(), writes);
  fontState.error = null;
  fontState.ready = true;
  await run(() => r.update(<InsightsScreen />));
  assert.ok(!text(r).includes("فونت گزارش بارگذاری نشد"));
  assert.equal(r.root.findByType(ReportActivitySummary).props.total, 300);
});
