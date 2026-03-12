import React from "react";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

export default function HelpioGlobeIcon({
  size = 44,
  color = "#00A6FF",
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle
        cx="32"
        cy="32"
        r="22"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />

      <Ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="22"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />

      <Ellipse
        cx="32"
        cy="32"
        rx="18"
        ry="22"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.8}
        fill="none"
      />

      <Path
        d="M10 32H54"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M14 22H50"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.8}
      />
      <Path
        d="M14 42H50"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.8}
      />
    </Svg>
  );
}
