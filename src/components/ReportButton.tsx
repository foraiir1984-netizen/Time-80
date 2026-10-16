import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, { Rect, Line, Circle, Path } from "react-native-svg";
import { Button } from "./Ui";
import { reportTheme, type ReportTypography } from "../theme/reportTheme";
import { theme } from "../theme/time80Theme";

type Glyph = "calendar" | "bars" | "more" | "edit";
function ReportGlyph({ glyph, color }: { glyph: Glyph; color: string }) {
  return (
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
      {glyph === "calendar" && (
        <>
          <Rect x={4} y={5} width={16} height={16} rx={2} />
          <Line x1={4} y1={10} x2={20} y2={10} />
          <Line x1={8} y1={3} x2={8} y2={7} />
          <Line x1={16} y1={3} x2={16} y2={7} />
        </>
      )}
      {glyph === "bars" && (
        <>
          <Line x1={6} y1={13} x2={6} y2={21} />
          <Line x1={12} y1={3} x2={12} y2={21} />
          <Line x1={18} y1={8} x2={18} y2={21} />
        </>
      )}
      {glyph === "more" && (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Circle cx={8} cy={12} r={0.7} />
          <Circle cx={12} cy={12} r={0.7} />
          <Circle cx={16} cy={12} r={0.7} />
        </>
      )}
      {glyph === "edit" && <Path d="M4 20l4-1 12-12-3-3L5 16zM14 7l3 3" />}
    </Svg>
  );
}
export function ReportButton({
  typography,
  preset = false,
  glyph,
  ...props
}: React.ComponentProps<typeof Button> & {
  typography: ReportTypography;
  preset?: boolean;
  glyph?: Glyph;
}) {
  const { fontScale } = useWindowDimensions();
  const presetWidth = fontScale < 1.5 ? 48 : Math.ceil(60 * fontScale);
  const primary = props.variant === "primary";
  const selected = !!props.selected,
    color = primary || selected ? reportTheme.onActive : reportTheme.active;
  return (
    <Button
      {...props}
      variant={props.variant ?? "secondary"}
      color={color}
      textStyle={[typography.control, { color, textAlign: "center" }]}
      codeTextStyle={[typography.code, props.codeTextStyle]}
      icon={glyph && <ReportGlyph glyph={glyph} color={color} />}
      contentStyle={
        preset
          ? {
              flexDirection: "column",
              flexWrap: "nowrap",
              alignItems: "stretch",
              gap: 4,
            }
          : props.contentStyle
      }
      style={[
        {
          minHeight: 48,
          minWidth: 48,
          maxWidth: "100%",
          borderRadius: 16,
          marginVertical: 0,
          backgroundColor: primary
            ? theme.accent
            : selected
              ? reportTheme.active
              : theme.surface,
          borderColor: primary
            ? theme.accent
            : selected
              ? reportTheme.active
              : theme.border,
          paddingVertical: 8,
        },
        preset && {
          flexBasis: fontScale < 1.5 ? 0 : presetWidth,
          minWidth: presetWidth,
          flexGrow: 1,
          minHeight: 96,
          paddingHorizontal: 4,
        },
        props.style,
      ]}
    />
  );
}
