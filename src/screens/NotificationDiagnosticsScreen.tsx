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
      <Text style={ui.text}>تعداد زمان‌بندی واقعی: {d?.scheduled ?? "…"}</Text>
      <Text style={ui.text}>
        نیاز به هماهنگی: {d?.dirty === "true" ? "بله" : "خیر"}
      </Text>
      <Text style={ui.muted}>
        وضعیت محدودیت باتری و پس‌زمینه: نامعلوم. در تنظیمات Samsung، محدودیت
        باتری Time80 را بررسی کن. زمان تحویل دقیق تضمین نمی‌شود.
      </Text>
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
