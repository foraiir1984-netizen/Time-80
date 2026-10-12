import React from "react";
import { test, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  act,
  create,
  type ReactTestRenderer,
  type ReactTestInstance,
} from "react-test-renderer";
import App, { MainTabs } from "../App";
import {
  Button,
  IdentifierBadge,
  IdentifierTitle,
  IdentifierHeader,
  Input,
  CodedSwitch,
} from "../src/components/Ui";
import { uiIdentifiers } from "../src/components/uiIdentifiers";
import { TodayScreen } from "../src/screens/TodayScreen";
import { ActivitiesScreen } from "../src/screens/ActivitiesScreen";
import { ActivityEditor } from "../src/components/ActivityEditor";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { SettingsScreen } from "../src/screens/SettingsScreen";
import { CheckInScreen } from "../src/screens/CheckInScreen";
import { BacklogScreen } from "../src/screens/BacklogScreen";
import { SaveResultScreen } from "../src/screens/SaveResultScreen";
import { NotificationResolutionScreen } from "../src/screens/NotificationResolutionScreen";
import { NotificationDiagnosticsScreen } from "../src/screens/NotificationDiagnosticsScreen";
import { SlotRow } from "../src/components/SlotRow";
import { initDatabase, getActivities, getSettings } from "../src/db/database";
import { db, transaction } from "../src/db/connection";
import { getMeta, setMeta } from "../src/db/metaRepository";
import {
  saveActivity,
  getActivityEditorSnapshot,
} from "../src/services/classificationService";
import {
  getCheckInContext,
  commitCheckIn,
} from "../src/services/checkInService";
import { dayScopeFor } from "../src/services/dayScopeService";
import { readFailures, readIO } from "./sqlite.mjs";
import {
  alertState,
  dimensions,
  emitAppState,
  appStateListenerCount,
  Linking,
} from "./react-native.mjs";
import { emitFocus, focusListenerCount } from "./navigation.mjs";
import { state, notificationReads } from "./notifications.mjs";
import { navigationState } from "./app-navigation.mjs";

// Real UI/database/services. Only native hosts, navigation and OS ports are
// doubled. This records rendered identifiers; it is never phone layout evidence.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const live = new Set<ReactTestRenderer>(),
  seen = new Map<string, Set<string>>(),
  renderedSites = new Map<string, Set<string>>();
const openSettings = Linking.openSettings;
let scenario = "";
const tick = () => new Promise<void>((r) => setImmediate(r));
function note(code: string) {
  const names = seen.get(code) ?? new Set<string>();
  names.add(scenario);
  seen.set(code, names);
}
function observe() {
  for (const r of live) {
    for (const badge of r.root.findAllByType(IdentifierBadge)) {
      note(badge.props.code);
      const owners: string[] = [];
      let origin = badge.parent;
      while (origin) {
        const t: any = origin.type;
        const name = t.displayName ?? t.name ?? t.render?.name;
        if (
          name &&
          ![
            "IdentifierBadge",
            "IdentifierTitle",
            "Button",
            "InteractivePressable",
            "View",
            "Text",
            "Input",
            "CodedSwitch",
            "ForwardRef",
          ].includes(name)
        )
          owners.push(name);
        origin = origin.parent;
      }
      const entry = Object.values(uiIdentifiers).find(
        (e) => e.code === badge.props.code,
      )!;
      assert.equal(entry.status, "active");
      let parent: ReactTestInstance | null = badge.parent;
      while (parent && parent.type !== ("Pressable" as any))
        parent = parent.parent;
      if (entry.kind === "action") {
        assert.ok(parent, `${entry.code} must share its control target`);
        assert.equal(parent.findAllByType("Pressable" as any).length, 1);
        assert.equal(typeof parent.props.onPress, "function");
      }
      const sites = renderedSites.get(entry.code) ?? new Set<string>();
      sites.add(
        `${owners[0] ?? "shared component"} / ${parent?.props.accessibilityLabel ?? entry.nameFa} / ${scenario}`,
      );
      renderedSites.set(entry.code, sites);
    }
  }
  for (const alert of alertState.calls as any[]) {
    for (const label of [alert.title, ...alert.actions.map((b: any) => b.text)])
      for (const code of label.match(/[ADX]\d{2,3}/g) ?? []) {
        note(code);
        const sites = renderedSites.get(code) ?? new Set<string>();
        sites.add(`native Alert / ${label} / ${scenario}`);
        renderedSites.set(code, sites);
      }
  }
}
async function run(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await tick();
  });
  observe();
}
async function mount(element: React.ReactElement, options?: any) {
  let r!: ReactTestRenderer;
  await run(() => {
    r = create(element, options);
    live.add(r);
  });
  return r;
}
async function close(r: ReactTestRenderer) {
  await act(async () => r.unmount());
  live.delete(r);
}
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
const codedButton = (r: ReactTestRenderer, code: string) =>
  r.root.findAllByType(Button).find((b) => b.props.actionCode === code)!;
