import React, { useState, useEffect } from "react";
import { ScrollView, Text, Linking } from "react-native";
import { getNotificationDiagnostics } from "../notifications/diagnostics";
import {
  reconcileNotifications,
  sendTestNotification,
  ensureNotificationPermission,
} from "../notifications/scheduler";
import { getSettings } from "../db/database";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
export function NotificationDiagnosticsScreen() {
  const [d, setD] = useState<Awaited<
      ReturnType<typeof getNotificationDiagnostics>
    > | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = () =>
    getNotificationDiagnostics()
      .then(setD)
      .catch((e) => setError(errorMessage(e)));
  useEffect(() => {
    load();
  }, []);
  async function action(fn: () => Promise<unknown>, text: string) {
    try {
      await fn();
      setMessage(text);
      setError("");
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={ui.title}>بررسی اعلان‌ها</Text>
      <ErrorText error={error} />
      <Text style={ui.text}>{message}</Text>
      <Text style={ui.text}>
        مجوز: {d?.permission.granted ? "مجاز" : "داده نشده"}
      </Text>
      <Text style={ui.text}>
        تعداد درخواست‌های cache زمان‌بندی: {d?.scheduled ?? "…"}
      </Text>
      <Text style={ui.text}>
        نیاز به هماهنگی: {d?.dirty === "true" ? "بله" : "خیر"}
      </Text>
      {d &&
        Object.entries(d.capabilities).map(([key, c]) => (
          <Text key={key} style={ui.text}>
            {(
              {
                displayPermission: "مجوز نمایش",
                channelEnabled: "کانال اعلان",
                exactAlarmAllowed: "دسترسی alarm دقیق",
                batteryOptimizationExempt: "معافیت بهینه‌سازی باتری",
                backgroundRestricted: "محدودیت پس‌زمینه",
              } as Record<string, string>
            )[key] ?? key}
            :{" "}
            {c.supported && c.value !== null
              ? c.value
                ? "بله"
                : "خیر"
              : "نامعلوم"}
          </Text>
        ))}
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
          action(async () => {
            const ok = await ensureNotificationPermission(await getSettings());
            if (!ok) throw Error("مجوز داده نشد؛ تنظیمات گوشی را بررسی کن");
          }, "مجوز برقرار است")
        }
      />
      <Button
        title="بازکردن تنظیمات گوشی"
        onPress={() => Linking.openSettings()}
      />
      <Button
        title="اعلان آزمایشی در ۱۰ ثانیه"
        onPress={() => action(sendTestNotification, "تست زمان‌بندی شد")}
      />
      <Button
        title="هماهنگ‌سازی مجدد"
        onPress={() =>
          action(() => reconcileNotifications("manual"), "هماهنگ شد")
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
