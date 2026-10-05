import { AssetIcon } from "./ActivityIcon";
import type { IconKey } from "../icons/iconModel";
import React, { useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  ActivityIndicator,
  type PressableProps,
  type TextInputProps,
} from "react-native";
import { theme } from "../theme/time80Theme";
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  content: { padding: theme.spacing.page, paddingBottom: theme.spacing.xl },
  page: {
    flex: 1,
    backgroundColor: theme.background,
    padding: theme.spacing.page,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 12,
  },
  text: { textAlign: "right", fontSize: 15, color: theme.text, lineHeight: 25 },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: theme.text,
    textAlign: "right",
    marginBottom: 16,
  },
  muted: {
    textAlign: "right",
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 24,
  },
  error: {
    color: theme.danger,
    textAlign: "right",
    fontSize: 15,
    lineHeight: 25,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    minHeight: 56,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    textAlign: "right",
  },
  button: {
    minHeight: theme.primaryHeight,
    minWidth: theme.touch,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.primaryRadius,
    backgroundColor: theme.accent,
    marginVertical: 4,
  },
  buttonText: {
    color: theme.onAccent,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 25,
    fontWeight: "700",
  },
  small: {
    fontSize: 12,
    lineHeight: 20,
    color: theme.secondary,
    textAlign: "right",
  },
});
// Preserve native callbacks/refs while supplying visible keyboard focus.
export const InteractivePressable = React.forwardRef<View, PressableProps>(
  function InteractivePressable(
    { style, onFocus, onBlur, disabled, accessibilityState, ...props },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    return (
      <Pressable
        {...props}
        ref={ref}
        disabled={disabled}
        accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={(state) => [
          typeof style === "function" ? style(state) : style,
          state.pressed && !disabled && { opacity: 0.82 },
          focused && {
            outlineColor: theme.accent,
            outlineWidth: 3,
            outlineOffset: 3,
          },
          disabled && { opacity: 0.45 },
        ]}
      />
    );
  },
);
export function Button({
  title,
  onPress,
  disabled = false,
  focusRef,
  iconKey,
  variant = "primary",
  selected = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  focusRef?: React.Ref<View>;
  iconKey?: IconKey;
  variant?: "primary" | "secondary";
  selected?: boolean;
}) {
  const secondary = variant === "secondary";
  const color = secondary ? theme.accent : theme.onAccent;
  return (
    <InteractivePressable
      ref={focusRef}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      disabled={disabled}
      style={[
        ui.button,
        secondary && {
          backgroundColor: selected ? theme.pressed : theme.surface,
          borderWidth: 1,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {iconKey && <AssetIcon iconKey={iconKey} color={color} />}
        <Text style={[ui.buttonText, { color, flexShrink: 1 }]}>{title}</Text>
      </View>
    </InteractivePressable>
  );
}
export const Input = React.forwardRef<TextInput, TextInputProps>(function Input(
  { style, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={theme.secondary}
      {...props}
      ref={ref}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        ui.input,
        style,
        focused && {
          borderColor: theme.accent,
          outlineColor: theme.accent,
          outlineWidth: 3,
          outlineOffset: 3,
        },
      ]}
    />
  );
});
export function Loading({ label = "در حال بارگذاری" }: { label?: string }) {
  return <ActivityIndicator color={theme.accent} accessibilityLabel={label} />;
}
export function ErrorText({ error }: { error: string }) {
  return error ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={ui.error}
    >
      خطا: {error}
    </Text>
  ) : null;
}
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);
