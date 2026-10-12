import type { TextStyle } from "react-native";
import { theme, iconTones } from "./time80Theme";

// M-01/M-04 only. Dimensions/weights from normalization v1.0, colors from
// existing warm palette + semantic warm green, never sampled from a mockup.
export const reportTheme = {
  pagePadding: 16,
  cardPadding: 16,
  largeCardPadding: 20,
  cardGap: 12,
  sectionGap: 24,
  radius: { input: 12, card: 16, sheet: 24, chip: 999 },
  active: iconTones.green.foreground,
  activeSurface: iconTones.green.background,
  onActive: theme.surface,
  series: [iconTones.green.foreground, theme.accent, iconTones.blue.foreground],
  other: theme.secondary,
  track: theme.border,
} as const;
export const REPORT_SUMMARY_LIMIT = 3; // Approved scope permits 3–5; PNG shows 3.
export const reportFonts = {
  Regular: require("../../assets/fonts/vazirmatn/Vazirmatn-Regular.ttf"),
  Medium: require("../../assets/fonts/vazirmatn/Vazirmatn-Medium.ttf"),
  SemiBold: require("../../assets/fonts/vazirmatn/Vazirmatn-SemiBold.ttf"),
  Bold: require("../../assets/fonts/vazirmatn/Vazirmatn-Bold.ttf"),
};
export const reportFontSources = {
  Time80ReportRegular: reportFonts.Regular,
  Time80ReportMedium: reportFonts.Medium,
  Time80ReportSemiBold: reportFonts.SemiBold,
  Time80ReportBold: reportFonts.Bold,
};
export function reportTypography(ready: boolean) {
  const type = (
    size: number,
    line: number,
    face: keyof typeof reportFonts,
    fallback: TextStyle["fontWeight"],
  ): TextStyle => ({
    fontFamily: ready ? `Time80Report${face}` : undefined,
    fontWeight: ready ? "400" : fallback,
    fontSize: size,
    lineHeight: line,
    color: theme.text,
    textAlign: "right",
    writingDirection: "rtl",
    fontVariant: ["tabular-nums"],
  });
  return {
    pageTitle: type(26, 36, "Bold", "700"),
    sectionTitle: type(20, 30, "Bold", "700"),
    metric: type(32, 40, "Bold", "700"),
    cardTitle: type(16, 24, "SemiBold", "600"),
    body: type(15, 24, "Regular", "400"),
    secondary: { ...type(14, 22, "Regular", "400"), color: theme.secondary },
    control: type(14, 22, "Medium", "500"),
    caption: { ...type(13, 20, "Regular", "400"), color: theme.secondary },
    code: {
      fontFamily: ready ? "Time80ReportMedium" : undefined,
      fontVariant: ["tabular-nums"],
    } satisfies TextStyle,
  };
}
export type ReportTypography = ReturnType<typeof reportTypography>;
