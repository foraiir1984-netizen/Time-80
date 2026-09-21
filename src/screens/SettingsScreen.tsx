import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Switch, TextInput, Alert } from "react-native";
import { getSettings } from "../db/database";
import { applySettingsPatch } from "../services/settingsService";
import {
  reconcileNotifications,
  ensureNotificationPermission,
} from "../notifications/scheduler";
import type { AppSettings } from "../types/domain";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
export function SettingsScreen({ navigation }: any) {
  const [s, setS] = useState<AppSettings | null>(null),
    [interval, setInterval] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const discard = useRef(false);
  useEffect(() => {
    getSettings()
      .then((v) => {
        setS(v);
        setInterval(String(v.interval_minutes));
        setStart(v.day_start);
        setEnd(v.day_end);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e: any) => {
        if (
          discard.current ||
          !s ||
          (interval === String(s.interval_minutes) &&
            start === s.day_start &&
            end === s.day_end)
        )
          return;
        e.preventDefault();
        Alert.alert("ویرایش ذخیره‌نشده", "تغییر ناقص را کنار بگذاریم؟", [
          { text: "ادامهٔ ویرایش" },
          {
            text: "کنار گذاشتن",
            onPress: () => {
              discard.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, s, interval, start, end],
  );
  async function save(patch: Partial<AppSettings>) {
    if (!s) return;
    setError("");
    setBusy(true);
    try {
      if (patch.notification_enabled === 1)
        await ensureNotificationPermission({ ...s, ...patch });
      const result = await applySettingsPatch(patch);
      setS(result.settings);
      setMessage("تنظیمات ذخیره شد");
      try {
        await reconcileNotifications("settings");
        setMessage("تنظیمات ذخیره و اعلان‌ها هماهنگ شدند");
      } catch (e) {
        setError(errorMessage(e));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (!s)
    return (
      <View>
        <ErrorText error={error} />
        <Text style={ui.text}>در حال بارگذاری…</Text>
      </View>
    );
  return (
    <ScrollView
      contentContainerStyle={{ padding: 18, paddingBottom: 70 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={ui.title}>تنظیمات یادآوری</Text>
      <Text style={ui.muted}>{message}</Text>
      <ErrorText error={error} />
      <View style={ui.row}>
        <Text style={ui.text}>یادآوری فعال</Text>
        <Switch
          disabled={busy}
          value={!!s.notification_enabled}
          onValueChange={(v) => save({ notification_enabled: v ? 1 : 0 })}
        />
      </View>
      <Text style={ui.text}>فاصله به دقیقه (۱۵ تا ۲۴۰)</Text>
      <TextInput
        style={ui.input}
        keyboardType="number-pad"
        value={interval}
        onChangeText={setInterval}
        onBlur={() => {
          if (interval !== String(s.interval_minutes))
            save({ interval_minutes: Number(interval) });
        }}
      />
      <Text style={ui.text}>شروع روز HH:MM</Text>
      <TextInput
        style={ui.input}
        value={start}
        onChangeText={setStart}
        onBlur={() => {
          if (start !== s.day_start) save({ day_start: start });
        }}
      />
      <Text style={ui.text}>پایان روز HH:MM</Text>
      <TextInput
        style={ui.input}
        value={end}
        onChangeText={setEnd}
        onBlur={() => {
          if (end !== s.day_end) save({ day_end: end });
        }}
      />
      <Text style={ui.text}>روزهای فعال</Text>
      <View style={ui.row}>
        {[
          "شنبه",
          "یکشنبه",
          "دوشنبه",
          "سه‌شنبه",
          "چهارشنبه",
          "پنجشنبه",
          "جمعه",
        ].map((name, i) => {
          const day = ((i + 6) % 7) + 1;
          return (
            <Button
              key={day}
              disabled={busy}
              title={`${s.active_days.includes(day) ? "✓ " : ""}${name}`}
              onPress={() =>
                save({
                  active_days: s.active_days.includes(day)
                    ? s.active_days.filter((d) => d !== day)
                    : [...s.active_days, day],
                })
              }
            />
          );
        })}
      </View>
      <View style={ui.row}>
        <Text>صدا</Text>
        <Switch
          disabled={busy}
          value={!!s.sound_enabled}
          onValueChange={(v) => save({ sound_enabled: v ? 1 : 0 })}
        />
        <Text>لرزش</Text>
        <Switch
          disabled={busy}
          value={!!s.vibration_enabled}
          onValueChange={(v) => save({ vibration_enabled: v ? 1 : 0 })}
        />
      </View>
      <Button
        title="بررسی اعلان‌ها"
        onPress={() => navigation.navigate("Diagnostics")}
      />
      <Text style={ui.muted}>
        تنظیم معتبر هنگام پایان ویرایش ذخیره می‌شود. بازهٔ جاری کامل و فاصلهٔ
        جدید از پایان آن شروع می‌شود.
      </Text>
    </ScrollView>
  );
}
