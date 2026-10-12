import React from "react";
import { test, before, afterEach } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityEditor } from "../src/components/ActivityEditor";
import { CheckInScreen } from "../src/screens/CheckInScreen";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { OnboardingScreen } from "../src/screens/OnboardingScreen";
import {
  Button,
  Input,
  IdentifierBadge,
  errorMessage,
} from "../src/components/Ui";
import {
  uiIdentifiers,
  reservedClassificationUiCodes,
  uiClassificationVisibility,
} from "../src/components/uiIdentifiers";
import { initDatabase, getActivities } from "../src/db/database";
import { db, transaction } from "../src/db/connection";
import {
  saveActivity,
  getActivityEditorSnapshot,
  setActivityDefault,
} from "../src/services/classificationService";
import {
  commitCheckIn,
  getCheckInContext,
} from "../src/services/checkInService";
import { assignEntryClassification } from "../src/db/classificationRepository";
import { dayScopeFor } from "../src/services/dayScopeService";
import { getReport } from "../src/services/reportService";
import { setMeta } from "../src/db/metaRepository";
import { SCHEME, nodes } from "../src/services/classificationDataset";
import { readIO, readFailures } from "./sqlite.mjs";
import { emitFocus } from "./navigation.mjs";
import { alertState, dimensions, emitAppState } from "./react-native.mjs";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const live = new Set<ReactTestRenderer>();
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
    live.add(r);
  });
  return r;
}
const json = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
function hidden(r: ReactTestRenderer, owner: string) {
  assert.doesNotMatch(
    json(r),
    /ICATUS|دسته|طبقه‌بندی|تعریف رسمی|unstats\.un\.org/i,
  );
  assert.ok(json(r).includes(owner), owner);
  for (const n of nodes)
    if (n.title_fa) assert.ok(!json(r).includes(n.title_fa), n.title_fa);
  for (const b of r.root.findAllByType(IdentifierBadge))
    assert.ok(!reservedClassificationUiCodes.includes(b.props.code));
}
const btn = (r: ReactTestRenderer, code: string) =>
  r.root.findAllByType(Button).find((b) => b.props.actionCode === code)!;
const input = (r: ReactTestRenderer, code: string) =>
  r.root
    .findAllByType(Input)
    .find((b) => b.props.actionCode === code)!
    .findByType("TextInput" as any);
const activityTarget = (r: ReactTestRenderer, name: string) =>
  r.root
    .findAllByType("Pressable" as any)
    .find((p) => p.props.accessibilityLabel === name)!;
async function writes() {
  return (await (
    await db()
  ).getFirstAsync<{ n: number }>("SELECT total_changes() n"))!.n;
}
const params = (start = "2026-01-02T10:00:00.000Z") => ({
  start,
  end: new Date(+new Date(start) + 1800000).toISOString(),
  source: "manual",
  dayScope: dayScopeFor(start),
});
function nav() {
  const calls: any[] = [];
  return {
    calls,
    replace: (...args: any[]) => calls.push(["replace", ...args]),
    navigate: (...args: any[]) => calls.push(["navigate", ...args]),
    goBack: () => calls.push(["back"]),
  };
}
let first: number, second: number;
before(async () => {
  await initDatabase();
  first = await saveActivity(null, "فعالیت آزمون نخست", "📚", "1", null);
  second = await saveActivity(null, "فعالیت آزمون دوم", "💼", "2", null);
});
afterEach(async () => {
  readIO.before = null;
  readFailures.remaining = 0;
  readFailures.match = null;
  for (const r of live) await act(async () => r.unmount());
  live.clear();
  dimensions.fontScale = 1;
  emitFocus(true);
  alertState.autoConfirm = true;
  alertState.calls.length = 0;
});

test("hidden editor keeps historical category/revision during rename and icon selection at scales 1/1.5/2; entry alone never writes", async () => {
  for (const scale of [1, 1.5, 2]) {
    dimensions.fontScale = scale;
    const id = await saveActivity(
      null,
      `فعالیت طولانی برای آزمون فرم ${scale}`,
      "📚",
      "1",
      null,
    );
    const snap = await getActivityEditorSnapshot(id);
    const changeCount = await writes();
    let saved = 0;
    const r = await mount(
      <ActivityEditor
        activity={snap.activity}
        onClose={() => {}}
        onSaved={() => saved++}
      />,
    );
    hidden(r, "D02");
    assert.equal(await writes(), changeCount);
    await run(() =>
      input(r, "X93").props.onChangeText(`نام ویرایش‌شده ${scale}`),
    );
    await run(() => btn(r, "X24").props.onPress());
    const target = r.root
      .findAllByType("Pressable" as any)
      .find((p) => p.props.accessibilityLabel === "آیکون مطالعه")!;
    await run(() => target.props.onPress());
    hidden(r, "D02");
    await run(() => {
      btn(r, "X30").props.onPress();
      btn(r, "X30").props.onPress();
    });
    assert.equal(saved, 1);
    const after = await getActivityEditorSnapshot(id);
    assert.equal(after.activity.name, `نام ویرایش‌شده ${scale}`);
    assert.equal(after.iconView.kind, "asset");
    assert.deepEqual(after.category, snap.category);
  }
});

