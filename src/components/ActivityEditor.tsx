import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import type { Activity } from "../types/domain";
import { createActivity, updateActivity } from "../db/database";
import {
  getActivityDefault,
  saveActivity,
} from "../services/classificationService";
import { ClassificationPicker } from "./ClassificationPicker";
import { ui, Button, ErrorText, errorMessage } from "./Ui";
const icons =
  "📚 ✏️ 🧠 💻 💼 👨‍👩‍👦 ❤️ 🏃 🏋️ 🚶 🧘 😴 ☕ 🍽️ 🚗 🚌 🎮 🎬 🎵 📱 🌿 🛁 🧹 🛒 ☎️ 🩺 🎓 📝 🧑‍🤝‍🧑 🌙 ☀️ 💡 🎯 💰 📦 🛠️ ✨ 🐕 ⚽ 🎨 🧳 🏠".split(
    " ",
  );
const labels =
  "مطالعه کتاب|نوشتن|فکر ذهن|کامپیوتر|کار|خانواده|عشق|دویدن ورزش|باشگاه|پیاده روی|مدیتیشن|خواب|قهوه|غذا|ماشین رفت و آمد|اتوبوس|بازی|فیلم|موسیقی|موبایل|طبیعت|حمام|نظافت|خرید|تلفن|پزشک|درس|یادداشت|دوستان|شب|روز|ایده|هدف|پول|بسته|ابزار|متفرقه|حیوان|فوتبال|نقاشی|سفر|خانه".split(
    "|",
  );
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
    [icon, setIcon] = useState(activity?.icon ?? "✨"),
    [code, setCode] = useState<string | null>(null),
    [revision, setRevision] = useState<number | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState("");
  useEffect(() => {
    if (activity)
      getActivityDefault(activity.id)
        .then((d) => {
          setCode(d?.code ?? null);
          setRevision(d?.revision ?? null);
        })
        .catch((e) => setError(errorMessage(e)));
  }, [activity]);
  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await saveActivity(activity?.id ?? null, name, icon, code, revision);
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 22,
            paddingTop: 50,
            paddingBottom: 60,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={ui.title}>
            {activity ? "ویرایش فعالیت" : "فعالیت جدید"}
          </Text>
          <TextInput
            style={ui.input}
            value={name}
            onChangeText={setName}
            placeholder="نام فعالیت"
            maxLength={40}
          />
          <Text style={ui.text}>آیکون انتخابی: {icon}</Text>
          <TextInput
            style={ui.input}
            value={search}
            onChangeText={setSearch}
            placeholder="آیکون دلخواه را وارد کن یا از پایین انتخاب کن"
          />
          <Button
            title="استفاده از آیکون واردشده"
            disabled={!search.trim()}
            onPress={() => setIcon(search.trim())}
          />
          <ScrollView
            style={{ maxHeight: 220 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <View style={ui.row}>
              {icons
                .filter(
                  (i, index) =>
                    !search ||
                    i.includes(search) ||
                    labels[index]?.includes(search),
                )
                .map((i) => (
                  <Pressable
                    key={i}
                    accessibilityLabel={`آیکون ${i}`}
                    onPress={() => setIcon(i)}
                    style={{
                      padding: 10,
                      backgroundColor: i === icon ? "#D0E9DF" : "#F4F5F6",
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{i}</Text>
                  </Pressable>
                ))}
            </View>
          </ScrollView>
          <Text style={ui.text}>دستهٔ پیش‌فرض برای ثبت‌های بعدی</Text>
          <ClassificationPicker value={code} onChange={setCode} />
          <Text style={ui.muted}>
            تغییر پیش‌فرض، دستهٔ ثبت‌های قبلی را عوض نمی‌کند.
          </Text>
          <ErrorText error={error} />
          <Button title="ذخیره" disabled={busy} onPress={save} />
          <Button title="انصراف" disabled={busy} onPress={onClose} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
