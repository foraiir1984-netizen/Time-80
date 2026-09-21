import React, { useState } from "react";
import { View, Text } from "react-native";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { getSettings } from "../db/database";
import { transaction } from "../db/connection";
import { setMeta } from "../db/metaRepository";
import {
  ensureNotificationPermission,
  reconcileNotifications,
  sendTestNotification,
  getNextReminder,
} from "../notifications/scheduler";
import { applySettingsPatch } from "../services/settingsService";
export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function enable() {
    try {
      if (!(await ensureNotificationPermission(await getSettings())))
        throw Error("مجوز داده نشد؛ ثبت دستی همچنان ممکن است");
      await applySettingsPatch({ notification_enabled: 1 });
      await reconcileNotifications("onboarding");
      const n = await getNextReminder();
      setMessage(
        n
          ? `اولین یادآوری: ${new Date(n.period_end).toLocaleString("fa-IR")}`
          : "برای امروز بازه‌ای نیست",
      );
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <View style={[ui.page, { justifyContent: "center" }]}>
      <Text style={ui.title}>به Time80 خوش آمدی</Text>
      <Text style={ui.text}>
        با یادآوری‌های کوتاه ثبت کن زمانت صرف چه کاری شده است. داده‌ها روی همین
        گوشی ذخیره می‌شوند و دسته‌بندی ICATUS اختیاری است.
      </Text>
      <ErrorText error={error} />
      <Text style={ui.text}>{message}</Text>
      <Button title="فعال‌کردن یادآوری" onPress={enable} />
      <Button
        title="تست اعلان در ۱۰ ثانیه"
        onPress={() =>
          sendTestNotification()
            .then(() => setMessage("تست زمان‌بندی شد"))
            .catch((e) => setError(errorMessage(e)))
        }
      />
      <Button
        title="ورود به برنامه / ادامه بدون اعلان"
        onPress={() =>
          transaction((tx) => setMeta(tx, "onboarding_completed", "true"))
            .then(onDone)
            .catch((e) => setError(errorMessage(e)))
        }
      />
    </View>
  );
}
