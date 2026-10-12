import { uiIdentifiers } from "../components/uiIdentifiers";
import { IdentifierTitle, IdentifierBadge } from "../components/Ui";
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
    columns = activityColumns(dimensions.width, dimensions.fontScale),
    closeRegionHeight = Math.max(48, Math.ceil(32 * dimensions.fontScale + 32));
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
      <IdentifierTitle title="فعالیت‌ها" code={uiIdentifiers.activities.code} />
      <ErrorText error={error} />
      <View style={ui.row}>
        <Button
          focusRef={addFocus}
          iconKey="plus"
          title="افزودن فعالیت"
          actionCode={uiIdentifiers.createActivity.code}
          onPress={() => setEdit(null)}
        />
        <Button
          variant="secondary"
          title={archived ? "فعال‌ها" : "بایگانی‌شده"}
          actionCode={
            archived
              ? uiIdentifiers.showActiveActivities.code
              : uiIdentifiers.showArchivedActivities.code
          }
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
                  preserveCodeContrast
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
                  <IdentifierBadge
                    code={uiIdentifiers.openActivityManagement.code}
                  />
                </InteractivePressable>
                <InteractivePressable
                  accessibilityRole="button"
                  accessibilityLabel={`مدیریت فعالیت ${item.name}${item.is_archived ? "، بایگانی‌شده" : ""}`}
                  preserveCodeContrast
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
                  <Text style={[ui.text, { textAlign: "center" }]}>
                    {item.name}
                  </Text>
                  <IdentifierBadge
                    code={uiIdentifiers.openActivityManagement.code}
                  />
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
                actionCode={
                  archived
                    ? uiIdentifiers.showActiveActivities.code
                    : uiIdentifiers.showArchivedActivities.code
                }
                onPress={() => setArchived(!archived)}
              />
              {!archived && (
                <Button
                  iconKey="plus"
                  title="افزودن فعالیت"
                  actionCode={uiIdentifiers.createActivity.code}
                  onPress={() => setEdit(null)}
                />
              )}
            </View>
          }
        />
      )}
      {!!error && (
        <Button
          title="تلاش دوباره"
          actionCode={uiIdentifiers.retryActivitiesRead.code}
          onPress={() => void load()}
        />
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.text}>
          {message}
        </Text>
      )}
      {undo && (
        <Button
          title="واگرد"
          actionCode={uiIdentifiers.undoActivityArchive.code}
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
              preserveCodeContrast
              style={{
                flex: 1,
                minHeight: closeRegionHeight,
                minWidth: 48,
                justifyContent: "flex-end",
                alignItems: "center",
                padding: 8,
              }}
              onPress={close}
            >
              <View
                style={[
                  ui.row,
                  {
                    backgroundColor: theme.surface,
                    padding: 8,
                    borderRadius: 16,
                  },
                ]}
              >
                <Text style={ui.text}>بستن</Text>
                <IdentifierBadge
                  code={uiIdentifiers.closeSelectionDialog.code}
                />
              </View>
            </InteractivePressable>
            <View
              accessibilityViewIsModal
              style={[
                ui.card,
                {
                  marginBottom: 0,
                  padding: 0,
                  maxHeight: Math.min(
                    dimensions.height * 0.85,
                    Math.max(0, dimensions.height - closeRegionHeight),
                  ),
                },
              ]}
            >
              <ScrollView contentContainerStyle={{ padding: 24 }}>
                <ActivityIcon icon={sheet.icon_view} legacy={sheet.icon} />
                <IdentifierTitle
                  title={sheet.name}
                  code={uiIdentifiers.activityManagementDialog.code}
                  titleRef={title}
                />
                {sheet.is_archived ? (
                  <Button
                    title="بازگردانی"
                    actionCode={uiIdentifiers.restoreArchivedActivity.code}
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
                      actionCode={uiIdentifiers.editActivity.code}
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
                      actionCode={uiIdentifiers.archiveActivity.code}
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
                  actionCode={uiIdentifiers.closeSelectionDialog.code}
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
