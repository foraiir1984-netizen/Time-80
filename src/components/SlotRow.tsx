import React from "react";
import { Text, Pressable, View } from "react-native";
import type { SlotView } from "../types/domain";
import { ui } from "./Ui";
export function SlotRow({
  item,
  onPress,
}: {
  item: SlotView;
  onPress: () => void;
}) {
  const future = +new Date(item.period_end) > Date.now();
  return (
    <Pressable
      disabled={future}
      onPress={onPress}
      style={[ui.card, future && { opacity: 0.5 }]}
    >
      <Text style={ui.text}>
        {new Date(item.period_start).toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        تا{" "}
        {new Date(item.period_end).toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text style={ui.text}>
        {item.entry?.status === "logged"
          ? `${item.entry.activity_icon} ${item.entry.activity_name}`
          : future
            ? "جاری / آینده"
            : item.slot?.state === "skipped"
              ? "رد شده"
              : "ثبت نشده — برای تکمیل لمس کن"}
      </Text>
    </Pressable>
  );
}
