import { useState, useCallback } from "react";
import { Color } from "../../../types";
import { DEFAULT_COLOR } from "../../../stores/canvaStore";
import { Rect } from "./types";
import { toast } from "sonner";

interface UseSelectionDeps {
  mousePosRef: React.MutableRefObject<{ clientX: number; clientY: number } | null>;
  getPixelIndex: (clientX: number, clientY: number) => { x: number; y: number } | null;
}

export const useSelection = (
  pixels: Color[],
  effectiveWidth: number,
  effectiveHeight: number,
  setPixel: (x: number, y: number, color: Color) => void,
  deps: UseSelectionDeps,
  canEditPixel: (x: number, y: number) => boolean = () => true,
) => {
  const { mousePosRef, getPixelIndex } = deps;

  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  const [copiedPixels, setCopiedPixels] = useState<Color[][] | null>(null);
  const [selectionDragOffset, setSelectionDragOffset] = useState<{ x: number; y: number } | null>(null);

  const isPointInSelection = useCallback(
    (x: number, y: number): boolean => {
      if (!selectionRect) return false;
      const { x: sx, y: sy, width, height } = selectionRect;
      return x >= sx && x < sx + width && y >= sy && y < sy + height;
    },
    [selectionRect]
  );

  const copySelection = useCallback(() => {
    if (!selectionRect) {
      toast.success('No selection to copy');
      return;
    }
    const { x, y, width, height } = selectionRect;
    const copied: Color[][] = [];
    for (let dy = 0; dy < height; dy++) {
      const row: Color[] = [];
      for (let dx = 0; dx < width; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px < effectiveWidth && py < effectiveHeight) {
          const index = py * effectiveWidth + px;
          row.push(pixels[index]);
        } else {
          row.push(DEFAULT_COLOR);
        }
      }
      copied.push(row);
    }
    setCopiedPixels(copied);
    toast.success(`Selection copied (${width} x ${height})`);
  }, [selectionRect, pixels, effectiveWidth, effectiveHeight]);

  const pasteSelection = useCallback(
    (targetX?: number, targetY?: number) => {
      if (!copiedPixels) return;
      let pasteX = targetX;
      let pasteY = targetY;
      if (pasteX === undefined || pasteY === undefined) {
        toast.error("No paste position available");
        return;
      }
      const width = copiedPixels[0].length;
      const height = copiedPixels.length;
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const px = pasteX + dx;
          const py = pasteY + dy;
          if (px >= 0 && py >= 0 && px < effectiveWidth && py < effectiveHeight && canEditPixel(px, py)) {
            setPixel(px, py, copiedPixels[dy][dx]);
          }
        }
      }
      toast.success(`Pasted at (${pasteX}, ${pasteY})`);
    },
    [copiedPixels, setPixel, effectiveWidth, effectiveHeight, canEditPixel]
  );

  const moveSelection = useCallback((targetX: number, targetY: number) => {
    if (!selectionRect || !copiedPixels) return;
    const width = copiedPixels[0].length;
    const height = copiedPixels.length;
    const currentPixels = copiedPixels;

    const clearSelection = () => {
      for (let dy = 0; dy < selectionRect.height; dy++) {
        for (let dx = 0; dx < selectionRect.width; dx++) {
          const px = selectionRect.x + dx;
          const py = selectionRect.y + dy;
          if (px >= 0 && py >= 0 && px < effectiveWidth && py < effectiveHeight && canEditPixel(px, py)) {
            setPixel(px, py, DEFAULT_COLOR);
          }
        }
      }
    };

    clearSelection();
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = targetX + dx;
        const py = targetY + dy;
        if (px >= 0 && py >= 0 && px < effectiveWidth && py < effectiveHeight && canEditPixel(px, py)) {
          setPixel(px, py, currentPixels[dy][dx]);
        }
      }
    }
    setSelectionRect({ x: targetX, y: targetY, width, height });
    toast.success('Selection moved');
  }, [selectionRect, copiedPixels, setPixel, effectiveWidth, effectiveHeight, canEditPixel]);

  const pasteAtMouse = useCallback(() => {
    const mousePos = mousePosRef.current;
    if (!mousePos) {
      toast.error("Paste failed", {
        description: "No mouse position available"
      });
      return;
    }
    const indices = getPixelIndex(mousePos.clientX, mousePos.clientY);
    if (indices) {
      pasteSelection(indices.x, indices.y);
    } else {
      toast.error("Paste failed", {
        description: "Mouse is outside the canvas"
      });
    }
  }, [mousePosRef, getPixelIndex, pasteSelection]);

  return {
    selectionRect,
    setSelectionRect,
    copiedPixels,
    selectionDragOffset,
    setSelectionDragOffset,
    isPointInSelection,
    copySelection,
    pasteSelection,
    pasteAtMouse,
    moveSelection,
  };
};
