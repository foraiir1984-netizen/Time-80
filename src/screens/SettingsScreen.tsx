import { SettingsGlyph } from "../components/SettingsGlyph";
import { uiIdentifiers } from "../components/uiIdentifiers";
import {
  IdentifierTitle,
  CodedSwitch,
  identifierAlert,
} from "../components/Ui";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { useFonts } from "expo-font";
import { reportFontSources, reportTypography } from "../theme/reportTheme";
import { theme, iconTones } from "../theme/time80Theme";
import { getSettings } from "../db/database";
import { applySettingsPatch } from "../services/settingsService";
import {
  reconcileNotifications,
  ensureNotificationPermission,
} from "../notifications/scheduler";
import type { AppSettings } from "../types/domain";
import { ui, Button, ErrorText, errorMessage, Input } from "../components/Ui";
function SettingsCard({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  return (
    <View
      testID={id}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {children}
    </View>
  );
}
export function SettingsScreen({ navigation }: any) {
  const [fontsReady, fontError] = useFonts(reportFontSources);
  const typography = reportTypography(fontsReady);
  const errorTypography = { ...typography.body, color: theme.danger };
  const { width, fontScale } = useWindowDimensions();
  const compactHours = width - 64 >= 264 && fontScale < 1.5;
  const green = iconTones.green.foreground;
  const switchPresentation = {
    containerStyle: {
      flexDirection: "row-reverse" as const,
      flexWrap: "wrap" as const,
      gap: 12,
      padding: 0,
    },
    labelStyle: [typography.body, { flexGrow: 1 }],
    codeTextStyle: typography.code,
    trackColor: { false: theme.border, true: green },
    thumbColor: theme.surface,
  };
  const fieldStyle = [
    typography.body,
    {
      minHeight: 48,
      borderRadius: 12,
      borderColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginVertical: 0,
      color: theme.text,
      textAlign: "center" as const,
      writingDirection: "ltr" as const,
    },
  ];

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
        identifierAlert(
          uiIdentifiers.unsavedSettingsDialog.code,
          "ویرایش ذخیره‌نشده",
          "تغییر ناقص را کنار بگذاریم؟",
          [
            {
              text: "ادامهٔ ویرایش",
              actionCode: uiIdentifiers.continueSettingsDraft.code,
            },
            {
              text: "کنار گذاشتن",
              actionCode: uiIdentifiers.discardIncompleteSettingsDraft.code,
              onPress: () => {
                discard.current = true;
                navigation.dispatch(e.data.action);
              },
            },
          ],
        );
      }),
    [navigation, s, interval, start, end],
  );
  async function save(patch: Partial<AppSettings>) {
    if (!s) return;
    setError("");
    setMessage("");
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
      <View style={[ui.page, { padding: 16 }]}>
        <IdentifierTitle
          title="تنظیمات یادآوری"
          code={uiIdentifiers.reminderSettings.code}
          textProps={{ style: typography.pageTitle }}
          codeTextStyle={typography.code}
        />
        <ErrorText error={error} textStyle={errorTypography} />
        {!error && (
          <Text allowFontScaling style={typography.body}>
            در حال بارگذاری…
          </Text>
        )}
      </View>
    );
  return (
    <ScrollView
      style={ui.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <IdentifierTitle
        title="تنظیمات یادآوری"
        code={uiIdentifiers.reminderSettings.code}
        textProps={{ style: typography.pageTitle }}
        codeTextStyle={typography.code}
      />
      {fontError && (
        <Text allowFontScaling style={typography.secondary}>
          فونت مصوب بارگذاری نشد؛ فونت سیستم نمایش داده می‌شود.
        </Text>
      )}
      {busy && (
        <Text allowFontScaling style={typography.secondary}>
          در حال ذخیره…
        </Text>
      )}
      {!!message && (
        <Text allowFontScaling style={typography.secondary}>
          {message}
        </Text>
      )}
      <ErrorText error={error} textStyle={errorTypography} />
      <SettingsCard id="settings-reminder-card">
        <CodedSwitch
          {...switchPresentation}
          labelIcon={<SettingsGlyph kind="bell" />}
          accessibilityLabel="یادآوری فعال"
          actionCode={uiIdentifiers.toggleReminders.code}
          disabled={busy}
          value={!!s.notification_enabled}
          onValueChange={(v) => save({ notification_enabled: v ? 1 : 0 })}
        />
        <Text allowFontScaling style={[typography.secondary, { marginTop: 8 }]}>
          وضعیت مجوز و ارسال را در «بررسی اعلان‌ها» ببینید.
        </Text>
      </SettingsCard>
      <SettingsCard id="settings-interval-card">
        <Input
          labelIcon={<SettingsGlyph kind="clock" />}
          accessibilityLabel="فاصلهٔ یادآوری به دقیقه"
          label="فاصلهٔ یادآوری"
          stackLabel
          actionCode={uiIdentifiers.editReminderInterval.code}
          labelStyle={typography.cardTitle}
          codeTextStyle={typography.code}
          containerStyle={{
            flexDirection: "row-reverse",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
          labelContainerStyle={{ flex: 1, minWidth: 140, gap: 8 }}
          style={[
            fieldStyle,
            { width: Math.ceil(88 * Math.max(1, fontScale)), maxWidth: "100%" },
          ]}
          keyboardType="number-pad"
          value={interval}
          onChangeText={setInterval}
          onBlur={() => {
            if (interval !== String(s.interval_minutes))
              save({ interval_minutes: Number(interval) });
          }}
        />
        <Text allowFontScaling style={[typography.secondary, { marginTop: 8 }]}>
          ۱۵ تا ۲۴۰ دقیقه
        </Text>
      </SettingsCard>
      <SettingsCard id="settings-hours-card">
        <View
          style={{
            flexDirection: compactHours ? "row-reverse" : "column",
            gap: 12,
          }}
        >
          <View style={{ flex: compactHours ? 1 : undefined, minWidth: 0 }}>
            <Input
              labelIcon={<SettingsGlyph kind="start" />}
              accessibilityLabel="شروع روز HH:MM"
              label="شروع روز"
              stackLabel
              actionCode={uiIdentifiers.editDayStart.code}
              labelStyle={[typography.cardTitle, { textAlign: "center" }]}
              labelContainerStyle={{
                gap: 4,
                flexDirection: "row-reverse",
                flexWrap: "nowrap",
                alignItems: "center",
                marginBottom: 8,
              }}
              codeTextStyle={typography.code}
              style={fieldStyle}
              placeholder="HH:MM"
              value={start}
              onChangeText={setStart}
              onBlur={() => {
                if (start !== s.day_start) save({ day_start: start });
              }}
            />
          </View>
          <View style={{ flex: compactHours ? 1 : undefined, minWidth: 0 }}>
            <Input
              labelIcon={<SettingsGlyph kind="end" />}
              accessibilityLabel="پایان روز HH:MM"
              label="پایان روز"
              stackLabel
              actionCode={uiIdentifiers.editDayEnd.code}
              labelStyle={[typography.cardTitle, { textAlign: "center" }]}
              labelContainerStyle={{
                gap: 4,
                flexDirection: "row-reverse",
                flexWrap: "nowrap",
                alignItems: "center",
                marginBottom: 8,
              }}
              codeTextStyle={typography.code}
              style={fieldStyle}
              placeholder="HH:MM"
              value={end}
              onChangeText={setEnd}
              onBlur={() => {
                if (end !== s.day_end) save({ day_end: end });
              }}
            />
          </View>
        </View>
      </SettingsCard>
      <SettingsCard id="settings-days-card">
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <SettingsGlyph kind="calendar" />
          <Text
            allowFontScaling
            accessibilityRole="header"
            style={[typography.cardTitle, { flex: 1 }]}
          >
            روزهای فعال
          </Text>
        </View>
        <View
          style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}
        >
          {[
            "شنبه",
            "یکشنبه",
            "دوشنبه",
            "سه‌شنبه",
            "چهارشنبه",
            "پنجشنبه",
            "جمعه",
          ].map((name, i) => {
            const day = ((i + 6) % 7) + 1,
              selected = s.active_days.includes(day);
            return (
              <Button
                key={day}
                disabled={busy}
                title={`${selected ? "✓ " : ""}${name}`}
                actionCode={uiIdentifiers.toggleActiveDay.code}
                variant="secondary"
                selected={selected}
                color={selected ? theme.surface : green}
                textStyle={[
                  typography.control,
                  { color: selected ? theme.surface : green },
                ]}
                codeTextStyle={typography.code}
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginVertical: 0,
                  backgroundColor: selected ? green : theme.surface,
                  borderColor: selected ? green : theme.border,
                }}
                onPress={() =>
                  save({
                    active_days: selected
                      ? s.active_days.filter((d) => d !== day)
                      : [...s.active_days, day],
                  })
                }
              />
            );
          })}
        </View>
      </SettingsCard>
      <SettingsCard id="settings-notifications-card">
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <SettingsGlyph kind="settings" />
          <Text
            allowFontScaling
            accessibilityRole="header"
            style={[typography.cardTitle, { flex: 1 }]}
          >
            تنظیمات اعلان
          </Text>
        </View>
        <CodedSwitch
          {...switchPresentation}
          disabled={busy}
          labelIcon={<SettingsGlyph kind="sound" />}
          accessibilityLabel="صدا"
          actionCode={uiIdentifiers.toggleSound.code}
          value={!!s.sound_enabled}
          onValueChange={(v) => save({ sound_enabled: v ? 1 : 0 })}
        />
        <View
          style={{
            marginVertical: 12,
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}
        />
        <CodedSwitch
          {...switchPresentation}
          disabled={busy}
          labelIcon={<SettingsGlyph kind="vibration" />}
          accessibilityLabel="لرزش"
          actionCode={uiIdentifiers.toggleVibration.code}
          value={!!s.vibration_enabled}
          onValueChange={(v) => save({ vibration_enabled: v ? 1 : 0 })}
        />
      </SettingsCard>
      <Button
        title="بررسی اعلان‌ها"
        actionCode={uiIdentifiers.openNotificationDiagnostics.code}
        color={theme.surface}
        textStyle={[
          typography.control,
          { color: theme.surface, textAlign: "center" },
        ]}
        codeTextStyle={typography.code}
        style={{
          minWidth: 48,
          minHeight: 48,
          borderRadius: 16,
          backgroundColor: green,
          marginVertical: 0,
        }}
        onPress={() => navigation.navigate("Diagnostics")}
      />
      <Text allowFontScaling style={[typography.secondary, { marginTop: 12 }]}>
        تنظیم معتبر هنگام پایان ویرایش ذخیره می‌شود. بازهٔ جاری کامل و فاصلهٔ
        جدید از پایان آن شروع می‌شود.
      </Text>
    </ScrollView>
  );
}
