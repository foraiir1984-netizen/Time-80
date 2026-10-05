import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { Activity } from "../types/domain";
import {
  getActivityEditorSnapshot,
  saveActivity,
} from "../services/classificationService";
import { ClassificationPicker } from "./ClassificationPicker";
import { ActivityIcon, AssetIcon } from "./ActivityIcon";
import { ICON_SET, type IconCommand, type IconKey } from "../icons/iconModel";
import { theme } from "../theme/time80Theme";
import {
  ui,
  InteractivePressable,
  Button,
  ErrorText,
  errorMessage,
  Input,
  Loading,
} from "./Ui";
const icons =
  "📚 ✏️ 🧠 💻 💼 👨‍👩‍👦 ❤️ 🏃 🏋️ 🚶 🧘 😴 ☕ 🍽️ 🚗 🚌 🎮 🎬 🎵 📱 🌿 🛁 🧹 🛒 ☎️ 🩺 🎓 📝 🧑‍🤝‍🧑 🌙 ☀️ 💡 🎯 💰 📦 🛠️ ✨ 🐕 ⚽ 🎨 🧳 🏠".split(
    " ",
  );
const labels =
  "مطالعه کتاب|نوشتن|فکر ذهن|کامپیوتر|کار|خانواده|عشق|دویدن ورزش|باشگاه|پیاده روی|مدیتیشن|خواب|قهوه|غذا|ماشین رفت و آمد|اتوبوس|بازی|فیلم|موسیقی|موبایل|طبیعت|حمام|نظافت|خرید|تلفن|پزشک|درس|یادداشت|دوستان|شب|روز|ایده|هدف|پول|بسته|ابزار|متفرقه|حیوان|فوتبال|نقاشی|سفر|خانه".split(
    "|",
  );