test("new/empty and loading/error editor have no category path; stale hidden revision still rolls back edits", async () => {
  const fresh = await mount(
    <ActivityEditor activity={null} onClose={() => {}} onSaved={() => {}} />,
  );
  hidden(fresh, "D02");
  assert.equal(btn(fresh, "X29").props.disabled, true);
  await run(() =>
    input(fresh, "X93").props.onChangeText("فعالیت تازه بدون انتخاب دستی"),
  );
  await run(() => btn(fresh, "X29").props.onPress());
  const created = (await getActivities()).find(
    (a) => a.name === "فعالیت تازه بدون انتخاب دستی",
  )!;
  assert.equal(
    (await getActivityEditorSnapshot(created.id)).category!.code,
    null,
  );
  const snap = await getActivityEditorSnapshot(first);
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  readIO.before = async (sql) => {
    if (sql.includes("SELECT * FROM activity_classification_defaults"))
      await gate;
  };
  const r = await mount(
    <ActivityEditor
      activity={snap.activity}
      onClose={() => {}}
      onSaved={() => assert.fail("stale save cannot succeed")}
    />,
  );
  hidden(r, "D02");
  assert.equal(btn(r, "X30").props.disabled, true);
  await run(() => release());
  readIO.before = null;
  await setActivityDefault(first, "3", snap.category!.revision);
  await run(() => input(r, "X93").props.onChangeText("تغییر مردود"));
  await run(() => btn(r, "X30").props.onPress());
  hidden(r, "D02");
  assert.match(json(r), /اطلاعات فعالیت تغییر کرده/);
  assert.equal(
    (await getActivityEditorSnapshot(first)).activity.name,
    snap.activity.name,
  );
  assert.equal((await getActivityEditorSnapshot(first)).category!.code, "3");
  readFailures.match = "SELECT * FROM activities WHERE id";
  readFailures.remaining = 1;
  const failed = await mount(
    <ActivityEditor
      activity={snap.activity}
      onClose={() => {}}
      onSaved={() => {}}
    />,
  );
  hidden(failed, "D02");
  assert.ok(btn(failed, "X31"));
  assert.equal(btn(failed, "X30").props.disabled, true);
});

test("fresh/view/edit CheckIn have no manual classification; same activity retains snapshot and changed activity inherits existing service default", async () => {
  alertState.autoConfirm = false;
  const p = params();
  const navigation = nav();
  let beforeWrites = await writes();
  const fresh = await mount(
    <CheckInScreen route={{ params: p }} navigation={navigation} />,
  );
  hidden(fresh, "A06");
  assert.equal(await writes(), beforeWrites);
  await run(() => {
    activityTarget(fresh, "فعالیت آزمون دوم").props.onPress();
    activityTarget(fresh, "فعالیت آزمون دوم").props.onPress();
  });
  assert.equal(navigation.calls.length, 1);
  const original = await getCheckInContext(p.start);
  assert.equal(original.classification!.code, "2");
  const snap = await getActivityEditorSnapshot(second);
  await setActivityDefault(second, "4", snap.category!.revision);
  beforeWrites = await writes();
  const view = await mount(
    <CheckInScreen route={{ params: p }} navigation={nav()} />,
  );
  hidden(view, "A06");
  assert.match(json(view), /فعالیت آزمون دوم/);
  assert.equal(await writes(), beforeWrites);
  await run(() => btn(view, "X43").props.onPress());
  hidden(view, "A06");
  await run(() => activityTarget(view, "فعالیت آزمون دوم").props.onPress());
  const alert = (alertState.calls as any[]).at(-1)!;
  assert.match(alert.title, /D05/);
  assert.doesNotMatch(alert.body, /دسته|ICATUS/);
  await run(() =>
    alert.actions.find((b: any) => b.text.includes("X42")).onPress(),
  );
  assert.deepEqual(
    (await getCheckInContext(p.start)).classification,
    original.classification,
  );
  const changes = nav();
  const edit = await mount(
    <CheckInScreen route={{ params: p }} navigation={changes} />,
  );
  await run(() => btn(edit, "X43").props.onPress());
  await run(() => activityTarget(edit, "فعالیت آزمون نخست").props.onPress());
  const confirmation = (alertState.calls as any[]).at(-1)!;
  const beforeCancel = await writes();
  await run(() =>
    confirmation.actions.find((b: any) => b.text.includes("X38")).onPress?.(),
  );
  assert.equal(await writes(), beforeCancel);
  await run(() =>
    confirmation.actions.find((b: any) => b.text.includes("X42")).onPress(),
  );
  assert.equal((await getCheckInContext(p.start)).classification!.code, "3");
  assert.equal(changes.calls[0][1], "SaveResult");
  assert.ok(changes.calls[0][2].undo);
});

