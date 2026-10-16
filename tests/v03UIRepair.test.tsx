import React from "react";
import { test, before, after, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TodayScreen } from "../src/screens/TodayScreen";
import { InsightsScreen } from "../src/screens/InsightsScreen";
import { SettingsScreen } from "../src/screens/SettingsScreen";
import { Button } from "../src/components/Ui";
import { initDatabase } from "../src/db/database";
import { db } from "../src/db/connection";
import { dimensions, FlatList } from "./react-native.mjs";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const live = new Set<ReactTestRenderer>();
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function settle(fn: () => unknown = () => {}) {
  await act(async () => {
    fn();
    for (let i = 0; i < 30; i++) await tick();
  });
}
before(async () => {
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-12T12:00:00Z") });
  await initDatabase();
  await (
    await db()
  ).runAsync(
    "INSERT OR IGNORE INTO expected_slots(period_start,period_end,duration_minutes,created_at,updated_at) VALUES(?,?,30,?,?)",
    "2026-10-12T06:00:00.000Z",
    "2026-10-12T06:30:00.000Z",
    "2026-10-12T06:00:00.000Z",
    "2026-10-12T06:00:00.000Z",
  );
  await (
    await db()
  ).runAsync(
    "UPDATE settings SET notification_enabled=0, day_start='08:00',day_end='23:00',active_days='[1,2,3,4,5,6,7]'",
  );
});
afterEach(async () => {
  for (const r of live) await act(async () => r.unmount());
  live.clear();
  dimensions.fontScale = 1;
  dimensions.width = 400;
});
after(() => mock.timers.reset());
// RN rejects strings below View/Pressable even when a host renderer accepts them.
// This guards a native render failure, not text fit, geometry or visual acceptance.
function assertNativeTextParents(node: any) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(assertNativeTextParents);
    return;
  }
  for (const child of node.children ?? []) {
    if (typeof child === "string")
      assert.equal(
        node.type,
        "Text",
        `Raw text under ${node.type}: ${JSON.stringify(child)}`,
      );
    else assertNativeTextParents(child);
  }
}
for (const scale of [1, 1.5, 2])
  test(`repair: actual screens render native-safe text at scale ${scale}; Today footer keeps actions without duplicate targets`, async () => {
    dimensions.fontScale = scale;
    dimensions.width = 360;
    const calls: unknown[] = [];
    for (const Screen of [TodayScreen, InsightsScreen, SettingsScreen]) {
      let r!: ReactTestRenderer;
      await settle(() => {
        r = create(
          <Screen
            navigation={{
              navigate: (...args: unknown[]) => calls.push(args),
              addListener: () => () => {},
            }}
          />,
        );
        live.add(r);
      });
      assertNativeTextParents(r.toJSON());
      if (Screen === TodayScreen) {
        const buttons = (code: string) =>
          r.root
            .findAllByType(Button)
            .filter((b) => b.props.actionCode === code);
        assert.equal(buttons("X08").length, 1);
        assert.equal(buttons("X07").length, 1);
        const list = r.root.findByType(FlatList);
        assert.ok(list.props.ListFooterComponent);
        const x07 = buttons("X07")[0]!;
        await settle(() => x07.props.onPress());
        assert.equal(calls.length, 1);
        assert.equal((calls[0] as unknown[])[0], "CheckIn");
        assert.equal((calls[0] as any[])[1].start, "2026-10-12T06:00:00.000Z");
        assert.equal((calls[0] as any[])[1].end, "2026-10-12T06:30:00.000Z");
        await settle(() => buttons("X08")[0]!.props.onPress());
        assert.ok(JSON.stringify(r.toJSON()).includes("A05"));
        assertNativeTextParents(r.toJSON());
      }
      await act(async () => r.unmount());
      live.delete(r);
    }
  });