const field = (r: ReactTestRenderer, code: string) =>
  r.root
    .findAllByType(Input)
    .find((b) => b.props.actionCode === code)!
    .findByType("TextInput" as any);
const target = (r: ReactTestRenderer, code: string, index = 0) => {
  const candidates = r.root
    .findAllByType("Pressable" as any)
    .filter((p) =>
      p.findAllByType(IdentifierBadge).some((b) => b.props.code === code),
    );
  const inModal = candidates.filter((node) => {
    let p = node.parent;
    while (p) {
      if (p.type === ("Modal" as any)) return true;
      p = p.parent;
    }
    return false;
  });
  return (inModal.length ? inModal : candidates)[index]!;
};
async function press(r: ReactTestRenderer, code: string, index = 0) {
  const p = target(r, code, index);
  assert.ok(p, code);
  assert.ok(!p.props.disabled, code);
  await run(() => p.props.onPress());
}
const alert = () => (alertState.calls as any[]).at(-1)!;
async function chooseAlert(code: string) {
  const button = alert().actions.find((b: any) => b.text.includes(code));
  assert.ok(button, code);
  await run(() => button.onPress?.());
}
const deferred = () => {
  let resolve!: () => void, reject!: (e: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
async function setup() {
  emitFocus(true);
  state.granted = true;
  alertState.autoConfirm = false;
  alertState.calls.length = 0;
  readFailures.remaining = 0;
  readFailures.match = null;
  readIO.before = null;
  notificationReads.permission =
    notificationReads.request =
    notificationReads.channels =
      null;
  await initDatabase();
}
function uiTest(name: string, fn: () => Promise<void>) {
  test(name, async () => {
    scenario = name;
    await setup();
    await fn();
  });
}
afterEach(async () => {
  for (const r of [...live]) await close(r);
  readIO.before = null;
  readFailures.remaining = 0;
  readFailures.match = null;
  notificationReads.permission =
    notificationReads.request =
    notificationReads.channels =
      null;
  alertState.autoConfirm = true;
  alertState.calls.length = 0;
  Linking.openSettings = openSettings;
  dimensions.fontScale = 1;
  dimensions.height = 800;
  emitFocus(true);
  assert.equal(appStateListenerCount(), 0);
  assert.equal(focusListenerCount(), 0);
});

uiTest(
  "Today keeps A01/A05 in the same route and separates overview return from current timeline date",
  async () => {
    const routes: any[] = [];
    const r = await mount(
      <TodayScreen
        navigation={{ navigate: (...args: any[]) => routes.push(args) }}
      />,
    );
    assert.ok(text(r).includes("A01"));
    await press(r, "X08");
    assert.ok(text(r).includes("A05"));
    assert.ok(!text(r).includes("A01"));
    await press(r, "X10");
    assert.equal(codedButton(r, "X12").props.disabled, false);
    await press(r, "X12");
    assert.equal(codedButton(r, "X12").props.disabled, true);
    await press(r, "X11");
    assert.ok(text(r).includes("A05"));
    await press(r, "X09");
    assert.ok(text(r).includes("A01"));
    assert.equal(routes.length, 0);
    await press(r, "X13");
    assert.deepEqual(routes.at(-1), ["Backlog"]);
    if (codedButton(r, "X07")) {
      await press(r, "X07");
      assert.equal(routes.at(-1)[0], "CheckIn");
      assert.equal(routes.at(-1)[1].source, "manual");
    } else {
      // Ensure a due pending row exists, then refresh the unchanged focus loader.
      const tx = await db();
      await tx.runAsync(
        "INSERT OR IGNORE INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,30,'pending',?,?)",
        "2026-10-12T00:00:00.000Z",
        "2026-10-12T00:30:00.000Z",
        "2026-10-12T00:00:00.000Z",
        "2026-10-12T00:00:00.000Z",
      );
      await run(() => emitFocus(false));
      await run(() => emitFocus(true));
      await press(r, "X07");
      assert.equal(routes.at(-1)[0], "CheckIn");
    }
    await press(r, "X08");
    assert.ok(codedButton(r, "X07"));
    await press(r, "X07");
    await press(r, "X09");
    readFailures.match = "expected_slots";
    readFailures.remaining = 1;
    await run(() => emitFocus(false));
    await run(() => emitFocus(true));
    assert.ok(text(r).includes("A01"));
    assert.ok(text(r).includes("Injected read failure"));
  },
);

uiTest(
  "both management targets share X17/D01; edit, archive, restore and archive Undo keep distinct codes",
  async () => {
    const id = await saveActivity(
      null,
      "شناسه مدیریت با نام بلند",
      "✨",
      null,
      null,
    );
    const r = await mount(<ActivitiesScreen />);
    const bodies = r.root
      .findAllByType("Pressable" as any)
      .filter((p) =>
        p.props.accessibilityLabel?.includes("شناسه مدیریت با نام بلند"),
      );
    assert.equal(bodies.length, 2);
    for (const p of bodies) {
      assert.equal(p.findByType(IdentifierBadge).props.code, "X17");
      await run(() => p.props.onPress());
      assert.ok(text(r).includes("D01"));
      await press(r, "X18");
    }
    await run(() => bodies[1]!.props.onPress());
    await press(r, "X19");
    assert.ok(text(r).includes("D02"));
    assert.ok(codedButton(r, "X30"));
    await press(r, "X28");
    await run(() => bodies[0]!.props.onPress());
    await press(r, "X20");
    assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 1);
    await press(r, "X22");
    assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 0);
    const body = r.root
      .findAllByType("Pressable" as any)
      .find(
        (p) =>
          p.props.accessibilityLabel ===
          `مدیریت فعالیت شناسه مدیریت با نام بلند`,
      )!;
    await run(() => body.props.onPress());
    await press(r, "X20");
    await press(r, "X15");
    const archived = r.root
      .findAllByType("Pressable" as any)
      .find(
        (p) =>
          p.props.accessibilityLabel ===
          `مدیریت فعالیت شناسه مدیریت با نام بلند، بایگانی‌شده`,
      )!;
    await run(() => archived.props.onPress());
    await press(r, "X21");
    await press(r, "X16");
    assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 0);
    await press(r, "X14");
    assert.ok(codedButton(r, "X29"));
    await press(r, "X28");
    readFailures.match = "SELECT * FROM activities";
    readFailures.remaining = 1;
    await run(() => emitFocus(false));
    await run(() => emitFocus(true));
    assert.ok(text(r).includes("A02"));
    assert.ok(codedButton(r, "X23"));
    await press(r, "X23");
    assert.ok(text(r).includes("A02"));
  },
);

