import { ActivityIcon } from "./ActivityIcon";
import React from "react";
import { FlatList, Text, useWindowDimensions } from "react-native";
import type { Activity } from "../types/models";
import { activityColumns, theme } from "../theme/time80Theme";
import { ui, InteractivePressable } from "./Ui";
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
  const { width, fontScale } = useWindowDimensions();
  const columns = activityColumns(width, fontScale);
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 35 }}
      data={activities}
      keyExtractor={(a) => String(a.id)}
      key={columns}
      numColumns={columns}
      columnWrapperStyle={
        columns === 2 ? { flexDirection: "row-reverse", gap: 12 } : undefined
      }
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <InteractivePressable
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() => onSelect(item)}
          style={({ pressed }) => [
            ui.card,
            pressed && { backgroundColor: theme.pressed },
            {
              flex: 1,
              maxWidth: columns === 2 ? "48%" : "100%",
              minHeight: 128,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ActivityIcon icon={item.icon_view} legacy={item.icon} />
          <Text style={[ui.text, { textAlign: "center", marginTop: 8 }]}>
            {item.name}
          </Text>
        </InteractivePressable>
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