test("CheckIn stale hidden assignment and invalid scheme show Persian errors without false save or loss of guards", async () => {
  alertState.autoConfirm = false;
  const p = params("2026-01-03T10:00:00.000Z");
  await commitCheckIn({
    activityId: second,
    periodStart: p.start,
    periodEnd: p.end,
    source: "manual",
    expectedEntry: null,
  });
  const c = await getCheckInContext(p.start),
    navigation = nav();
  const r = await mount(
    <CheckInScreen route={{ params: p }} navigation={navigation} />,
  );
  await run(() => btn(r, "X43").props.onPress());
  await transaction((tx) =>
    assignEntryClassification(tx, c.entry!.id, c.classification!.revision, {
      code: "5",
      method: "user_reclassified",
      source_activity_id: null,
      default_revision: null,
    }),
  );
  await run(() => activityTarget(r, "فعالیت آزمون نخست").props.onPress());
  await run(() =>
    (alertState.calls as any[])
      .at(-1)
      .actions.find((b: any) => b.text.includes("X42"))
      .onPress(),
  );
  hidden(r, "A06");
  assert.match(json(r), /اطلاعات ثبت تغییر کرده/);
  assert.equal(navigation.calls.length, 0);
  assert.equal((await getCheckInContext(p.start)).entry!.activity_id, second);
  assert.equal((await getCheckInContext(p.start)).classification!.code, "5");
  const invalid = await mount(
    <CheckInScreen
      route={{ params: params("2026-01-04T10:00:00.000Z") }}
      navigation={navigation}
    />,
  );
  await transaction((tx) =>
    setMeta(tx, "active_classification_scheme_id", "invalid"),
  );
  try {
    await run(() =>
      activityTarget(invalid, "فعالیت آزمون نخست").props.onPress(),
    );
    hidden(invalid, "A06");
    assert.match(json(invalid), /اطلاعات داخلی برنامه/);
    assert.equal(navigation.calls.length, 0);
    assert.equal(
      (await getCheckInContext("2026-01-04T10:00:00.000Z")).entry,
      null,
    );
  } finally {
    await transaction((tx) =>
      setMeta(tx, "active_classification_scheme_id", SCHEME),
    );
  }
});

test("loading/error/empty/skipped CheckIn preserves A06/X102 and focus/resume only reads", async () => {
  const p = params("2026-01-05T10:00:00.000Z"),
    navigation = nav();
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  readIO.before = async (sql) => {
    if (sql.includes("SELECT * FROM time_entries WHERE period_start"))
      await gate;
  };
  const beforeWrites = await writes();
  const r = await mount(
    <CheckInScreen route={{ params: p }} navigation={navigation} />,
  );
  hidden(r, "A06");
  assert.ok(btn(r, "X51"));
  await run(() => release());
  readIO.before = null;
  await run(() => {
    emitFocus(false);
    emitFocus(true);
    emitAppState("active");
  });
  hidden(r, "A06");
  assert.equal(await writes(), beforeWrites);
  readFailures.match = "SELECT * FROM time_entries WHERE period_start";
  readFailures.remaining = 1;
  await run(() => {
    emitFocus(false);
    emitFocus(true);
  });
  hidden(r, "A06");
  assert.match(json(r), /Injected read failure/);
  const tx = await db();
  await tx.runAsync("UPDATE activities SET is_archived=1");
  await run(() => btn(r, "X51").props.onPress());
  hidden(r, "A06");
  assert.ok(btn(r, "X102"));
  const beforeNav = await writes();
  await run(() => btn(r, "X102").props.onPress());
  assert.equal(await writes(), beforeNav);
  assert.deepEqual(navigation.calls.at(-1), [
    "navigate",
    "Main",
    { screen: "Activities" },
  ]);
  const skipped = await mount(
    <CheckInScreen
      route={{
        params: {
          ...params("2026-01-06T10:00:00.000Z"),
          entryState: "skipped",
        },
      }}
      navigation={nav()}
    />,
  );
  hidden(skipped, "A06");
  await run(() => btn(skipped, "X45").props.onPress());
  hidden(skipped, "A06");
  await tx.runAsync("UPDATE activities SET is_archived=0");
});