uiTest(
  "activity empty filters retain both repeated add/filter locations without inventing navigation",
  async () => {
    const tx = await db(),
      before = await tx.getAllAsync<any>(
        "SELECT id,is_archived FROM activities",
      );
    await tx.runAsync("UPDATE activities SET is_archived=1");
    const r = await mount(<ActivitiesScreen />);
    assert.ok(text(r).includes("A02"));
    assert.equal(
      r.root.findAllByType(Button).filter((b) => b.props.actionCode === "X14")
        .length,
      2,
    );
    assert.equal(
      r.root.findAllByType(Button).filter((b) => b.props.actionCode === "X15")
        .length,
      2,
    );
    await close(r);
    await tx.runAsync("UPDATE activities SET is_archived=0");
    const emptyArchive = await mount(<ActivitiesScreen />);
    await press(emptyArchive, "X15");
    assert.equal(
      emptyArchive.root
        .findAllByType(Button)
        .filter((b) => b.props.actionCode === "X16").length,
      2,
    );
    await close(emptyArchive);
    for (const a of before)
      await tx.runAsync(
        "UPDATE activities SET is_archived=? WHERE id=?",
        a.is_archived,
        a.id,
      );
  },
);

uiTest(
  "D02 keeps create/edit codes through validation, busy and snapshot failure; icon choices only change draft",
  async () => {
    let saved = 0,
      cancelled = 0,
      focused = 0;
    const r = await mount(
      <ActivityEditor
        activity={null}
        onSaved={() => saved++}
        onClose={() => cancelled++}
      />,
      {
        createNodeMock: (node: any) =>
          node.type === "TextInput" ? { focus: () => focused++ } : null,
      },
    );
    assert.equal(codedButton(r, "X29").props.disabled, true);
    await press(r, "X93");
    assert.equal(focused, 1);
    await run(() => field(r, "X93").props.onChangeText("نام تازه شناسه"));
    const before = (await getActivities()).length;
    await press(r, "X24");
    await press(r, "X25");
    await press(r, "X26");
    await run(() => field(r, "X94").props.onChangeText("raw icon retained"));
    await press(r, "X27");
    assert.equal((await getActivities()).length, before);
    const hold = deferred();
    const locked = transaction(async () => hold.promise);
    await tick();
    await run(() => {
      codedButton(r, "X29").props.onPress();
      codedButton(r, "X29").props.onPress();
    });
    assert.equal(codedButton(r, "X29").props.disabled, true);
    assert.equal(codedButton(r, "X29").props.title, "در حال ذخیره…");
    await run(() => hold.resolve());
    await locked;
    assert.equal(saved, 1);
    const a = (await getActivities()).find((a) => a.name === "نام تازه شناسه")!;
    assert.equal(a.icon, "raw icon retained");
    assert.equal((await getActivities()).length, before + 1);
    await press(r, "X28");
    assert.equal(cancelled, 1);
    await close(r);
    readFailures.match = "SELECT * FROM activities WHERE id";
    readFailures.remaining = 1;
    const edit = await mount(
      <ActivityEditor
        activity={a}
        onSaved={() => saved++}
        onClose={() => {}}
      />,
    );
    assert.ok(text(edit).includes("D02"));
    assert.equal(codedButton(edit, "X30").props.disabled, true);
    await press(edit, "X31");
    assert.equal(codedButton(edit, "X30").props.disabled, false);
    await press(edit, "X24");
    await run(() => field(edit, "X94").props.onChangeText(""));
    const legacy = edit.root
      .findAllByType("Pressable" as any)
      .find((p) => p.props.accessibilityLabel?.startsWith("آیکون 📚"))!;
    assert.equal(legacy.findByType(IdentifierBadge).props.code, "X27");
    await run(() => legacy.props.onPress());
  },
);

