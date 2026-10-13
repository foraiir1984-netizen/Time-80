import React from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { AssetIcon } from "./ActivityIcon";
import { iconTones } from "../theme/time80Theme";

type Glyph =
  | "bell"
  | "clock"
  | "start"
  | "end"
  | "calendar"
  | "sound"
  | "vibration"
  | "settings";
// Fixed decorative M-02 glyphs, not activity identities or new asset keys.
export function SettingsGlyph({ kind }: { kind: Glyph }) {
  const color = iconTones.green.foreground;
  if (kind === "settings")
    return (
      <AssetIcon
        iconKey="settings"
        size={24}
        frame
        color={color}
        presentation={{ containerSize: 40, iconSize: 20 }}
      />
    );
  return (
    <View
      accessible={false}
      pointerEvents="none"
      style={{
        width: 40,
        height: 40,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: iconTones.peach.background,
      }}
    >
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        accessible={false}
        pointerEvents="none"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      >
        {kind === "bell" && (
          <>
            <Path d="M5 18h14l-2-3V9a5 5 0 0 0-10 0v6z" />
            <Path d="M10 21h4" />
          </>
        )}
        {kind === "clock" && (
          <>
            <Circle cx={12} cy={12} r={9} />
            <Path d="M12 6v6l4 2" />
          </>
        )}
        {(kind === "start" || kind === "end") && (
          <>
            <Path d="M6 16a6 6 0 0 1 12 0M3 19h18M12 2v3M3 7l2 2M21 7l-2 2" />
            <Path d={kind === "start" ? "M9 8l3-3 3 3" : "M9 5l3 3 3-3"} />
          </>
        )}
        {kind === "calendar" && (
          <>
            <Rect x={4} y={5} width={16} height={16} rx={2} />
            <Line x1={4} y1={10} x2={20} y2={10} />
            <Path d="M8 3v4M16 3v4" />
          </>
        )}
        {kind === "sound" && (
          <>
            <Path d="M3 9h4l5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14" />
          </>
        )}
        {kind === "vibration" && (
          <>
            <Rect x={8} y={3} width={8} height={18} rx={2} />
            <Path d="M4 5v14M20 5v14M11 18h2" />
          </>
        )}
      </Svg>
    </View>
  );
}
