import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Rect, Path, Line } from "react-native-svg";
import { reportTheme, type ReportTypography } from "../theme/reportTheme";
import { theme } from "../theme/time80Theme";

// Original vector illustration, CC0-1.0; no activity or recording input.
export function DayCandle({
  progress,
  size = 144,
}: {
  progress: number | null;
  size?: number;
}) {
  const height = progress === null ? 78 : 24 + 108 * (1 - progress);
  const top = 166 - height;
  return (
    <Svg
      testID="day-candle"
      width={size}
      height={(size * 200) / 144}
      viewBox="0 -12 160 212"
      accessible={false}
      pointerEvents="none"
    >
      <Path
        d="M25 175Q10 146 28 131Q50 144 53 174M105 175Q109 136 137 127Q140 157 105 175"
        fill={reportTheme.activeSurface}
      />
      <Path
        d="M31 174L28 143M110 174L132 139"
        fill="none"
        stroke={reportTheme.active}
        strokeWidth={2}
      />
      <Rect x={18} y={166} width={124} height={14} rx={7} fill="#B58B61" />
      <Rect
        testID="candle-wax"
        x={46}
        y={top}
        width={68}
        height={height}
        rx={12}
        fill={progress === null ? theme.border : "#F2D7A1"}
      />
      <Path
        d={`M46 ${top + 12}Q80 ${top - 1} 114 ${top + 12}Q80 ${top + 25} 46 ${top + 12}`}
        fill="#FBEAC6"
      />
      <Line
        x1={80}
        y1={top + 10}
        x2={80}
        y2={top - 2}
        stroke="#775536"
        strokeWidth={3}
      />
      {progress !== null && progress < 1 && (
        <>
          <Path
            d={`M80 ${top - 42}Q59 ${top - 9} 80 ${top - 3}Q99 ${top - 10} 80 ${top - 42}`}
            fill="#EDAE4B"
          />
          <Path
            d={`M80 ${top - 30}Q69 ${top - 9} 80 ${top - 4}Q90 ${top - 9} 80 ${top - 30}`}
            fill="#FFF0C8"
          />
        </>
      )}
    </Svg>
  );
}
export function DayPassage({
  progress,
  typography,
}: {
  progress: number | null;
  typography: ReportTypography;
}) {
  const { width, fontScale } = useWindowDimensions();
  const compact = fontScale < 1.5 && width >= 360;
  const diameter = compact
    ? 160
    : Math.min(width - 64, 160 * Math.max(1, fontScale));
  const percent = progress === null ? null : Math.round(progress * 100);
  const circumference = 2 * Math.PI * 70;
  return (
    <View
      testID="day-passage"
      style={{
        flexDirection: compact ? "row" : "column",
        direction: "ltr",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginVertical: 8,
        backgroundColor: theme.background,
      }}
    >
      <DayCandle progress={progress} size={compact ? 112 : 144} />
      <View
        accessible
        accessibilityRole={percent === null ? "text" : "progressbar"}
        accessibilityLabel="گذر روز تنظیم‌شده؛ نمایش زمان"
        accessibilityValue={
          percent === null ? undefined : { min: 0, max: 100, now: percent }
        }
        style={{
          alignItems: "center",
          flex: compact ? 1 : undefined,
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <View
          style={{
            width: diameter,
            maxWidth: "100%",
            minHeight: diameter,
            justifyContent: "center",
            paddingHorizontal: diameter * 0.18,
            paddingVertical: diameter * 0.18,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Svg
              testID="day-passage-donut"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 160 160"
              pointerEvents="none"
              accessible={false}
            >
              <Circle
                cx={80}
                cy={80}
                r={70}
                stroke={reportTheme.track}
                strokeWidth={12}
                fill="none"
              />
              {progress !== null && progress > 0 && (
                <Circle
                  testID="day-passage-segment"
                  cx={80}
                  cy={80}
                  r={70}
                  stroke={reportTheme.active}
                  strokeWidth={12}
                  fill="none"
                  strokeDasharray={[
                    progress * circumference,
                    (1 - progress) * circumference,
                  ]}
                  rotation={-90}
                  origin="80,80"
                />
              )}
            </Svg>
          </View>
          {percent !== null && (
            <Text
              allowFontScaling
              style={[
                typography.metric,
                {
                  textAlign: "center",
                  writingDirection: "ltr",
                },
              ]}
            >
              {percent.toLocaleString("fa-IR")}٪
            </Text>
          )}
          <Text
            allowFontScaling
            style={[
              typography.secondary,
              { textAlign: "center", marginTop: 8 },
            ]}
          >
            {percent === null ? "درصد روز در دسترس نیست" : "گذر روز تنظیم‌شده"}
          </Text>
        </View>
      </View>
    </View>
  );
}
