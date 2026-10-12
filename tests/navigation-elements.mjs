import React from "react";
import { Pressable } from "./react-native.mjs";
// Native navigation touch host only; callbacks/route selection stay with caller.
export const PlatformPressable = React.forwardRef((props, ref) =>
  React.createElement(Pressable, { ...props, ref }, props.children),
);
