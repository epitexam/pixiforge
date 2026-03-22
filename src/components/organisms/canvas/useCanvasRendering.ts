import { useEffect, RefObject } from "react";
import { Color } from "../../../types";
import { DEFAULT_COLOR } from "../../../stores/canvaStore";
import { DEFAULT_GRID_COLOR } from "./constants";

interface UseCanvasRenderingProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  effectiveWidth: number;
  effectiveHeight: number;
  cellSize: number;
  scale: number;
  translateX: number;
  translateY: number;
  pixels: Color[];
}

export const useCanvasRendering = ({
  canvasRef,
  effectiveWidth,
  effectiveHeight,
  cellSize,
  scale,
  translateX,
  translateY,
  pixels,
}: UseCanvasRenderingProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = effectiveWidth * cellSize;
    canvas.height = effectiveHeight * cellSize;

    for (let y = 0; y < effectiveHeight; y++) {
      for (let x = 0; x < effectiveWidth; x++) {
        const index = y * effectiveWidth + x;
        const color = pixels[index] ?? DEFAULT_COLOR;
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [pixels, effectiveWidth, effectiveHeight, cellSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = effectiveWidth * cellSize;
    canvas.height = effectiveHeight * cellSize;

    ctx.setTransform(scale, 0, 0, scale, translateX, translateY);

    for (let y = 0; y < effectiveHeight; y++) {
      for (let x = 0; x < effectiveWidth; x++) {
        const index = y * effectiveWidth + x;
        const color = pixels[index] ?? DEFAULT_COLOR;
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = DEFAULT_GRID_COLOR;
    ctx.lineWidth = 1;

    for (let y = 0; y <= effectiveHeight; y++) {
      const yPos = y * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(effectiveWidth * cellSize, yPos);
      ctx.stroke();
    }
    for (let x = 0; x <= effectiveWidth; x++) {
      const xPos = x * cellSize;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, effectiveHeight * cellSize);
      ctx.stroke();
    }
  }, [pixels, effectiveWidth, effectiveHeight, cellSize, scale, translateX]);
};
