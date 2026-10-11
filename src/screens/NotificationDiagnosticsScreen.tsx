import React, { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView, Text, Linking, AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getNotificationDiagnostics } from "../notifications/diagnostics";
import {
  reconcileNotifications,
  sendTestNotification,
  ensureNotificationPermission,
} from "../notifications/scheduler";
import { getSettings } from "../db/database";
import { ui, Button, ErrorText, errorMessage, Loading } from "../components/Ui";

type Action = "permission" | "settings" | "test" | "reconcile";
const capabilityLabels = {
  displayPermission: "مجوز نمایش",
  channelEnabled: "کانال اعلان",
  exactAlarmAllowed: "دسترسی alarm دقیق",
  batteryOptimizationExempt: "معافیت بهینه‌سازی باتری",
  backgroundRestricted: "محدودیت پس‌زمینه",
};
export function NotificationDiagnosticsScreen() {
  const [d, setD] = useState<Awaited<
      ReturnType<typeof getNotificationDiagnostics>
    > | null>(null),
    [readState, setReadState] = useState<"loading" | "ready" | "failed">(
      "loading",
    ),
    [readError, setReadError] = useState(""),
    [actionErrors, setActionErrors] = useState<Partial<Record<Action, string>>>(
      {},
    ),
    [message, setMessage] = useState("");
  const mounted = useRef(true),
    focused = useRef(false),
    readVersion = useRef(0),
    actionSequence = useRef(0),
    actionVersions = useRef<Partial<Record<Action, number>>>({});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      readVersion.current++;
      actionSequence.current++;
      actionVersions.current = {};
    };
  }, []);
  const load = useCallback(async () => {
    if (!mounted.current || !focused.current) return false;
    const version = ++readVersion.current;
    const current = () =>
      mounted.current && focused.current && version === readVersion.current;
    // A previous snapshot is not evidence of the current OS state.
    setD(null);
    setMessage("");
    setReadState("loading");
    try {
      const result = await getNotificationDiagnostics();
      if (!current()) return false;
      setD(result);
      setReadState("ready");
      setReadError("");
      return true;
    } catch (e) {
      if (!current()) return false;
      setReadState("failed");
      setReadError(errorMessage(e));
      return false;
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      void load();
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") void load();
      });
      return () => {
        focused.current = false;
        readVersion.current++;
        sub.remove();
      };
    }, [load]),
  );
  async function action(key: Action, fn: () => Promise<unknown>, text: string) {
    const version = ++actionSequence.current;
    actionVersions.current[key] = version;
    const current = () =>
      mounted.current && actionVersions.current[key] === version;
    setMessage("");
    let succeeded = false;
    try {
      await fn();
      if (!current()) return;
      setActionErrors((errors) => ({ ...errors, [key]: "" }));
      succeeded = true;
    } catch (e) {
      if (!current()) return;
      setActionErrors((errors) => ({ ...errors, [key]: errorMessage(e) }));
      if (version === actionSequence.current) setMessage("");
    }
    // Reads own their result and error independently of the completed action.
    // A focus/resume refresh never performs permission requests or repair.
    if (current()) {
      const fresh = await load();
      if (current() && fresh && succeeded && version === actionSequence.current)
        setMessage(text);
    }
  }
  const unknown = readState === "loading" ? "در حال بررسی…" : "نامعلوم";
  const permission =
    !d || d.permission.status === "undetermined"
      ? unknown
      : d.permission.granted === true
        ? "مجاز"
        : d.permission.granted === false
          ? "داده نشده"
          : "نامعلوم";
  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      <Text style={ui.title}>بررسی اعلان‌ها</Text>
      <ErrorText error={readError} />
      {Object.entries(actionErrors).map(([key, error]) => (
        <ErrorText key={key} error={error} />
      ))}
      {!Object.values(actionErrors).some(Boolean) && (
        <Text style={ui.text}>{message}</Text>
      )}
      {readState === "loading" && (
        <Loading label="در حال تازه‌سازی بررسی اعلان‌ها" />
      )}
      {readState === "failed" && (
        <Text style={ui.muted}>
          وضعیت تازه دریافت نشد؛ وضعیت فعلی نامعلوم است.
        </Text>
      )}
      <Text style={ui.text}>مجوز: {permission}</Text>
      <Text style={ui.text}>
        تعداد درخواست‌های cache زمان‌بندی: {d?.scheduled ?? unknown}
      </Text>
      <Text style={ui.text}>
        نیاز به هماهنگی:{" "}
        {d?.dirty === "true" ? "بله" : d?.dirty === "false" ? "خیر" : unknown}
      </Text>
      {Object.entries(capabilityLabels).map(([key, label]) => {
        const c = d?.capabilities[key as keyof typeof capabilityLabels];
        return (
          <Text key={key} style={ui.text}>
            {label}:{" "}
            {c?.supported && typeof c.value === "boolean"
              ? key === "channelEnabled"
                ? c.value
                  ? "باز"
                  : "بسته"
                : key === "displayPermission" || key === "exactAlarmAllowed"
                  ? c.value
                    ? "مجاز"
                    : "داده نشده"
                  : c.value
                    ? "بله"
                    : "خیر"
              : unknown}
          </Text>
        );
      })}
      <Text style={ui.muted}>
        وجود درخواست در cache و موفقیت هماهنگ‌سازی، دریافت اعلان را اثبات
        نمی‌کند. ثبت دستی همیشه در دسترس است.
      </Text>
      {!!d?.native.recoveryBlocked && (
        <Text style={ui.error}>
          {d.native.recoveryBlocked.includes("timezone")
            ? "منطقهٔ زمانی تغییر کرده است؛ هماهنگ‌سازی دوباره را اجرا کنید."
            : d.native.recoveryBlocked.includes("horizon")
              ? "برنامهٔ زمان‌بندی نیاز به به‌روزرسانی دارد؛ هماهنگ‌سازی دوباره را اجرا کنید."
              : "هماهنگ‌سازی اعلان‌ها کامل نشده است؛ دوباره تلاش کنید."}
        </Text>
      )}
      <Button
        title="درخواست مجوز"
        onPress={() =>
          action(
            "permission",
            async () => {
              const ok = await ensureNotificationPermission(
                await getSettings(),
              );
              if (!ok) throw Error("مجوز داده نشد؛ تنظیمات گوشی را بررسی کن");
            },
            "مجوز برقرار است",
          )
        }
      />
      <Button
        title="بازکردن تنظیمات گوشی"
        onPress={() => action("settings", () => Linking.openSettings(), "")}
      />
      <Button
        title="اعلان آزمایشی در ۱۰ ثانیه"
        onPress={() => action("test", sendTestNotification, "تست زمان‌بندی شد")}
      />
      <Button
        title="هماهنگ‌سازی مجدد"
        onPress={() =>
          action(
            "reconcile",
            () => reconcileNotifications("manual"),
            "هماهنگ شد",
          )
        }
      />
      {d?.channels.map((c) => (
        <Text key={c.id} style={ui.small}>
          {c.id} · importance {c.importance}
        </Text>
      ))}
    </ScrollView>
  );
}
