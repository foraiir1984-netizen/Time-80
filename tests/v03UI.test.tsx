import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivitiesScreen } from "../src/screens/ActivitiesScreen";
import { ActivityEditor } from "../src/components/ActivityEditor";
import { CheckInScreen } from "../src/screens/CheckInScreen";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { SaveResultScreen } from "../src/screens/SaveResultScreen";
import { Button } from "../src/components/Ui";
import { FlatList, dimensions } from "./react-native.mjs";
import { initDatabase, getActivities } from "../src/db/database";
import {
  saveActivity,
  getActivityEditorSnapshot,
} from "../src/services/classificationService";
import { db } from "../src/db/connection";
import { dayScopeFor } from "../src/services/dayScopeService";
import { readFailures } from "./sqlite.mjs";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const tick = () => new Promise<void>((r) => setImmediate(r));
async function mount(element: React.ReactElement) {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(element);
    await tick();
  });
  return r;
}
const button = (r: ReactTestRenderer, title: string) =>
  r.root.findAllByType(Button).find((b) => b.props.title === title)!;
async function click(fn: () => unknown) {
  await act(async () => {
    fn();
    await tick();
  });
}
async function unmount(r: ReactTestRenderer) {
  await act(async () => r.unmount());
}
test("management body/menu open the same activity sheet, archive/Undo preserve history, large text switches to one column", async () => {
  await initDatabase();
  const id = await saveActivity(
      null,
      "UI long activity name with history",
      "👨‍👩‍👦",
      null,
      null,
    ),
    tx = await db();
  for (let i = 0; i < 32; i++)
    await saveActivity(
      null,
      `فعالیت نام بلند ${i} برای آزمون گرید مدیریت`,
      "✨",
      null,
      null,
    );
  const history = await tx.getAllAsync("SELECT * FROM time_entries");
  const r = await mount(<ActivitiesScreen />);
  assert.ok(r.root.findByType(FlatList).props.data.length >= 30);
  const body = r.root
    .findAllByType("Pressable" as any)
    .find(
      (p) =>
        p.props.accessibilityLabel ===
        "مدیریت فعالیت UI long activity name with history",
    )!;
  await click(body.props.onPress);
  assert.ok(button(r, "ویرایش فعالیت"));
  await click(button(r, "بستن").props.onPress);
  const menu = r.root
    .findAllByType("Pressable" as any)
    .find(
      (p) =>
        p.props.accessibilityLabel ===
        "گزینه‌های مدیریت فعالیت UI long activity name with history",
    )!;
  await click(menu.props.onPress);
  await click(button(r, "بایگانی فعالیت").props.onPress);
  assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 1);
  await click(button(r, "واگرد").props.onPress);
  assert.equal((await getActivityEditorSnapshot(id)).activity.is_archived, 0);
  assert.deepEqual(await tx.getAllAsync("SELECT * FROM time_entries"), history);
  dimensions.fontScale = 2;
  await act(async () => r.update(<ActivitiesScreen />));
  assert.equal(r.root.findByType(FlatList).props.numColumns, 1);
  dimensions.fontScale = 1;
  await unmount(r);
});
test("editor read failure blocks saving and keeps draft; retry loads metadata before rename", async () => {
  const id = await saveActivity(null, "editor", "work", null, null),
    a = (await getActivities()).find((a) => a.id === id)!;
  let saved = 0;
  readFailures.match = "SELECT * FROM activities WHERE id";
  readFailures.remaining = 1;
  const r = await mount(
    <ActivityEditor activity={a} onClose={() => {}} onSaved={() => saved++} />,
  );
  assert.equal(button(r, "ذخیره").props.disabled, true);
  const input = r.root
    .findAllByType("TextInput" as any)
    .find((p) => p.props.accessibilityLabel === "نام فعالیت")!;
  await click(() => input.props.onChangeText("renamed draft"));
  readFailures.remaining = 0;
  await click(button(r, "تلاش دوباره برای بارگذاری").props.onPress);
  await click(button(r, "ذخیره").props.onPress);
  assert.equal(saved, 1);
  assert.equal((await getActivityEditorSnapshot(id)).activity.icon, "work");
  assert.equal(
    (await getActivityEditorSnapshot(id)).activity.name,
    "renamed draft",
  );
  await unmount(r);
});
test("single-touch check-in writes once and navigates only after commit to a fixed-day result; recent section is removed", async () => {
  const id = await saveActivity(null, "UI checkin", "x", null, null),
    tx = await db(),
    start = "2026-06-04T10:00:00.000Z",
    end = "2026-06-04T10:30:00.000Z";
  await tx.runAsync(
    "INSERT INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,30,?,?)",
    start,
    end,
    start,
    start,
  );
  const calls: any[] = [],
    navigation = {
      replace: (name: string, params: any) => calls.push({ name, params }),
      navigate: () => {},
      goBack: () => {},
    };
  const r = await mount(
    <CheckInScreen
      route={{ params: { start, end, slotId: 1, source: "notification" } }}
      navigation={navigation}
    />,
  );
  assert.ok(!JSON.stringify(r.toJSON()).includes("پیشنهادهای ۷ روز اخیر"));
  const activity = r.root
    .findAllByType("Pressable" as any)
    .find((p) => p.props.accessibilityLabel === "UI checkin")!;
  await click(() => {
    activity.props.onPress();
    activity.props.onPress();
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "SaveResult");
  assert.equal(calls[0].params.scope.localDate, "2026-06-04");
  assert.equal(
    (await tx.getAllAsync("SELECT * FROM time_entries WHERE activity_id=?", id))
      .length,
    1,
  );
  await unmount(r);
});
test("post-commit count read failure shows saved outcome and retry only reads without replaying the write", async () => {
  const tx = await db(),
    before = await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    scope = dayScopeFor("2026-06-04T10:00:00.000Z", "UTC");
  readFailures.match = "SELECT COUNT(*) count";
  readFailures.remaining = 1;
  const r = await mount(
    <SaveResultScreen
      route={{
        params: { scope, cutoffUtc: "2026-06-04T12:00:00.000Z", period: {} },
      }}
      navigation={{ navigate: () => {}, replace: () => {} }}
    />,
  );
  assert.ok(
    JSON.stringify(r.toJSON()).includes(
      "شمارش باقی‌مانده‌ها فعلاً در دسترس نیست",
    ),
  );
  await click(button(r, "تلاش دوباره برای شمارش").props.onPress);
  assert.deepEqual(
    await tx.getAllAsync("SELECT * FROM time_entries ORDER BY id"),
    before,
  );
  await unmount(r);
  readFailures.match = null;
});

test("reports retain a read error until preference retry, then expose a dated previous-day empty state", async () => {
  readFailures.match = "SELECT value FROM app_meta WHERE key=?";
  readFailures.remaining = 1;
  const r = await mount(<InsightsScreen />);
  assert.ok(button(r, "تلاش دوباره"));
  readFailures.remaining = 0;
  await click(button(r, "تلاش دوباره").props.onPress);
  await click(button(r, "روز قبل").props.onPress);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  assert.ok(
    JSON.stringify(r.toJSON()).includes(yesterday.toLocaleDateString("fa-IR")),
  );
  assert.ok(JSON.stringify(r.toJSON()).includes("بازه‌ای ثبت نشده است"));
  readFailures.match = null;
  await unmount(r);
});
