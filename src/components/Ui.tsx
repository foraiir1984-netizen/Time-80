import { AssetIcon } from "./ActivityIcon";
import type { IconKey } from "../icons/iconModel";
import React, { useState, useRef, useImperativeHandle } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  ActivityIndicator,
  Switch,
  Alert,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type PressableProps,
  type TextInputProps,
  type TextProps,
  type SwitchProps,
  type AlertButton,
  type AlertOptions,
} from "react-native";
import { theme } from "../theme/time80Theme";
import type { UiActionCode, UiIdentifierCode } from "./uiIdentifiers";
import { uiIdentifiers, type UiDialogCode } from "./uiIdentifiers";
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
type UiPressableProps = PressableProps & {
  preserveCodeContrast?: boolean;
};
export const InteractivePressable = React.forwardRef<View, UiPressableProps>(
  function InteractivePressable(
    {
      style,
      onFocus,
      onBlur,
      disabled,
      accessibilityState,
      preserveCodeContrast = false,
      ...props
    },
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
          state.pressed &&
            !disabled &&
            !preserveCodeContrast && { opacity: 0.82 },
          state.pressed &&
            !disabled &&
            preserveCodeContrast && {
              outlineColor: theme.text,
              outlineWidth: 1,
              outlineOffset: -1,
            },
          focused && {
            outlineColor: theme.accent,
            outlineWidth: 3,
            outlineOffset: 3,
          },
          disabled && !preserveCodeContrast && { opacity: 0.45 },
        ]}
      />
    );
  },
);
// A non-interactive text node, always visible and independently LTR in RTL UI.
export function IdentifierBadge({
  code,
  color = theme.text,
  textStyle,
}: {
  code: UiIdentifierCode;
  color?: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  const badgeStyle: TextStyle = {
    color,
    fontSize: 14,
    lineHeight: 24,
    writingDirection: "ltr",
    textAlign: "center",
    flexShrink: 1,
  };
  return (
    <Text
      allowFontScaling
      style={textStyle ? [badgeStyle, textStyle] : badgeStyle}
    >
      {code}
    </Text>
  );
}
export function IdentifierTitle({
  title,
  code,
  titleRef,
  textProps,
  codeTextStyle,
}: {
  title: string;
  code: UiIdentifierCode;
  titleRef?: React.Ref<Text>;
  textProps?: TextProps;
  codeTextStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[ui.row, { marginBottom: 16 }]}>
      <Text
        accessibilityRole="header"
        {...textProps}
        ref={titleRef}
        style={[ui.title, { marginBottom: 0, flexShrink: 1 }, textProps?.style]}
      >
        {title}
      </Text>
      <IdentifierBadge code={code} textStyle={codeTextStyle} />
    </View>
  );
}

// Native Alert callbacks/cancel styles/options pass through unchanged. Unicode
// isolates keep ASCII codes LTR; native font/target sizes require device QA.
export function identifierAlert(
  code: UiDialogCode,
  title: string,
  message: string,
  buttons: readonly (AlertButton & { actionCode: UiActionCode })[],
  options?: AlertOptions,
) {
  const label = (text: string, id: UiIdentifierCode) =>
    `${text} [\u2066${id}\u2069]`;
  Alert.alert(
    label(title, code),
    message,
    buttons.map(({ actionCode, ...button }) => ({
      ...button,
      text: label(button.text ?? "", actionCode),
    })),
    options,
  );
}

export function CodedSwitch({
  actionCode,
  accessibilityLabel,
  onValueChange,
  disabled,
  value,
  containerStyle,
  labelStyle,
  codeTextStyle,
  labelIcon,
  ...props
}: SwitchProps & {
  actionCode: UiActionCode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  codeTextStyle?: StyleProp<TextStyle>;
  labelIcon?: React.ReactNode;
}) {
  const base = [ui.row, { minWidth: 48, minHeight: 48, padding: 8 }];
  const labelBase = [ui.text, { flexShrink: 1 }];
  return (
    <InteractivePressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: !!value }}
      disabled={disabled}
      preserveCodeContrast
      onPress={() => onValueChange?.(!value)}
      style={containerStyle ? [...base, containerStyle] : base}
    >
      {labelIcon}
      <Text
        allowFontScaling
        style={labelStyle ? [...labelBase, labelStyle] : labelBase}
      >
        {accessibilityLabel}
      </Text>
      <IdentifierBadge code={actionCode} textStyle={codeTextStyle} />
      <Switch
        {...props}
        accessible={false}
        pointerEvents="none"
        value={value}
        disabled={disabled}
      />
    </InteractivePressable>
  );
}

// The existing stack back action; no fallback destination or extra route.
export function IdentifierHeader({
  title,
  pageCode,
  canGoBack,
  onBack,
}: {
  title: string;
  pageCode: UiIdentifierCode;
  canGoBack: boolean;
  onBack: () => void;
}) {
  return (
    <View
      style={[
        ui.row,
        { backgroundColor: theme.surface, padding: 8, minHeight: 56 },
      ]}
    >
      {canGoBack && (
        <Button
          title="بازگشت"
          variant="secondary"
          actionCode={uiIdentifiers.navigateBack.code}
          onPress={onBack}
        />
      )}
      <View style={{ flex: 1, minWidth: 48 }}>
        <IdentifierTitle title={title} code={pageCode} />
      </View>
    </View>
  );
}

