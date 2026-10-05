import React, { useState, useEffect } from "react";
import { ScrollView, Text, AppState } from "react-native";
import { getDayRemaining } from "../services/dayScopeService";
import { undoEntryEdit, type UndoToken } from "../services/checkInService";
import { timezone } from "../utils/slots";
import { ui, Button, ErrorText, errorMessage, Loading } from "../components/Ui";
export function SaveResultScreen({ route, navigation }: any) {
  const { scope, cutoffUtc, period } = route.params;
  const [count, setCount] = useState<number | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [zoneChanged, setZoneChanged] = useState(false),
    [undo, setUndo] = useState<UndoToken | null>(route.params.undo ?? null),
    [busy, setBusy] = useState(false);
  async function read() {
    setLoading(true);
    setCount(null);
    setError("");
    try {
      setCount((await getDayRemaining(scope, cutoffUtc)).count);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void read();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setZoneChanged(timezone() !== scope.timezone);
    });
    return () => sub.remove();
  }, [scope, cutoffUtc]);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(
      () => setUndo(null),
      Math.max(0, undo.deadline - performance.now()),
    );
    return () => clearTimeout(t);
  }, [undo]);
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text accessibilityLiveRegion="polite" style={ui.title}>
        ثبت شد
      </Text>
      <Text style={ui.text}>
        {new Date(scope.dayStartUtc).toLocaleDateString("fa-IR", {
          timeZone: scope.timezone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {scope.timezone}
      </Text>
      {zoneChanged && (
        <Text style={ui.muted}>
          این ثبت و مرور با منطقهٔ زمانی {scope.timezone} ادامه پیدا می‌کند.
        </Text>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Text style={ui.text}>
            ثبت شد؛ شمارش باقی‌مانده‌ها فعلاً در دسترس نیست.
          </Text>
          <ErrorText error={error} />
          <Button title="تلاش دوباره برای شمارش" onPress={() => void read()} />
        </>
      ) : (
        <>
          <Text style={ui.text}>
            {count === 0
              ? "بازهٔ سررسیدشدهٔ دیگری برای این روز باقی نمانده است."
              : `${count} بازهٔ سررسیدشدهٔ دیگر برای همین روز باقی مانده است.`}
          </Text>
          {!!count && (
            <Button
              title="مرور بازه‌های باقی‌مانده"
              onPress={() => navigation.replace("Backlog", { dayScope: scope })}
            />
          )}
        </>
      )}
      {undo && (
        <Button
          title="بازگردانی تغییر (۱۰ ثانیه)"
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await undoEntryEdit(undo);
              setUndo(null);
              navigation.replace("CheckIn", { ...period, dayScope: scope });
            } catch (e) {
              setError(errorMessage(e));
              setUndo(null);
              navigation.replace("CheckIn", {
                ...period,
                dayScope: scope,
                notice: "امکان واگرد این تغییر دیگر وجود ندارد",
              });
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      <Button
        title="مشاهدهٔ ثبت"
        onPress={() =>
          navigation.replace("CheckIn", { ...period, dayScope: scope })
        }
      />
      <Button
        title="تمام"
        onPress={() => navigation.navigate("Main", { screen: "Today" })}
      />
    </ScrollView>
  );
}
