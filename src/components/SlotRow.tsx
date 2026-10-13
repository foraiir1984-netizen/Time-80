import { ActivityIcon } from "./ActivityIcon";
import { theme } from "../theme/time80Theme";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { SlotView } from "../types/domain";
import { ui, InteractivePressable, IdentifierBadge } from "./Ui";
import { uiIdentifiers } from "./uiIdentifiers";
import type { ReportTypography } from "../theme/reportTheme";
import { toPersianDuration } from "../utils/time";
export function SlotRow({
  item,
  onPress,
  displayTimezone,
  typography,
}: {
  item: SlotView;
  displayTimezone?: string;
  typography?: ReportTypography;
  onPress: () => void;
}) {
  const { fontScale } = useWindowDimensions();
  const future = +new Date(item.period_end) > Date.now();
  return (
    <InteractivePressable
      accessibilityRole="button"
      accessibilityLabel={`${new Date(item.period_start).toLocaleTimeString("fa-IR", { timeZone: displayTimezone, hour: "2-digit", minute: "2-digit" })} تا ${new Date(item.period_end).toLocaleTimeString("fa-IR", { timeZone: displayTimezone, hour: "2-digit", minute: "2-digit" })}، ${item.entry?.status === "logged" ? item.entry.activity_name : future ? "جاری / آینده" : item.slot?.state === "skipped" ? "رد شده" : "ثبت نشده — برای تکمیل لمس کن"}`}
      disabled={future}
      preserveCodeContrast
      onPress={onPress}
      style={[
        ui.card,
        {
          minHeight: 64,
          minWidth: 48,
          backgroundColor: typography ? theme.surface : theme.background,
          borderRadius: typography ? 16 : 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          paddingHorizontal: typography ? 16 : 0,
          flexDirection:
            typography || fontScale >= 1.5 ? "column" : "row-reverse",
          gap: 12,
          alignItems: typography ? "stretch" : "center",
          paddingVertical: 12,
        },
      ]}
    >
      {typography ? (
        <>
          <View
            style={{
              flexDirection: fontScale >= 1.5 ? "column" : "row-reverse",
              alignItems: fontScale >= 1.5 ? "stretch" : "center",
              gap: 12,
            }}
          >
            {item.entry?.status === "logged" && (
              <ActivityIcon
                icon={item.entry.activity_icon_view}
                legacy={item.entry.activity_icon}
                size={24}
                presentation={{ containerSize: 40, iconSize: 20 }}
              />
            )}
            <Text
              allowFontScaling
              style={[
                typography.body,
                { flex: fontScale < 1.5 ? 1 : undefined, minWidth: 0 },
              ]}
            >
              {item.entry?.status === "logged"
                ? item.entry.activity_name
                : future
                  ? "جاری / آینده"
                  : item.slot?.state === "skipped"
                    ? "رد شده"
                    : "ثبت نشده — برای تکمیل لمس کن"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row-reverse",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <Text allowFontScaling style={typography.caption}>
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
            <Text allowFontScaling style={typography.caption}>
              {toPersianDuration(
                (+new Date(item.period_end) - +new Date(item.period_start)) /
                  60000,
              )}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text allowFontScaling style={[ui.small, { flexShrink: 1 }]}>
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
          <Text
            allowFontScaling
            style={[
              ui.text,
              { ...(fontScale < 1.5 ? { flex: 1 } : {}), alignSelf: "stretch" },
            ]}
          >
            {item.entry?.status === "logged"
              ? item.entry.activity_name
              : future
                ? "جاری / آینده"
                : item.slot?.state === "skipped"
                  ? "رد شده"
                  : "ثبت نشده — برای تکمیل لمس کن"}
          </Text>
        </>
      )}
      <IdentifierBadge
        code={uiIdentifiers.openSelectedSlot.code}
        textStyle={typography?.code}
      />
    </InteractivePressable>
  );
}