uiTest(
  "report mode codes retain day/usage/rolling distinctions, relative offset and explicit custom apply",
  async () => {
    readFailures.match = "SELECT value FROM app_meta WHERE key=?";
    readFailures.remaining = 1;
    const r = await mount(<InsightsScreen />);
    assert.ok(text(r).includes("A03"));
    assert.ok(codedButton(r, "X92"));
    await press(r, "X92");
    await press(r, "X100");
    await press(r, "X99");
    for (const code of ["X77", "X78", "X79", "X80", "X81", "X82", "X83", "X84"])
      assert.ok(codedButton(r, code));
    await press(r, "X80");
    assert.equal(codedButton(r, "X80").props.selected, true);
    await press(r, "X85");
    assert.equal(codedButton(r, "X80").props.selected, true);
    await press(r, "X87");
    await press(r, "X86");
    assert.equal(codedButton(r, "X87").props.disabled, true);
    await press(r, "X82");
    assert.equal(codedButton(r, "X82").props.selected, true);
    assert.equal(codedButton(r, "X80").props.selected, false);
    await press(r, "X83");
    await press(r, "X78");
    await press(r, "X79");
    await press(r, "X81");
    await press(r, "X77");
    await press(r, "X88");
    assert.equal(await getMeta(await db(), "report_calendar"), "gregory");
    await press(r, "X89");
    assert.equal(await getMeta(await db(), "report_week_start"), "1");
    await press(r, "X84");
    let reads = 0;
    readIO.before = async (sql: string) => {
      if (sql.includes("time_entries")) reads++;
    };
    await run(() => {
      field(r, "X97").props.onChangeText("2026-10-01");
      field(r, "X98").props.onChangeText("2026-10-02");
    });
    assert.equal(reads, 0);
    await press(r, "X90");
    assert.ok(reads > 0);
    readIO.before = null;
    await press(r, "X18");
    readFailures.match = "time_entries";
    readFailures.remaining = 1;
    await run(() => emitAppState("active"));
    assert.ok(codedButton(r, "X91"));
    await press(r, "X91");
    assert.ok(text(r).includes("A03"));
  },
);

