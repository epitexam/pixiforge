import React from "react";
import { Rect } from "./types";

interface SelectionOverlayProps {
  rect: Rect | null;
  cellSize: number;
  scale: number;
  translateX: number;
  translateY: number;
  isActive: boolean;
  color?: string;
  backgroundColor?: string;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  rect,
  cellSize,
  scale,
  translateX,
  translateY,
  isActive,
  color = "#4a9eff",
  backgroundColor = "rgba(74, 158, 255, 0.1)",
}) => {
  if (!rect) return null;

  const { x, y, width, height } = rect;
  const left = x * cellSize * scale + translateX;
  const top = y * cellSize * scale + translateY;
  const w = width * cellSize * scale;
  const h = height * cellSize * scale;

  const borderStyle = isActive ? "2px solid" : "2px dashed";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        border: `${borderStyle} ${color}`,
        backgroundColor,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
};
