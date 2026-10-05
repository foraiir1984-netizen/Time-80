import { ActivityIcon } from "./ActivityIcon";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { Activity } from "../types/models";
import { ui } from "./Ui";
export function ActivityGrid({
  activities,
  onSelect,
  header,
  disabled = false,
  showEmpty = true,
}: {
  activities: Activity[];
  onSelect: (a: Activity) => void;
  header?: React.ReactElement;
  disabled?: boolean;
  showEmpty?: boolean;
}) {
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 35 }}
      data={activities}
      keyExtractor={(a) => String(a.id)}
      numColumns={3}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <Pressable
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() => onSelect(item)}
          style={[
            ui.card,
            {
              flex: 1,
              maxWidth: "32%",
              margin: 2,
              minHeight: 96,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ActivityIcon icon={item.icon_view} legacy={item.icon} />
          <Text style={[ui.text, { fontSize: 12, textAlign: "center" }]}>
            {item.name}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        showEmpty && !activities.length ? (
          <Text style={ui.muted}>
            فعالیتی وجود ندارد؛ از صفحهٔ فعالیت‌ها اضافه کن.
          </Text>
        ) : null
      }
    />
  );
}