test("reports show activity time but no buckets/coverage/unmapped categories, including empty/loading/error; onboarding makes no classification promise", async () => {
  await transaction((tx) =>
    setMeta(tx, "first_used_at", "2025-01-01T00:00:00.000Z"),
  );
  const beforeMount = await writes();
  const r = await mount(<InsightsScreen />);
  hidden(r, "A03");
  // Existing report preference persistence: two writes on mount, unchanged from baseline.
  assert.equal(await writes(), beforeMount + 2);
  const beforeWrites = await writes();
  await run(() => btn(r, "X99").props.onPress());
  await run(() => btn(r, "X84").props.onPress());
  await run(() => {
    input(r, "X97").props.onChangeText("2026-01-01");
    input(r, "X98").props.onChangeText("2026-01-07");
  });
  await run(() => btn(r, "X90").props.onPress());
  hidden(r, "A03");
  assert.match(json(r), /فعالیت آزمون/);
  const report = await getReport({
    mode: "custom",
    offset: 0,
    calendar: "persian",
    weekStart: 7,
    customStart: "2026-01-01",
    customEnd: "2026-01-07",
  });
  assert.ok(report.total > 0);
  assert.ok(report.buckets.length > 0); // computation/data intentionally retained
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  readIO.before = async (sql) => {
    if (sql.includes("SELECT e.*")) await gate;
  };
  await run(() => btn(r, "X77").props.onPress());
  hidden(r, "A03");
  await run(() => release());
  readIO.before = null;
  hidden(r, "A03");
  readFailures.match = "SELECT e.*";
  readFailures.remaining = 1;
  await run(() => btn(r, "X85").props.onPress());
  hidden(r, "A03");
  assert.match(json(r), /Injected read failure/);
  const onboarding = await mount(<OnboardingScreen onDone={() => {}} />);
  hidden(onboarding, "A11");
  assert.equal(await writes(), beforeWrites); // all report/preferences reads and draft inputs
});

test("UI error mapping keeps validation visible, hides internal details and preserves all reserved/active allocations", () => {
  for (const message of [
    "دسته نامعتبر است",
    "طرح طبقه‌بندی فعال نامعتبر است",
    "طرح طبقه‌بندی فعال ناشناخته است",
    "فرهنگ ICATUS ناقص است",
    "SQL: activity_classification_defaults ICATUS:2016 111",
  ]) {
    const mapped = errorMessage(Error(message));
    assert.doesNotMatch(mapped, /دسته|ICATUS|classificat|طبقه/i);
    assert.ok(mapped.length > 0);
  }
  assert.match(
    errorMessage(Error("دسته تغییر کرده؛ دوباره باز کن")),
    /اطلاعات ثبت تغییر کرده/,
  );
  assert.match(
    errorMessage(Error("پیش‌فرض تغییر کرده؛ دوباره باز کن")),
    /اطلاعات فعالیت تغییر کرده/,
  );
  assert.equal(
    errorMessage(Error("بازه باید معتبر و پایان‌یافته باشد")),
    "بازه باید معتبر و پایان‌یافته باشد",
  );
  assert.equal(uiClassificationVisibility, "hidden");
  for (const code of reservedClassificationUiCodes) {
    const e = Object.values(uiIdentifiers).find((e) => e.code === code)!;
    assert.equal(e.status, "reserved");
    assert.deepEqual(e.sites, []);
  }
  assert.equal(uiIdentifiers.closeSelectionDialog.code, "X18");
  assert.equal(uiIdentifiers.closeSelectionDialog.status, "active");
  assert.equal(uiIdentifiers.cancelConfirmation.code, "X38");
  assert.equal(uiIdentifiers.openActivitiesFromEmptyCheckIn.code, "X102");
  for (const code of ["D08", "X99", "X100", "X101"])
    assert.equal(
      Object.values(uiIdentifiers).find((e) => e.code === code)!.status,
      "active",
    );
});