// Activity concepts explicitly labeled in the supplied Visual Icon Spec. Action/navigation keys stay out of activity choices.
const activityAssets: [IconKey, string][] = [
  ["work", "کار"],
  ["study", "مطالعه"],
  ["family", "خانواده"],
  ["rest", "استراحت"],
  ["exercise", "ورزش"],
  ["commute", "رفت‌وآمد"],
];
export function ActivityEditor({
  activity,
  onClose,
  onSaved,
}: {
  activity: Activity | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(activity?.name ?? ""),
    [command, setCommand] = useState<IconCommand>({ kind: "keep" }),
    [snapshot, setSnapshot] = useState<Awaited<
      ReturnType<typeof getActivityEditorSnapshot>
    > | null>(null),
    [loaded, setLoaded] = useState(!activity),
    [code, setCode] = useState<string | null>(null),
    [revision, setRevision] = useState<number | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [picker, setPicker] = useState(false);
  const guard = useRef(false);
  async function load() {
    if (!activity) return;
    try {
      const s = await getActivityEditorSnapshot(activity.id);
      setSnapshot(s);
      setCode(s.category?.code ?? null);
      setRevision(s.category?.revision ?? null);
      setLoaded(true);
      setError("");
    } catch (e) {
      setLoaded(false);
      setError(errorMessage(e));
    }
  }
  useEffect(() => {
    void load();
  }, [activity?.id]);
  async function save() {
    if (guard.current || !loaded || !name.trim()) return;
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      await saveActivity(
        activity?.id ?? null,
        name,
        command,
        code,
        revision,
        snapshot?.icon,
      );
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  const preview =
    command.kind === "selectAsset"
      ? {
          kind: "asset" as const,
          key: command.key as IconKey,
          raw: snapshot?.activity.icon ?? "✨",
          unresolved: false as const,
        }
      : command.kind === "selectLegacy"
        ? { kind: "legacy" as const, raw: command.raw, unresolved: false }
        : snapshot?.iconView;
  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={() => !busy && onClose()}
    >
      <KeyboardAvoidingView
        style={ui.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.page,
            paddingTop: 48,
            paddingBottom: 60,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={ui.title}>
            {activity ? "ویرایش فعالیت" : "فعالیت جدید"}
          </Text>
          <ErrorText error={error} />
          {!loaded && (
            <>
              <Loading />
              <Button
                title="تلاش دوباره برای بارگذاری"
                onPress={() => void load()}
              />
            </>
          )}
          <Text style={ui.text}>نام فعالیت</Text>
          <Input
            accessibilityLabel="نام فعالیت"
            style={ui.input}
            value={name}
            onChangeText={setName}
            editable={!busy}
          />
          {!name.trim() && (
            <Text style={ui.muted}>نام فعالیت را وارد کنید.</Text>
          )}
          <Text style={ui.text}>آیکون</Text>
          <ActivityIcon icon={preview} legacy={activity?.icon ?? "✨"} />
          <Button
            title="انتخاب آیکون"
            disabled={!loaded || busy}
            onPress={() => setPicker(!picker)}
          />
          {picker && (
            <View>
              <Button
                title="نگه‌داشتن آیکون قبلی"
                onPress={() => setCommand({ kind: "keep" })}
              />
              <View style={ui.row}>
                {activityAssets.map(([key, label]) => (
                  <InteractivePressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`آیکون ${label}`}
                    accessibilityState={{
                      selected:
                        command.kind === "selectAsset" && command.key === key,
                    }}
                    onPress={() =>
                      setCommand({ kind: "selectAsset", set: ICON_SET, key })
                    }
                    style={{
                      minWidth: 64,
                      minHeight: 72,
                      padding: 6,
                      borderWidth:
                        command.kind === "selectAsset" && command.key === key
                          ? 2
                          : 0,
                      borderColor: theme.accent,
                      borderRadius: 16,
                    }}
                  >
                    <AssetIcon iconKey={key} size={32} frame />
                    <Text style={ui.small}>
                      {label}
                      {command.kind === "selectAsset" && command.key === key
                        ? " ✓"
                        : ""}
                    </Text>
                  </InteractivePressable>
                ))}
              </View>
              <Text style={ui.text}>آیکون‌های قبلی / آیکون دلخواه</Text>
              <Input
                style={ui.input}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="جست‌وجوی آیکون یا ورود آیکون دلخواه"
                placeholder="جست‌وجوی آیکون یا ورود آیکون دلخواه"
              />
              <Button
                title="استفاده از آیکون واردشده"
                disabled={!search.trim()}
                onPress={() =>
                  setCommand({ kind: "selectLegacy", raw: search })
                }
              />
              <View style={ui.row}>
                {icons
                  .filter(
                    (i, index) =>
                      !search ||
                      i.includes(search) ||
                      labels[index]?.includes(search),
                  )
                  .map((i) => (
                    <InteractivePressable
                      key={i}
                      accessibilityRole="button"
                      accessibilityLabel={`آیکون ${i}`}
                      onPress={() =>
                        setCommand({ kind: "selectLegacy", raw: i })
                      }
                      style={{ minWidth: 48, minHeight: 48, padding: 8 }}
                    >
                      <Text allowFontScaling={false} style={{ fontSize: 28 }}>{i}</Text>
                    </InteractivePressable>
                  ))}
              </View>
            </View>
          )}
          <Text style={ui.muted}>
            تغییر نام در گزارش‌های قبلی هم نمایش داده می‌شود. برای فعالیتی با
            معنای متفاوت، فعالیت تازه بسازید.
          </Text>
          <Text style={ui.muted}>
            آیکون جدید در گزارش‌های قبلی این فعالیت هم نمایش داده می‌شود.
          </Text>
          <Text style={ui.text}>دستهٔ پیش‌فرض برای ثبت‌های بعدی</Text>
          {loaded && <ClassificationPicker value={code} onChange={setCode} />}
          <Text style={ui.muted}>
            تغییر پیش‌فرض، دستهٔ ثبت‌های قبلی را عوض نمی‌کند.
          </Text>
          <Button
            title={busy ? "در حال ذخیره…" : "ذخیره"}
            disabled={busy || !loaded || !name.trim()}
            onPress={() => void save()}
          />
          <Button
            variant="secondary"
            title="انصراف"
            disabled={busy}
            onPress={onClose}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
