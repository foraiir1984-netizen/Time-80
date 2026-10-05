import React from "react";
import { Image, Text, View } from "react-native";
import { ICON_ASSETS, ICON_COLORS } from "../icons/iconAssets";
import type { IconKey, IconView } from "../icons/iconModel";
export function AssetIcon({
  iconKey,
  size = 24,
  frame = false,
  color,
}: {
  iconKey: IconKey;
  size?: 24 | 30 | 32;
  frame?: boolean;
  color?: string;
}) {
  const image = (
    <Image
      accessible={false}
      source={ICON_ASSETS[iconKey][size]}
      style={{
        width: size,
        height: size,
        tintColor: color ?? ICON_COLORS[iconKey].foreground,
      }}
    />
  );
  return frame ? (
    <View
      accessible={false}
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ICON_COLORS[iconKey].background,
      }}
    >
      {image}
    </View>
  ) : (
    image
  );
}
export function ActivityIcon({
  icon,
  legacy = "",
  size = 32,
}: {
  icon?: IconView;
  legacy?: string;
  size?: 24 | 30 | 32;
}) {
  return icon?.kind === "asset" ? (
    <AssetIcon iconKey={icon.key} size={size} frame />
  ) : (
    <Text accessible={false} style={{ fontSize: size, textAlign: "center" }}>
      {icon?.raw ?? legacy}
    </Text>
  );
}
