import { ActivityIcon } from "./ActivityIcon";
import { theme } from "../theme/time80Theme";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { SlotView } from "../types/domain";
import { ui, InteractivePressable } from "./Ui";
export function SlotRow({
  item,
  onPress,
  displayTimezone,
}: {
  item: SlotView;
  displayTimezone?: string;
  onPress: () => void;
}) {
  const { fontScale } = useWindowDimensions();
  const future = +new Date(item.period_end) > Date.now();
  return (
    <InteractivePressable
      accessibilityRole="button"
      accessibilityLabel={`${new Date(item.period_start).toLocaleTimeString("fa-IR", { timeZone: displayTimezone, hour: "2-digit", minute: "2-digit" })} تا ${new Date(item.period_end).toLocaleTimeString("fa-IR", { timeZone: displayTimezone, hour: "2-digit", minute: "2-digit" })}، ${item.entry?.status === "logged" ? item.entry.activity_name : future ? "جاری / آینده" : item.slot?.state === "skipped" ? "رد شده" : "ثبت نشده — برای تکمیل لمس کن"}`}
      disabled={future}
      onPress={onPress}
      style={[
        ui.card,
        {
          minHeight: 64,
          backgroundColor: theme.background,
          borderRadius: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          paddingHorizontal: 0,
          flexDirection: fontScale >= 1.5 ? "column" : "row-reverse",
          gap: 12,
          alignItems: "center",
          paddingVertical: 12,
        },
      ]}
    >
      <Text style={[ui.small, { flexShrink: 1 }]}>
        {new Date(item.period_start).toLocaleTimeString("fa-IR", {
          timeZone: displayTimezone,
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        تا{" "}
        {new Date(item.period_end).toLocaleTimeString("fa-IR", {
          timeZone: displayTimezone,
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      {item.entry?.status === "logged" && (
        <ActivityIcon
          icon={item.entry.activity_icon_view}
          legacy={item.entry.activity_icon}
          size={30}
        />
      )}
      <Text style={[ui.text, { flex: 1, alignSelf: "stretch" }]}>
        {item.entry?.status === "logged"
          ? item.entry.activity_name
          : future
            ? "جاری / آینده"
            : item.slot?.state === "skipped"
              ? "رد شده"
              : "ثبت نشده — برای تکمیل لمس کن"}
      </Text>
    </InteractivePressable>
  );
}
