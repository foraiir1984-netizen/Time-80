import React from "react";
export const Platform = { OS: "android" };
export const dimensions = { width: 400, height: 800, fontScale: 1, scale: 1 };
export const useWindowDimensions = () => dimensions;
export const StyleSheet = { create: (x) => x };
const primitive = (name) =>
  React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref }, props.children),
  );
export const View = primitive("View"),
  Text = primitive("Text"),
  Image = primitive("Image"),
  Pressable = primitive("Pressable"),
  TextInput = primitive("TextInput"),
  ScrollView = primitive("ScrollView"),
  KeyboardAvoidingView = primitive("KeyboardAvoidingView"),
  ActivityIndicator = primitive("ActivityIndicator");
export const Switch = primitive("Switch");
export function Modal(props) {
  return props.visible
    ? React.createElement("Modal", props, props.children)
    : null;
}
export function FlatList(props) {
  const { ListHeaderComponent, ListEmptyComponent, renderItem, ...rest } =
    props;
  return React.createElement(
    "FlatList",
    rest,
    ListHeaderComponent,
    props.data.map((item, index) =>
      React.createElement(
        React.Fragment,
        { key: props.keyExtractor?.(item) ?? index },
        props.renderItem({ item, index }),
      ),
    ),
    props.data.length ? null : props.ListEmptyComponent,
  );
}
const listeners = new Set();
export const AppState = {
  addEventListener: (_, fn) => {
    listeners.add(fn);
    return { remove: () => listeners.delete(fn) };
  },
};
export const emitAppState = (s) => listeners.forEach((fn) => fn(s));
export const appStateListenerCount = () => listeners.size;
export const AccessibilityInfo = { setAccessibilityFocus: () => {} };
export const findNodeHandle = () => null;
export const Linking = { openSettings: async () => {} };
export const I18nManager = { isRTL: true };
export const alertState = { calls: [], autoConfirm: true };
export const Alert = {
  alert: (title, body, actions, options) => {
    alertState.calls.push({ title, body, actions, options });
    if (alertState.autoConfirm)
      actions
        ?.find((a) => a.text === "تأیید" || a.text?.startsWith("تأیید ["))
        ?.onPress?.();
  },
};