uiTest(
  "settings code targets keep onBlur autosave, switch single callback and D04 only discards incomplete draft",
  async () => {
    const listeners = new Set<(e: any) => void>(),
      dispatches: any[] = [];
    const navigation = {
      addListener: (_name: string, fn: (e: any) => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      dispatch: (a: any) => dispatches.push(a),
      navigate: (...a: any[]) => dispatches.push(a),
    };
    const r = await mount(<SettingsScreen navigation={navigation} />);
    const initial = await getSettings();
    await run(() => field(r, "X60").props.onChangeText("45"));
    assert.equal(
      (await getSettings()).interval_minutes,
      initial.interval_minutes,
    );
    await press(r, "X60");
    assert.equal(
      (await getSettings()).interval_minutes,
      initial.interval_minutes,
    );
    await run(() => field(r, "X60").props.onBlur({}));
    assert.equal((await getSettings()).interval_minutes, 45);
    for (const [code, value, key] of [
      ["X61", "09:00", "day_start"],
      ["X62", "22:00", "day_end"],
    ] as const) {
      await run(() => field(r, code).props.onChangeText(value));
      assert.notEqual((await getSettings())[key], value);
      await run(() => field(r, code).props.onBlur({}));
      assert.equal((await getSettings())[key], value);
    }
    for (const [code, key] of [
      ["X59", "notification_enabled"],
      ["X64", "sound_enabled"],
      ["X65", "vibration_enabled"],
    ] as const) {
      const before = (await getSettings())[key];
      const native = target(r, code).findByType("Switch" as any);
      assert.equal(native.props.pointerEvents, "none");
      assert.equal(native.props.onValueChange, undefined);
      await press(r, code);
      assert.equal((await getSettings())[key], before ? 0 : 1);
    }
    await press(r, "X63");
    await press(r, "X66");
    assert.deepEqual(dispatches.at(-1), ["Diagnostics"]);
    await run(() => field(r, "X60").props.onChangeText("incomplete"));
    const action = { type: "GO_BACK", source: "settings-fixture" };
    let prevented = 0;
    await run(() =>
      listeners.forEach((fn) =>
        fn({ preventDefault: () => prevented++, data: { action } }),
      ),
    );
    assert.equal(prevented, 1);
    assert.ok(alert().title.includes("D04"));
    assert.equal(
      alert().actions.find((a: any) => a.text.includes("X67")).onPress,
      undefined,
    );
    await chooseAlert("X67");
    assert.equal(dispatches.length, 1);
    await chooseAlert("X68");
    assert.equal(dispatches.at(-1), action);
    assert.equal((await getSettings()).interval_minutes, 45);
  },
);

async function slot(start: string, end: string) {
  const tx = await db();
  const result = await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,state,created_at,updated_at) VALUES(?,?,30,'pending',?,?)",
    start,
    end,
    start,
    start,
  );
  return Number(result.lastInsertRowId);
}
uiTest(
  "A06 uses X39 for commit and X40/D05 for requests; cancellations never write, timezone and Undo remain distinct",
  async () => {
    const tx = await db();
    const first = await saveActivity(null, "ثبت شناسه اول", "one", null, null),
      second = await saveActivity(null, "ثبت شناسه دوم", "two", null, null);
    const start = "2026-10-10T10:00:00.000Z",
      end = "2026-10-10T10:30:00.000Z",
      slotId = await slot(start, end);
    const calls: any[] = [],
      navigation = {
        replace: (...a: any[]) => calls.push(a),
        navigate: (...a: any[]) => calls.push(a),
        goBack: () => calls.push(["BACK"]),
      };
    const params = { start, end, slotId, source: "manual" };
    let r = await mount(
      <CheckInScreen route={{ params }} navigation={navigation} />,
    );
    const activity = r.root
      .findAllByType("Pressable" as any)
      .find((p) => p.props.accessibilityLabel === "ثبت شناسه اول")!;
    assert.equal(activity.findByType(IdentifierBadge).props.code, "X39");
    await run(() => {
      activity.props.onPress();
      activity.props.onPress();
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], "SaveResult");
    assert.equal((await getCheckInContext(start)).entry!.activity_id, first);
    await close(r);
    r = await mount(
      <CheckInScreen route={{ params }} navigation={navigation} />,
    );
    assert.ok(text(r).includes("A06"));
    await run(() => field(r, "X96").props.onChangeText("Asia/Tehran"));
    const before = await tx.getAllAsync("SELECT * FROM entry_time_context");
    await press(r, "X49");
    assert.ok(alert().title.includes("D06"));
    await chooseAlert("X38");
    assert.deepEqual(
      await tx.getAllAsync("SELECT * FROM entry_time_context"),
      before,
    );
    await press(r, "X49");
    await chooseAlert("X50");
    assert.equal(
      (await getCheckInContext(start)).context!.timezone_id,
      "Asia/Tehran",
    );
    await press(r, "X05");
    assert.deepEqual(calls.at(-1), ["BACK"]);
    await press(r, "X43");
    const change = r.root
      .findAllByType("Pressable" as any)
      .find((p) => p.props.accessibilityLabel === "ثبت شناسه دوم")!;
    assert.equal(change.findByType(IdentifierBadge).props.code, "X40");
    await run(() => change.props.onPress());
    assert.ok(alert().title.includes("D05"));
    assert.equal((await getCheckInContext(start)).entry!.activity_id, first);
    await chooseAlert("X38");
    assert.equal((await getCheckInContext(start)).entry!.activity_id, first);
    await run(() => change.props.onPress());
    await chooseAlert("X42");
    assert.equal((await getCheckInContext(start)).entry!.activity_id, second);
    const saved = calls.at(-1)[1];
    assert.ok(saved.undo);
    await close(r);
    r = await mount(
      <SaveResultScreen route={{ params: saved }} navigation={navigation} />,
    );
    assert.ok(text(r).includes("A07"));
    await press(r, "X54");
    assert.equal((await getCheckInContext(start)).entry!.activity_id, first);
    assert.equal(calls.at(-1)[0], "CheckIn");
    assert.equal(calls.at(-1)[1].dayScope, saved.scope);
    await close(r);
  },
);

