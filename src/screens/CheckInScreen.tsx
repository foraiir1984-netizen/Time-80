import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, TextInput } from "react-native";
import { ActivityGrid } from "../components/ActivityGrid";
import { ClassificationPicker } from "../components/ClassificationPicker";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import {
  confirmTimeContext,
  getCheckInContext,
  commitCheckIn,
  undoEntryEdit,
  type UndoToken,
} from "../services/checkInService";
import { getRankedActivities } from "../services/activityService";
import { skipSlot } from "../services/slotService";
import type { Activity, EntryContext, Selection } from "../types/domain";
import { nodes } from "../services/classificationDataset";
export function CheckInScreen({ route, navigation }: any) {
  const { start, end, source, slotId } = route.params,
    [ctx, setCtx] = useState<EntryContext | null>(null),
    [items, setItems] = useState<Activity[]>([]),
    [top, setTop] = useState<Activity[]>([]),
    [editing, setEditing] = useState(false),
    [selection, setSelection] = useState<Selection | undefined>(),
    [zone, setZone] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [undo, setUndo] = useState<UndoToken | null>(null);
  const guard = useRef(false);
  async function load() {
    const [c, a] = await Promise.all([
      getCheckInContext(start),
      getRankedActivities(),
    ]);
    setCtx(c);
    setItems(a.allActivities);
    setTop(a.top4);
    setSelection(undefined);
  }
  useEffect(() => {
    load().catch((e) => setError(errorMessage(e)));
  }, [start]);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 10000);
    return () => clearTimeout(t);
  }, [undo]);
  async function save(a: Activity) {
    if (guard.current || !ctx) return;
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await commitCheckIn({
        activityId: a.id,
        periodStart: start,
        periodEnd: end,
        source: source ?? "manual",
        expectedEntry: ctx.entry,
        expectedClassificationRevision: ctx.classification?.revision ?? null,
        classificationSelection: selection,
      });
      setUndo(r.undo);
      await load();
      setEditing(false);
      if (!r.undo) navigation.goBack();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  function choose(a: Activity) {
    if (ctx?.entry) {
      Alert.alert("تغییر ثبت؟", "فعالیت یا دستهٔ این بازه تغییر کند؟", [
        { text: "انصراف", style: "cancel" },
        { text: "تأیید", onPress: () => save(a) },
      ]);
    } else save(a);
  }
  const code =
      selection?.mode === "explicit"
        ? selection.code
        : (ctx?.classification?.code ?? null),
    n = nodes.find((n) => n.code === code);
  const header = (
    <>
      <Text style={ui.title}>
        {new Date(start).toLocaleDateString("fa-IR")}
      </Text>
      <Text style={ui.text}>
        {new Date(start).toLocaleTimeString("fa-IR")} تا{" "}
        {new Date(end).toLocaleTimeString("fa-IR")}
      </Text>
      <ErrorText error={error} />
      {undo && (
        <Button
          title="بازگردانی تغییر (۱۰ ثانیه)"
          disabled={busy}
          onPress={async () => {
            try {
              setBusy(true);
              await undoEntryEdit(undo);
              setUndo(null);
              await load();
            } catch (e) {
              setError(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      {ctx?.entry && !editing ? (
        <>
          <Text style={ui.text}>
            فعالیت:{" "}
            {items.find((a) => a.id === ctx.entry!.activity_id)?.name ??
              "فعالیت آرشیوشده"}
          </Text>
          <Text style={ui.muted}>
            دسته: {n?.title_fa ?? n?.title_en ?? "مشخص نشده"}
          </Text>
          <Text style={ui.muted}>
            منطقهٔ زمان ثبت: {ctx.context?.timezone_id ?? "نامعلوم"}
          </Text>
          <TextInput
            style={ui.input}
            placeholder="منطقهٔ تأییدشده، مثال Asia/Tehran"
            value={zone}
            onChangeText={setZone}
          />
          <Button
            title="تأیید منطقهٔ این ثبت"
            disabled={!zone.trim() || busy}
            onPress={() =>
              Alert.alert(
                "تأیید منطقهٔ زمانی؟",
                "این منطقه برای زمان انجام فعالیت ثبت شود؟",
                [
                  { text: "انصراف" },
                  {
                    text: "تأیید",
                    onPress: () => {
                      setBusy(true);
                      confirmTimeContext(ctx, zone)
                        .then(load)
                        .catch((e) => setError(errorMessage(e)))
                        .finally(() => setBusy(false));
                    },
                  },
                ],
              )
            }
          />
          <Button title="ویرایش" onPress={() => setEditing(true)} />
          <Button title="بازگشت" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <>
          <Text style={ui.text}>این زمان را بیشتر صرف چه کاری کردی؟</Text>
          <ClassificationPicker
            value={code}
            onChange={(code) => setSelection({ mode: "explicit", code })}
          />
          <Button
            title="استفاده از پیش‌فرض فعالیت"
            onPress={() => setSelection({ mode: "inherit" })}
          />
          {ctx?.entry && (
            <Button
              title="ذخیرهٔ تغییر دسته"
              disabled={busy}
              onPress={() => choose({ id: ctx.entry!.activity_id } as Activity)}
            />
          )}
          <Text style={ui.muted}>پیشنهادهای ۷ روز اخیر</Text>
          <View style={ui.row}>
            {top.map((a) => (
              <Button
                key={a.id}
                title={`${a.icon} ${a.name}`}
                disabled={busy}
                onPress={() => choose(a)}
              />
            ))}
          </View>
          <Text style={ui.text}>همهٔ فعالیت‌ها</Text>
        </>
      )}
      {!ctx?.entry && slotId && (
        <Button
          title="رد کردن این بازه"
          onPress={() =>
            Alert.alert("رد کردن بازه؟", "این زمان بدون فعالیت باقی می‌ماند.", [
              { text: "انصراف" },
              {
                text: "رد کردن",
                onPress: () =>
                  skipSlot(slotId)
                    .then(() => navigation.goBack())
                    .catch((e) => setError(errorMessage(e))),
              },
            ])
          }
        />
      )}
    </>
  );
  return (
    <View style={ui.page}>
      {!ctx ? (
        <>
          <ErrorText error={error} />
          <ActivityIndicator />
          <Button
            title="تلاش مجدد"
            onPress={() => load().catch((e) => setError(errorMessage(e)))}
          />
        </>
      ) : (
        <ActivityGrid
          activities={ctx.entry && !editing ? [] : items}
          disabled={busy}
          header={header}
          onSelect={choose}
        />
      )}
    </View>
  );
}
