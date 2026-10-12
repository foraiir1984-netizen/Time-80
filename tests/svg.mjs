// Native SVG hosts only. Geometry is computed by the actual report component.
import React from "react";
const primitive = (name) =>
  React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref }, props.children),
  );
export default primitive("Svg");
export const Circle = primitive("SvgCircle"),
  Rect = primitive("SvgRect"),
  Line = primitive("SvgLine"),
  Path = primitive("SvgPath");