uiTest(
  "skip request/cancel/confirm/reopen retain A06 without enabling unreachable Undo",
  async () => {
    const start = "2026-10-10T11:00:00.000Z",
      end = "2026-10-10T11:30:00.000Z",
      slotId = await slot(start, end);
    const params = { start, end, slotId, source: "manual" };
    let backs = 0;
    const navigation = {
      goBack: () => backs++,
      navigate: () => {},
      replace: () => {},
    };
    let r = await mount(
      <CheckInScreen route={{ params }} navigation={navigation} />,
    );
    await press(r, "X46");
    assert.ok(alert().title.includes("D07"));
    await chooseAlert("X38");
    assert.equal(
      (
        await (
          await db()
        ).getFirstAsync<any>(
          "SELECT state FROM expected_slots WHERE id=?",
          slotId,
        )
      ).state,
      "pending",
    );
    await press(r, "X46");
    await chooseAlert("X47");
    assert.equal(backs, 1);
    await close(r);
    r = await mount(
      <CheckInScreen
        route={{ params: { ...params, entryState: "skipped" } }}
        navigation={navigation}
      />,
    );
    assert.ok(text(r).includes("A06"));
    assert.ok(codedButton(r, "X45"));
    await press(r, "X05");
    assert.equal(backs, 2);
    await press(r, "X45");
    assert.equal(
      (
        await (
          await db()
        ).getFirstAsync<any>(
          "SELECT state FROM expected_slots WHERE id=?",
          slotId,
        )
      ).state,
      "skipped",
    );
    assert.equal(
      r.root.findAllByType(Button).filter((b) => b.props.actionCode === "X54")
        .length,
      0,
    );
    assert.ok(text(r).includes("A06"));
  },
);

uiTest(
  "failed selected commit retries with X44; A06 context read retry X51 keeps its page code",
  async () => {
    const start = "2026-10-10T12:00:00.000Z",
      end = "2026-10-10T12:30:00.000Z",
      slotId = await slot(start, end);
    const calls: any[] = [],
      params = { start, end, slotId, source: "manual" },
      navigation = {
        replace: (...a: any[]) => calls.push(a),
        navigate: () => {},
        goBack: () => {},
      };
    const r = await mount(
      <CheckInScreen route={{ params }} navigation={navigation} />,
    );
    readFailures.match = "SELECT * FROM time_entries";
    readFailures.remaining = 1;
    await press(r, "X39");
    assert.ok(codedButton(r, "X44"));
    assert.equal(calls.length, 0);
    await press(r, "X44");
    assert.equal(calls.length, 1);
    await close(r);
    readFailures.match = "SELECT * FROM time_entries";
    readFailures.remaining = 1;
    const retry = await mount(
      <CheckInScreen route={{ params }} navigation={navigation} />,
    );
    assert.ok(text(retry).includes("A06"));
    assert.ok(codedButton(retry, "X51"));
    await press(retry, "X51");
  },
);

