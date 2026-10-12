import { uiIdentifiers } from "../components/uiIdentifiers";
import { IdentifierTitle, identifierAlert } from "../components/Ui";
import { timezone } from "../utils/slots";
import { ActivityIcon } from "../components/ActivityIcon";
import { useFocusEffect } from "@react-navigation/native";
import { dayScopeFor } from "../services/dayScopeService";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { View, Text, AppState } from "react-native";
import { ActivityGrid } from "../components/ActivityGrid";
import { ClassificationPicker } from "../components/ClassificationPicker";
import {
  ui,
  Button,
  ErrorText,
  errorMessage,
  Input,
  Loading,
} from "../components/Ui";
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
    [draft, setDraft] = useState<Activity | null>(null),
    [zoneChanged, setZoneChanged] = useState(false),
    [notice, setNotice] = useState(route.params.notice ?? ""),
    [reopened, setReopened] = useState(false),
    [editing, setEditing] = useState(false),
    [selection, setSelection] = useState<Selection | undefined>(),
    [zone, setZone] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [undo, setUndo] = useState<UndoToken | null>(null);
  const scope = useMemo(
    () => route.params.dayScope ?? dayScopeFor(start),
    [start],
  );
  const guard = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setZoneChanged(timezone() !== scope.timezone);
    });
    return () => sub.remove();
  }, [scope]);
  async function load() {
    const [c, a] = await Promise.all([
      getCheckInContext(start),
      getRankedActivities(new Date(), scope.timezone),
    ]);
    setCtx(c);
    setItems(a.allActivities);

    setSelection(undefined);
  }
  useFocusEffect(
    useCallback(() => {
      setCtx(null);
      setReopened(false);
      if (!guard.current) void load().catch((e) => setError(errorMessage(e)));
    }, [start]),
  );
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
    setDraft(a);
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
      setDraft(null);
      setEditing(false);
      if (r.status === "saved") {
        navigation.replace("SaveResult", {
          scope,
          cutoffUtc: new Date().toISOString(),
          undo: r.undo,
          period: { start, end, slotId, source: source ?? "manual" },
        });
      } else {
        setNotice("تغییری اعمال نشد");
        await load().catch((e) =>
          setError(`تغییری اعمال نشد؛ بارگذاری مجدد: ${errorMessage(e)}`),
        );
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  function choose(a: Activity) {
    if (ctx?.entry) {
      identifierAlert(
        uiIdentifiers.changeEntryDialog.code,
        "تغییر ثبت؟",
        "فعالیت یا دستهٔ این بازه تغییر کند؟",
        [
          {
            text: "انصراف",
            actionCode: uiIdentifiers.cancelConfirmation.code,
            style: "cancel",
          },
          {
            text: "تأیید",
            actionCode: uiIdentifiers.confirmCheckInChange.code,
            onPress: () => save(a),
          },
        ],
      );
    } else save(a);
  }
  const code =
      selection?.mode === "explicit"
        ? selection.code
        : (ctx?.classification?.code ?? null),
    n = nodes.find((n) => n.code === code);
  const header = (
    <>
      <IdentifierTitle
        title="چه کار می‌کردی؟"
        code={uiIdentifiers.checkIn.code}
      />
      <Text style={ui.muted}>
        {new Date(start).toLocaleDateString("fa-IR", {
          timeZone: scope.timezone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <Text style={ui.text}>
        {new Date(start).toLocaleTimeString("fa-IR", {
          timeZone: scope.timezone,
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        تا{" "}
        {new Date(end).toLocaleTimeString("fa-IR", {
          timeZone: scope.timezone,
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <ErrorText error={error} />
      <Text style={ui.muted}>{scope.timezone}</Text>
      {zoneChanged && (
        <Text style={ui.muted}>
          این ثبت و مرور با منطقهٔ زمانی {scope.timezone} ادامه پیدا می‌کند.
        </Text>
      )}
      {!!notice && <Text style={ui.text}>{notice}</Text>}
      {busy && (
        <Text accessibilityLiveRegion="polite" style={ui.text}>
          در حال ثبت…
        </Text>
      )}
      {draft && !!error && (
        <Button
          title="تلاش دوباره برای ثبت فعالیت انتخابی"
          actionCode={uiIdentifiers.retrySelectedCheckIn.code}
          disabled={busy}
          onPress={() => void save(draft)}
        />
      )}
      {!ctx?.entry && route.params.entryState === "skipped" && !reopened && (
        <>
          <Text style={ui.text}>این بازه قبلاً رد شده است.</Text>
          <Button
            title="ثبت فعالیت"
            actionCode={uiIdentifiers.reopenSkippedSlot.code}
            onPress={() => setReopened(true)}
          />
          <Button
            title="فعلاً نه"
            actionCode={uiIdentifiers.navigateBack.code}
            onPress={() => navigation.goBack()}
          />
        </>
      )}
      {ctx?.entry && <Text style={ui.muted}>این بازه قبلاً ثبت شده است.</Text>}

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
          <ActivityIcon
            icon={ctx.entry.activity_icon_view}
            legacy={ctx.entry.activity_icon}
          />
          <Text style={ui.text}>
            فعالیت:{" "}
            {ctx.entry.activity_name ??
              items.find((a) => a.id === ctx.entry!.activity_id)?.name ??
              "فعالیت آرشیوشده"}
          </Text>
          <Text style={ui.muted}>
            دسته: {n?.title_fa ?? n?.title_en ?? "مشخص نشده"}
          </Text>
          <Text style={ui.muted}>
            منطقهٔ زمان ثبت: {ctx.context?.timezone_id ?? "نامعلوم"}
          </Text>
          <Input
            style={ui.input}
            accessibilityLabel="منطقهٔ زمانی تأییدشده"
            actionCode={uiIdentifiers.editConfirmedTimezone.code}
            placeholder="منطقهٔ تأییدشده، مثال Asia/Tehran"
            value={zone}
            onChangeText={setZone}
          />
          <Button
            title="تأیید منطقهٔ این ثبت"
            actionCode={uiIdentifiers.requestTimezoneConfirmation.code}
            disabled={!zone.trim() || busy}
            onPress={() =>
              identifierAlert(
                uiIdentifiers.confirmTimezoneDialog.code,
                "تأیید منطقهٔ زمانی؟",
                "این منطقه برای زمان انجام فعالیت ثبت شود؟",
                [
                  {
                    text: "انصراف",
                    actionCode: uiIdentifiers.cancelConfirmation.code,
                  },
                  {
                    text: "تأیید",
                    actionCode: uiIdentifiers.confirmEntryTimezone.code,
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
          <Button
            title="ویرایش"
            actionCode={uiIdentifiers.editCheckIn.code}
            onPress={() => setEditing(true)}
          />
          <Button
            title="بازگشت"
            actionCode={uiIdentifiers.navigateBack.code}
            onPress={() => navigation.goBack()}
          />
        </>
      ) : (
        <>
          <Text style={ui.text}>این زمان را بیشتر صرف چه کاری کردی؟</Text>
          <ClassificationPicker
            value={code}
            onChange={(code) => setSelection({ mode: "explicit", code })}
          />
          <Button
            variant="secondary"
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
          <Text accessibilityRole="header" style={ui.title}>
            همهٔ فعالیت‌ها
          </Text>
          {!ctx?.entry && (
            <Text style={ui.muted}>با لمس فعالیت، این بازه ثبت می‌شود.</Text>
          )}
        </>
      )}
      {!ctx?.entry && items.length === 0 && (
        <>
          <Button
            title="افزودن یا بازگرداندن فعالیت"
            actionCode={uiIdentifiers.openActivitiesFromEmptyCheckIn.code}
            onPress={() =>
              navigation.navigate("Main", { screen: "Activities" })
            }
          />
        </>
      )}
      {!ctx?.entry && slotId && (
        <Button
          variant="secondary"
          title="رد کردن این بازه"
          actionCode={uiIdentifiers.requestSkipSlot.code}
          onPress={() =>
            identifierAlert(
              uiIdentifiers.skipSlotDialog.code,
              "رد کردن بازه؟",
              "این زمان بدون فعالیت باقی می‌ماند.",
              [
                {
                  text: "انصراف",
                  actionCode: uiIdentifiers.cancelConfirmation.code,
                },
                {
                  text: "رد کردن",
                  actionCode: uiIdentifiers.confirmSkipSlot.code,
                  onPress: () =>
                    skipSlot(slotId)
                      .then(() => navigation.goBack())
                      .catch((e) => setError(errorMessage(e))),
                },
              ],
            )
          }
        />
      )}
    </>
  );
  return (
    <View style={ui.page}>
      {!ctx ? (
        <>
          <IdentifierTitle
            title="ثبت و مشاهدهٔ بازه"
            code={uiIdentifiers.checkIn.code}
          />
          <ErrorText error={error} />
          <Loading />
          <Button
            title="تلاش مجدد"
            actionCode={uiIdentifiers.retryCheckInRead.code}
            onPress={() => load().catch((e) => setError(errorMessage(e)))}
          />
        </>
      ) : (
        <ActivityGrid
          activities={
            (ctx.entry && !editing) ||
            (route.params.entryState === "skipped" && !reopened)
              ? []
              : items
          }
          disabled={busy}
          showEmpty={
            !ctx.entry && !(route.params.entryState === "skipped" && !reopened)
          }
          header={header}

          actionCode={
            ctx.entry
              ? uiIdentifiers.requestCheckInChange.code
              : uiIdentifiers.commitNewCheckIn.code
          }
          onSelect={choose}
        />
      )}
    </View>
  );
}
