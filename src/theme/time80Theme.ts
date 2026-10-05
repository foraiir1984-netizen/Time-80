// Approved v0.3 visual tokens. Presentation only: never used for slot/report dates.
export const theme = {
  background: "#FAF7F0",
  surface: "#FFFDFA",
  text: "#302E2A",
  secondary: "#746E64",
  border: "#E7DFD3",
  accent: "#A7462E",
  onAccent: "#FFFDFA",
  danger: "#B42318",
  scrim: "#00000066",
  pressed: "#F3E2D5",
  disabled: "#E7DFD3",
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, page: 24, xl: 32 },
  touch: 48,
  primaryHeight: 56,
  primaryRadius: 28,
  frame: 52,
} as const;
export const iconTones = {
  peach: { background: "#F3E2D5", foreground: "#813F2D" },
  green: { background: "#E3EBD9", foreground: "#42553B" },
  blue: { background: "#DFE9EE", foreground: "#395667" },
  gold: { background: "#F2E8CC", foreground: "#6B552F" },
} as const;
export function iconTone(key: string) {
  if (key === "family" || key === "exercise") return iconTones.green;
  if (key === "work" || key === "commute") return iconTones.blue;
  if (key === "study") return iconTones.gold;
  return iconTones.peach;
}
export function activityColumns(width: number, fontScale: number) {
  return width - 2 * theme.spacing.page < 300 || fontScale >= 1.5 ? 1 : 2;
}
export const navigationColors = {
  primary: theme.accent,
  background: theme.background,
  card: theme.surface,
  text: theme.text,
  border: theme.border,
  notification: theme.accent,
};
export const tabVisualOptions = {
  headerShown: false,
  tabBarActiveTintColor: theme.accent,
  tabBarInactiveTintColor: theme.secondary,
  tabBarStyle: {
    backgroundColor: theme.surface,
    borderTopColor: theme.border,
    elevation: 0,
    minHeight: 80,
  },
  tabBarItemStyle: { minHeight: theme.touch, minWidth: theme.touch },
  tabBarLabelStyle: { fontSize: 12, lineHeight: 20 },
};
