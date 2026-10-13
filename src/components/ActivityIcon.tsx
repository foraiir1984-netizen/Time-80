import { iconTone, theme } from "../theme/time80Theme";
import React from "react";
import { Image, Text, View } from "react-native";
import { ICON_ASSETS } from "../icons/iconAssets";
import type { IconKey, IconView } from "../icons/iconModel";
// Presentation is independent of the existing raster registry's logical size.
type IconPresentation = { containerSize: number; iconSize: number };
export function AssetIcon({
  iconKey,
  size = 24,
  frame = false,
  color,
  presentation,
}: {
  iconKey: IconKey;
  size?: 24 | 30 | 32;
  frame?: boolean;
  color?: string;
  presentation?: IconPresentation;
}) {
  const image = (
    <Image
      accessible={false}
      source={ICON_ASSETS[iconKey][size]}
      style={{
        width: presentation?.iconSize ?? size,
        height: presentation?.iconSize ?? size,
        tintColor: color ?? iconTone(iconKey).foreground,
      }}
    />
  );
  return frame ? (
    <View
      accessible={false}
      style={{
        width: presentation?.containerSize ?? 52,
        height: presentation?.containerSize ?? 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: iconTone(iconKey).background,
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
  presentation,
}: {
  icon?: IconView;
  legacy?: string;
  size?: 24 | 30 | 32;
  presentation?: IconPresentation;
}) {
  return icon?.kind === "asset" ? (
    <AssetIcon
      iconKey={icon.key}
      size={size}
      frame
      presentation={presentation}
    />
  ) : (
    <View
      accessible={false}
      style={{
        width: presentation?.containerSize ?? theme.frame,
        // Arbitrary legacy text must wrap and grow, including with font scaling.
        minHeight: presentation?.containerSize ?? theme.frame,
        borderRadius: 16,
        backgroundColor: theme.pressed,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        accessible={false}
        allowFontScaling
        style={{
          fontSize: presentation?.iconSize ?? size,
          textAlign: "center",
          ...(presentation ? { width: "100%" as const } : {}),
        }}
      >
        {icon?.raw ?? legacy}
      </Text>
    </View>
  );
}