uiTest(
  "result navigation distinguishes scoped replace, view and Main/Today; count retry only reads and expired Undo is absent",
  async () => {
    const start = "2026-10-10T10:00:00.000Z",
      scope = dayScopeFor(start, "UTC"),
      period = { start, end: "2026-10-10T10:30:00.000Z" };
    await slot("2026-10-10T13:00:00.000Z", "2026-10-10T13:30:00.000Z");
    const params = { scope, period, cutoffUtc: "2026-10-11T00:00:00.000Z" },
      calls: any[] = [],
      navigation = {
        replace: (...a: any[]) => calls.push(["replace", ...a]),
        navigate: (...a: any[]) => calls.push(["navigate", ...a]),
      };
    readFailures.match = "SELECT COUNT(*) count";
    readFailures.remaining = 1;
    const r = await mount(
      <SaveResultScreen route={{ params }} navigation={navigation} />,
    );
    assert.ok(text(r).includes("A07"));
    await press(r, "X52");
    if (codedButton(r, "X53")) {
      await press(r, "X53");
      assert.deepEqual(calls.at(-1), [
        "replace",
        "Backlog",
        { dayScope: scope },
      ]);
    }
    await press(r, "X55");
    assert.deepEqual(calls.at(-1), [
      "replace",
      "CheckIn",
      { ...period, dayScope: scope },
    ]);
    await press(r, "X56");
    assert.deepEqual(calls.at(-1), ["navigate", "Main", { screen: "Today" }]);
    const expired = await mount(
      <SaveResultScreen
        route={{
          params: { ...params, undo: { deadline: performance.now() - 1 } },
        }}
        navigation={navigation}
      />,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    await run();
    assert.equal(
      expired.root
        .findAllByType(Button)
        .filter((b) => b.props.actionCode === "X54").length,
      0,
    );
  },
);

uiTest(
  "backlog general/scoped rows preserve X06 payload and automatic pagination; resolution X57 has no scope",
  async () => {
    const calls: any[] = [],
      navigation = {
        navigate: (...a: any[]) => calls.push(["navigate", ...a]),
        replace: (...a: any[]) => calls.push(["replace", ...a]),
      };
    let r = await mount(
      <BacklogScreen route={{ params: {} }} navigation={navigation} />,
    );
    assert.ok(text(r).includes("A08"));
    await press(r, "X06");
    assert.equal(calls.at(-1)[1], "CheckIn");
    assert.equal(calls.at(-1)[2].dayScope, undefined);
    readFailures.match = "expected_slots";
    readFailures.remaining = 1;
    await run(() => emitFocus(false));
    await run(() => emitFocus(true));
    assert.ok(codedButton(r, "X58"));
    await press(r, "X58");
    await close(r);
    const scope = dayScopeFor("2026-10-10T00:00:00.000Z", "UTC");
    r = await mount(
      <BacklogScreen
        route={{ params: { dayScope: scope } }}
        navigation={navigation}
      />,
    );
    await press(r, "X06");
    assert.equal(calls.at(-1)[2].dayScope, scope);
    await close(r);
    r = await mount(
      <NotificationResolutionScreen
        route={{ params: { reason: "missing-slot" } }}
        navigation={navigation}
      />,
    );
    assert.ok(text(r).includes("A10"));
    await press(r, "X57");
    assert.deepEqual(calls.at(-1), ["replace", "Backlog"]);
    await press(r, "X56");
    assert.deepEqual(calls.at(-1), ["navigate", "Main", { screen: "Today" }]);
  },
);

uiTest(
  "A06 empty activity navigation uses product-assigned X102 and performs no create/restore",
  async () => {
    const tx = await db(),
      archived = await tx.getAllAsync<any>(
        "SELECT id,is_archived FROM activities",
      );
    await tx.runAsync("UPDATE activities SET is_archived=1");
    const calls: any[] = [],
      navigation = {
        navigate: (...a: any[]) => calls.push(a),
        replace: () => {},
        goBack: () => {},
      };
    const r = await mount(
      <CheckInScreen
        route={{
          params: {
            start: "2026-10-09T10:00:00.000Z",
            end: "2026-10-09T10:30:00.000Z",
            source: "manual",
          },
        }}
        navigation={navigation}
      />,
    );
    const before = await tx.getAllAsync("SELECT * FROM activities");
    await press(r, "X102");
    assert.deepEqual(calls, [["Main", { screen: "Activities" }]]);
    assert.deepEqual(await tx.getAllAsync("SELECT * FROM activities"), before);
    await close(r);
    for (const a of archived)
      await tx.runAsync(
        "UPDATE activities SET is_archived=? WHERE id=?",
        a.is_archived,
        a.id,
      );
  },
);

uiTest(
  "diagnostics codes survive permission/settings/test/reconcile actions without changing FIX02 refresh ownership",
  async () => {
    const r = await mount(<NotificationDiagnosticsScreen />);
    assert.ok(text(r).includes("A09"));
    await press(r, "X69");
    let settingsCalls = 0;
    Linking.openSettings = async () => {
      settingsCalls++;
    };
    await press(r, "X70");
    assert.equal(settingsCalls, 1);
    await press(r, "X71");
    await press(r, "X72");
    await run(() => emitFocus(false));
    await run(() => emitFocus(true));
    assert.ok(text(r).includes("A09"));
  },
);

uiTest(
  "A12 loading/error/retry and onboarding retain codes; tabs/header keep native navigation callbacks",
  async () => {
    await setMeta(await db(), "onboarding_completed", "false");
    const hold = deferred();
    let held = false;
    readIO.before = async (_sql: string, args: any[]) => {
      if (args[0] === "schedule_timezone" && !held) {
        held = true;
        await hold.promise;
      }
    };
    const r = await mount(<App />);
    assert.ok(text(r).includes("A12"));
    await run(() => hold.reject(Error("UI bootstrap fixture failure")));
    assert.ok(codedButton(r, "X76"));
    assert.ok(text(r).includes("A12"));
    readIO.before = null;
    await press(r, "X76");
    assert.ok(text(r).includes("A11"));
    await press(r, "X73");
    await press(r, "X71");
    await press(r, "X74");
    const stack = r.root.findAll(
      (n) => typeof n.props.screenOptions?.header === "function",
    )[0]!;
    let backs = 0;
    for (const [name, code] of [
      ["CheckIn", "A06"],
      ["Backlog", "A08"],
      ["SaveResult", "A07"],
      ["NotificationResolution", "A10"],
      ["Diagnostics", "A09"],
    ]) {
      const header = await mount(
        stack.props.screenOptions.header({
          route: { name },
          options: { title: name },
          back: { title: "امروز" },
          navigation: { goBack: () => backs++ },
        }),
      );
      assert.equal(header.root.findByType(IdentifierTitle).props.code, code);
      await press(header, "X05");
      await close(header);
    }
    assert.equal(backs, 5);
    const tabs = await mount(<MainTabs />);
    const screens = tabs.root.findAll((n) =>
      ["Today", "Activities", "Insights", "Settings"].includes(n.props.name),
    );
    const navigator = tabs.root.findAll(
      (n) => n.props.backBehavior === "firstRoute",
    )[0]!;
    assert.equal(navigator.props.backBehavior, "firstRoute");
    for (const [i, screen] of screens.entries()) {
      let presses = 0;
      const code = `X0${i + 1}`;
      const label = screen.props.options.tabBarLabel({
        color: i % 2 ? "#746E64" : "#A7462E",
        focused: !i,
      });
      const tab = await mount(
        navigator.props.screenOptions.tabBarButton({
          onPress: () => presses++,
          children: label,
          accessibilityState: { selected: !i },
        }),
      );
      await press(tab, code);
      assert.equal(presses, 1);
      assert.equal(target(tab, code).props.pressOpacity, 1);
    }
    const noBack = await mount(
      <IdentifierHeader
        title="ثبت بازه"
        pageCode="A06"
        canGoBack={false}
        onBack={() => backs++}
      />,
    );
    assert.equal(noBack.root.findAllByType(Button).length, 0);
  },
);

for (const scale of [1, 1.5, 2])
  uiTest(
    `future timeline code and tab label measurement preserve disabled/navigation state at scale ${scale}`,
    async () => {
      dimensions.fontScale = scale;
      let clicks = 0;
      const future = new Date(Date.now() + 3600000).toISOString(),
        end = new Date(Date.now() + 5400000).toISOString();
      const callback = () => clicks++;
      const row = await mount(
        <SlotRow
          item={
            {
              period_start: future,
              period_end: end,
              slot: null,
              entry: null,
            } as any
          }
          onPress={callback}
        />,
      );
      assert.equal(target(row, "X06").props.disabled, true);
      assert.equal(target(row, "X06").props.onPress, callback);
      assert.equal(clicks, 0);
      const tabs = await mount(<MainTabs />),
        nav = () =>
          tabs.root.findAll((n) => n.props.backBehavior === "firstRoute")[0]!;
      const originalHeight = nav().props.screenOptions.tabBarStyle.height;
      const screen = tabs.root.findAll((n) => n.props.name === "Settings")[0]!;
      let pressed = 0;
      const label = screen.props.options.tabBarLabel({ color: "#746E64" });
      const control = await mount(
        nav().props.screenOptions.tabBarButton({
          onPress: () => pressed++,
          children: label,
          accessibilityState: { selected: false },
        }),
      );
      await press(control, "X04");
      assert.equal(pressed, 1);
      await run(() =>
        label.props.onLayout({
          nativeEvent: { layout: { height: originalHeight + 100 } },
        }),
      );
      assert.ok(nav().props.screenOptions.tabBarStyle.height > originalHeight);
      const height = nav().props.screenOptions.tabBarStyle.height;
      await run(() =>
        label.props.onLayout({
          nativeEvent: { layout: { height: originalHeight + 100 } },
        }),
      );
      assert.equal(nav().props.screenOptions.tabBarStyle.height, height); // Stable measurement, no refresh loop.
      dimensions.height = 400;
      const management = await mount(<ActivitiesScreen />);
      await press(management, "X17");
      const flatten = (s: any): any =>
        Object.assign({}, ...(Array.isArray(s) ? s.map(flatten) : [s || {}]));
      const backdrop = management.root
        .findAllByType("Pressable" as any)
        .find((p) => p.props.accessibilityLabel === "بستن گزینه‌های فعالیت")!;
      const modal = management.root
        .findAllByType("View" as any)
        .find((v) => v.props.accessibilityViewIsModal)!;
      const closing = flatten(backdrop.props.style({ pressed: false })),
        sheet = flatten(modal.props.style);
      assert.ok(closing.minHeight >= 48);
      assert.ok(sheet.maxHeight + closing.minHeight <= dimensions.height);
      // Layout constraints only; native overlap/hit measurements remain Not run.
      await press(management, "X18");
    },
  );

after(() => {
  const active = Object.values(uiIdentifiers)
    .filter((e) => e.status === "active")
    .map((e) => e.code);
  const missing = active.filter((code) => !seen.has(code));
  if (process.env.TIME80_UI_EVIDENCE_DIR) {
    mkdirSync(process.env.TIME80_UI_EVIDENCE_DIR, { recursive: true });
    writeFileSync(
      join(process.env.TIME80_UI_EVIDENCE_DIR, "rendered-code-evidence.json"),
      JSON.stringify(
        {
          kind: "renderer behavior, not phone/layout evidence",
          codes: Object.fromEntries(
            [...seen].sort().map(([k, v]) => [k, [...v]]),
          ),
          renderedSites: Object.fromEntries(
            [...renderedSites].sort().map(([k, v]) => [k, [...v]]),
          ),
          missing,
        },
        null,
        2,
      ) + "\n",
    );
  }
  assert.deepEqual(
    missing,
    [],
    "Every active allocation must be observed in real UI/Alert behavior scenarios",
  );
});
