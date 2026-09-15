import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { getSettings, saveSettings } from '../db/database';
import { rescheduleTime80Notifications } from '../notifications/scheduler';
import { AppSettings } from '../types/models';
import { parseHHMM, scheduledAlarmCount } from '../utils/time';

const DAYS = [
  { label: 'شنبه', value: 7 },
  { label: 'یکشنبه', value: 1 },
  { label: 'دوشنبه', value: 2 },
  { label: 'سه‌شنبه', value: 3 },
  { label: 'چهارشنبه', value: 4 },
  { label: 'پنجشنبه', value: 5 },
  { label: 'جمعه', value: 6 },
];

type Props = { onChanged: () => void };

export function SettingsScreen({ onChanged }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [intervalText, setIntervalText] = useState('30');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await getSettings();
    setSettings(data);
    setIntervalText(String(data.interval_minutes));
  }, []);

  useEffect(() => { load().catch(console.error); }, [load]);

  const previewSettings = useMemo(() => {
    if (!settings) return null;
    const interval = Number(intervalText);
    if (!Number.isFinite(interval)) return settings;
    return { ...settings, interval_minutes: interval };
  }, [settings, intervalText]);

  if (!settings || !previewSettings) {
    return <ScreenShell title="تنظیمات"><Text style={styles.loading}>در حال بارگذاری…</Text></ScreenShell>;
  }

  const update = (patch: Partial<AppSettings>) => setSettings((current) => current ? ({ ...current, ...patch }) : current);

  const toggleDay = (day: number) => {
    const exists = settings.active_days.includes(day);
    const next = exists ? settings.active_days.filter((d) => d !== day) : [...settings.active_days, day];
    update({ active_days: next });
  };

  const validate = () => {
    const interval = Number(intervalText);
    if (!Number.isInteger(interval) || interval < 15 || interval > 240) return 'فاصله یادآوری باید بین ۱۵ تا ۲۴۰ دقیقه باشد.';
    const start = parseHHMM(settings.day_start);
    const end = parseHHMM(settings.day_end);
    if (start === null || end === null) return 'زمان شروع و پایان باید به شکل HH:MM باشد؛ مثل 08:00.';
    if (end <= start) return 'در نسخه 0.1 زمان پایان باید بعد از زمان شروع و در همان روز باشد.';
    if (settings.active_days.length === 0) return 'حداقل یک روز فعال انتخاب کن.';
    const candidate = { ...settings, interval_minutes: interval };
    if (scheduledAlarmCount(candidate) > 450) return 'این ترکیب تعداد بسیار زیادی اعلان می‌سازد. فاصله را بیشتر یا بازه روزانه را کوتاه‌تر کن.';
    return '';
  };

  const save = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }
    setSaving(true);
    setMessage('');
    const next: AppSettings = { ...settings, interval_minutes: Number(intervalText) };
    try {
      await saveSettings(next);
      const result = await rescheduleTime80Notifications(next);
      setSettings(next);
      setMessage(next.notification_enabled ? `${result.count} یادآوری هفتگی با موفقیت زمان‌بندی شد.` : 'تنظیمات ذخیره شد و یادآوری‌ها خاموش شدند.');
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطا در ذخیره یا زمان‌بندی اعلان‌ها.');
    } finally {
      setSaving(false);
    }
  };

  const alarmCount = scheduledAlarmCount({ ...settings, interval_minutes: Number(intervalText) || settings.interval_minutes });

  return (
    <ScreenShell title="تنظیمات" subtitle="زمان و ریتم سؤال‌ها را متناسب با روز خودت تنظیم کن.">
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Switch value={Boolean(settings.notification_enabled)} onValueChange={(v) => update({ notification_enabled: v ? 1 : 0 })} />
          <View style={styles.switchCopy}>
            <Text style={styles.label}>یادآوری دوره‌ای</Text>
            <Text style={styles.help}>اگر روشن باشد، Time80 در زمان‌های انتخاب‌شده سؤال می‌پرسد.</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>هر چند دقیقه؟</Text>
        <TextInput
          value={intervalText}
          onChangeText={setIntervalText}
          keyboardType="number-pad"
          style={styles.input}
          textAlign="center"
          maxLength={3}
        />
        <Text style={styles.help}>۱۵ تا ۲۴۰ دقیقه. مقدار پیشنهادی برای شروع: ۳۰ دقیقه.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>بازه فعال روزانه</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.miniLabel}>پایان</Text>
            <TextInput value={settings.day_end} onChangeText={(v) => update({ day_end: v })} style={styles.timeInput} textAlign="center" maxLength={5} />
          </View>
          <Text style={styles.arrow}>←</Text>
          <View style={styles.timeField}>
            <Text style={styles.miniLabel}>شروع</Text>
            <TextInput value={settings.day_start} onChangeText={(v) => update({ day_start: v })} style={styles.timeInput} textAlign="center" maxLength={5} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>روزهای فعال</Text>
        <View style={styles.dayGrid}>
          {DAYS.map((day) => {
            const selected = settings.active_days.includes(day.value);
            return (
              <Pressable key={day.value} onPress={() => toggleDay(day.value)} style={[styles.dayChip, selected && styles.dayChipSelected]}>
                <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Switch value={Boolean(settings.sound_enabled)} onValueChange={(v) => update({ sound_enabled: v ? 1 : 0 })} />
          <Text style={styles.label}>صدا</Text>
        </View>
        <View style={[styles.switchRow, styles.secondSwitch]}>
          <Switch value={Boolean(settings.vibration_enabled)} onValueChange={(v) => update({ vibration_enabled: v ? 1 : 0 })} />
          <Text style={styles.label}>لرزش</Text>
        </View>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewText}>تعداد اعلان‌های تکرارشونده در هفته: {settings.notification_enabled ? alarmCount : 0}</Text>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable disabled={saving} onPress={() => save().catch(console.error)} style={[styles.saveButton, saving && styles.disabled]}>
        <Text style={styles.saveText}>{saving ? 'در حال اعمال…' : 'ذخیره و اعمال یادآوری‌ها'}</Text>
      </Pressable>

      <Text style={styles.footnote}>در Android 12 به بعد، اعلان‌های دقیق ممکن است به مجوز «Alarms & reminders» سیستم نیاز داشته باشند. اگر اعلان‌ها دیر رسیدند، این مجوز و محدودیت باتری برنامه را در تنظیمات گوشی بررسی کن.</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: { textAlign: 'right', color: '#6C737D' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E0E4E9', padding: 16, marginBottom: 12 },
  label: { color: '#171A20', fontSize: 15, fontWeight: '800', textAlign: 'right' },
  help: { color: '#747B85', fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  switchCopy: { flex: 1 },
  secondSwitch: { marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0E3E7' },
  input: { marginTop: 12, minHeight: 50, borderRadius: 14, backgroundColor: '#F1F3F5', fontSize: 22, fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 14, marginTop: 12 },
  timeField: { flex: 1 },
  miniLabel: { color: '#777E88', fontSize: 11, textAlign: 'center', marginBottom: 5 },
  timeInput: { minHeight: 48, borderRadius: 14, backgroundColor: '#F1F3F5', fontSize: 18, fontWeight: '800' },
  arrow: { fontSize: 20, paddingBottom: 12, color: '#636A75' },
  dayGrid: { marginTop: 12, flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  dayChip: { minHeight: 42, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: '#D9DDE3', backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center' },
  dayChipSelected: { backgroundColor: '#171A20', borderColor: '#171A20' },
  dayText: { color: '#555D68', fontWeight: '700', fontSize: 12 },
  dayTextSelected: { color: '#FFFFFF' },
  preview: { paddingVertical: 8, marginBottom: 8 },
  previewText: { textAlign: 'right', color: '#606873', fontSize: 12 },
  message: { textAlign: 'right', color: '#354052', lineHeight: 21, backgroundColor: '#EDF0F3', padding: 12, borderRadius: 13, marginBottom: 12 },
  saveButton: { minHeight: 54, borderRadius: 17, backgroundColor: '#171A20', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  footnote: { marginTop: 14, color: '#7A818C', fontSize: 11, lineHeight: 18, textAlign: 'right' },
});