export function IdentifierTabLabel({
  label,
  code,
  color,
  onLayout,
}: {
  label: string;
  code: UiActionCode;
  color: string;
  onLayout?: TextProps["onLayout"];
}) {
  return (
    <View
      onLayout={onLayout}
      style={{ alignItems: "center", maxWidth: "100%", flexShrink: 0 }}
    >
      <Text
        allowFontScaling
        style={{ fontSize: 14, lineHeight: 24, color, textAlign: "center" }}
      >
        {label}
      </Text>
      <IdentifierBadge code={code} color={color} />
    </View>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  focusRef,
  iconKey,
  actionCode,
  variant = "primary",
  selected = false,
  style,
  textStyle,
  codeTextStyle,
  contentStyle,
  color: contentColor,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  focusRef?: React.Ref<View>;
  iconKey?: IconKey;
  actionCode?: UiActionCode;
  variant?: "primary" | "secondary";
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  codeTextStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  color?: string;
  icon?: React.ReactNode;
}) {
  const secondary = variant === "secondary";
  const color = contentColor ?? (secondary ? theme.accent : theme.onAccent);
  const contentBase = {
    flexDirection: "row-reverse" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    ...(actionCode ? { flexWrap: "wrap" as const } : {}),
  };
  return (
    <InteractivePressable
      ref={focusRef}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      disabled={disabled}
      preserveCodeContrast={!!actionCode}
      style={[
        ui.button,
        secondary && {
          backgroundColor: selected ? theme.pressed : theme.surface,
          borderWidth: 1,
          borderColor: selected ? theme.accent : theme.border,
        },
        actionCode &&
          disabled && {
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: color,
          },
        style,
      ]}
    >
      <View style={contentStyle ? [contentBase, contentStyle] : contentBase}>
        {icon}
        {iconKey && <AssetIcon iconKey={iconKey} color={color} />}
        <Text
          allowFontScaling
          style={[ui.buttonText, { color, flexShrink: 1 }, textStyle]}
        >
          {title}
        </Text>
        {actionCode && (
          <IdentifierBadge
            code={actionCode}
            color={color}
            textStyle={codeTextStyle}
          />
        )}
      </View>
    </InteractivePressable>
  );
}
export const Input = React.forwardRef<
  TextInput,
  TextInputProps & {
    actionCode?: UiActionCode;
    labelStyle?: StyleProp<TextStyle>;
    codeTextStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    labelContainerStyle?: StyleProp<ViewStyle>;
    labelIcon?: React.ReactNode;
  }
>(function Input(
  {
    style,
    onFocus,
    onBlur,
    actionCode,
    labelStyle,
    codeTextStyle,
    containerStyle,
    labelContainerStyle,
    labelIcon,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const native = useRef<TextInput>(null);
  useImperativeHandle(actionCode ? ref : null, () => native.current!, [
    !!actionCode,
  ]);
  const field = (
    <TextInput
      placeholderTextColor={theme.secondary}
      {...props}
      ref={actionCode ? native : ref}
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
  return actionCode ? (
    <InteractivePressable
      accessible={false}
      preserveCodeContrast
      disabled={props.editable === false}
      onPress={() => native.current?.focus()}
      style={
        containerStyle
          ? [{ minWidth: 48, minHeight: 48 }, containerStyle]
          : { minWidth: 48, minHeight: 48 }
      }
    >
      <View
        style={labelContainerStyle ? [ui.row, labelContainerStyle] : ui.row}
      >
        {labelIcon}
        <Text allowFontScaling style={[ui.text, { flexShrink: 1 }, labelStyle]}>
          {props.accessibilityLabel}
        </Text>
        <IdentifierBadge code={actionCode} textStyle={codeTextStyle} />
      </View>
      {field}
    </InteractivePressable>
  ) : (
    field
  );
});
export function Loading({ label = "در حال بارگذاری" }: { label?: string }) {
  return <ActivityIndicator color={theme.accent} accessibilityLabel={label} />;
}
export function ErrorText({
  error,
  textStyle,
}: {
  error: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  return error ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={textStyle ? [ui.error, textStyle] : ui.error}
    >
      خطا: {error}
    </Text>
  ) : null;
}
// Presentation only: validation/rollback still happens in the unchanged services.
export function errorMessage(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  if (message === "پیش‌فرض تغییر کرده؛ دوباره باز کن")
    return "اطلاعات فعالیت تغییر کرده؛ فرم را ببندید و دوباره باز کنید.";
  if (
    message === "دسته تغییر کرده؛ دوباره باز کن" ||
    message === "اطلاعات دسته تغییر کرده؛ صفحه را تازه کن"
  )
    return "اطلاعات ثبت تغییر کرده؛ صفحه را دوباره باز کنید.";
  if (/ICATUS|classificat(?:ion|ions)|دسته|طبقه‌بندی/i.test(message))
    return "اطلاعات داخلی برنامه قابل بررسی نیست؛ دوباره تلاش کنید و اگر خطا ادامه داشت، آن را گزارش کنید.";
  return message;
}
