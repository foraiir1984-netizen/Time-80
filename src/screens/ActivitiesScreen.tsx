import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  useWindowDimensions,
  AccessibilityInfo,
  findNodeHandle,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getActivities } from "../db/database";
import {
  archiveActivity,
  undoActivityArchive,
  restoreActivity,
  type ArchiveUndo,
} from "../services/activityService";
import type { Activity } from "../types/domain";
import { activityColumns, theme } from "../theme/time80Theme";
import {
  ui,
  Button,
  ErrorText,
  errorMessage,
  InteractivePressable,
  Loading,
} from "../components/Ui";
import { ActivityEditor } from "../components/ActivityEditor";
import { ActivityIcon, AssetIcon } from "../components/ActivityIcon";
export function ActivitiesScreen() {
  const [items, setItems] = useState<Activity[]>([]),
    [edit, setEdit] = useState<Activity | null | undefined>(),
    [sheet, setSheet] = useState<Activity | null>(null),
    [archived, setArchived] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [undo, setUndo] = useState<ArchiveUndo | null>(null);
  const dimensions = useWindowDimensions(),
    columns = activityColumns(dimensions.width, dimensions.fontScale);
  const origins = useRef(new Map<number, any>()),
    origin = useRef<number | null>(null),
    addFocus = useRef<any>(null),
    title = useRef<any>(null),
    guard = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getActivities(true));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
      return () => setUndo(null);
    }, [load]),
  );
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(
      () => setUndo(null),
      Math.max(0, undo.deadline - performance.now()),
    );
    return () => clearTimeout(t);
  }, [undo]);
  function close() {
    setSheet(null);
    setTimeout(() => {
      const ref = origins.current.get(origin.current ?? -1) ?? addFocus.current;
      ref?.focus?.();
      const node = ref && findNodeHandle(ref);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, 180);
  }
  async function change(fn: () => Promise<unknown>, text: string) {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
      setMessage(text);
      close();
      await load();
    } catch (e) {
      setError(errorMessage(e));
      await load();
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <Text style={ui.title}>فعالیت‌ها</Text>
      <ErrorText error={error} />
      <View style={ui.row}>
        <Button
          focusRef={addFocus}
          iconKey="plus"
          title="افزودن فعالیت"
          onPress={() => setEdit(null)}
        />
        <Button
          variant="secondary"
          title={archived ? "فعال‌ها" : "بایگانی‌شده"}
          onPress={() => setArchived(!archived)}
        />
      </View>
      {loading ? (
        <Loading />
      ) : error ? null : (
        <FlatList
          key={columns}
          numColumns={columns}
          data={items.filter((a) => !!a.is_archived === archived)}
          keyExtractor={(a) => String(a.id)}
          columnWrapperStyle={
            columns === 2
              ? { flexDirection: "row-reverse", gap: 12 }
              : undefined
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View
              style={[
                ui.card,
                {
                  flex: 1,
                  maxWidth: columns === 2 ? "48%" : "100%",
                  minHeight: 128,
                  padding: 12,
                },
              ]}
            >
              <View style={{ flexDirection: "row-reverse" }}>
                <InteractivePressable
                  ref={(ref) => {
                    origins.current.set(item.id, ref);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`گزینه‌های مدیریت فعالیت ${item.name}`}
                  onPress={() => {
                    origin.current = item.id;
                    setSheet(item);
                  }}
                  style={{
                    minWidth: 48,
                    minHeight: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AssetIcon iconKey="more" />
                </InteractivePressable>
                <InteractivePressable
                  accessibilityRole="button"
                  accessibilityLabel={`مدیریت فعالیت ${item.name}${item.is_archived ? "، بایگانی‌شده" : ""}`}
                  onPress={() => {
                    origin.current = item.id;
                    setSheet(item);
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? theme.pressed : theme.surface,
                    borderRadius: 16,
                    flex: 1,
                    minHeight: 96,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <ActivityIcon icon={item.icon_view} legacy={item.icon} />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[ui.text, { textAlign: "center" }]}
                  >
                    {item.name}
                  </Text>
                  {!!item.is_archived && (
                    <Text style={ui.muted}>بایگانی‌شده</Text>
                  )}
                </InteractivePressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View>
              <Text style={ui.text}>
                {archived
                  ? "فعالیت بایگانی‌شده‌ای ندارید"
                  : "فعالیتی در فهرست فعال نیست"}
              </Text>
              <Button
                variant="secondary"
                title={archived ? "فعال‌ها" : "دیدن بایگانی‌شده‌ها"}
                onPress={() => setArchived(!archived)}
              />
              {!archived && (
                <Button
                  iconKey="plus"
                  title="افزودن فعالیت"
                  onPress={() => setEdit(null)}
                />
              )}
            </View>
          }
        />
      )}
      {!!error && <Button title="تلاش دوباره" onPress={() => void load()} />}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.text}>
          {message}
        </Text>
      )}
      {undo && (
        <Button
          title="واگرد"
          disabled={busy}
          onPress={() =>
            void change(async () => {
              await undoActivityArchive(undo);
              setUndo(null);
            }, "فعالیت بازگردانی شد")
          }
        />
      )}
      {sheet && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={close}
          onShow={() => {
            const n = title.current && findNodeHandle(title.current);
            if (n) AccessibilityInfo.setAccessibilityFocus(n);
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: theme.scrim,
            }}
          >
            <InteractivePressable
              accessibilityLabel="بستن گزینه‌های فعالیت"
              style={{ flex: 1 }}
              onPress={close}
            />
            <View
              accessibilityViewIsModal
              style={[
                ui.card,
                { marginBottom: 0, padding: 0, maxHeight: "85%" },
              ]}
            >
              <ScrollView contentContainerStyle={{ padding: 24 }}>
                <ActivityIcon icon={sheet.icon_view} legacy={sheet.icon} />
                <Text ref={title} accessibilityRole="header" style={ui.title}>
                  {sheet.name}
                </Text>
                {sheet.is_archived ? (
                  <Button
                    title="بازگردانی"
                    disabled={busy}
                    onPress={() =>
                      void change(async () => {
                        await restoreActivity(sheet);
                        setUndo(null);
                      }, `${sheet.name} بازگردانی شد`)
                    }
                  />
                ) : (
                  <>
                    <Button
                      iconKey="edit"
                      title="ویرایش فعالیت"
                      disabled={busy}
                      onPress={() => {
                        setEdit(sheet);
                        close();
                      }}
                    />
                    <Button
                      iconKey="archive"
                      variant="secondary"
                      title="بایگانی فعالیت"
                      disabled={busy}
                      onPress={() =>
                        void change(async () => {
                          setUndo(await archiveActivity(sheet));
                        }, `${sheet.name} بایگانی شد`)
                      }
                    />
                  </>
                )}
                <Button
                  variant="secondary"
                  title="بستن"
                  disabled={busy}
                  onPress={close}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
      {edit !== undefined && (
        <ActivityEditor
          activity={edit}
          onClose={() => setEdit(undefined)}
          onSaved={() => {
            setEdit(undefined);
            void load();
          }}
        />
      )}
    </View>
  );
}
