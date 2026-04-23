import { useState, useEffect, useCallback, RefObject } from "react";
import { MIN_SCALE, MAX_SCALE, ZOOM_FACTOR } from "./constants";

interface UseZoomPanProps {
  scale: number;
  translateX: number;
  translateY: number;
  onScaleChange?: (scale: number) => void;
  onTranslateXChange?: (x: number) => void;
  onTranslateYChange?: (y: number) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const useZoomPan = ({
  scale: externalScale,
  translateX: externalTranslateX,
  translateY: externalTranslateY,
  onScaleChange,
  onTranslateXChange,
  onTranslateYChange,
  containerRef,
}: UseZoomPanProps) => {
  const [internalScale, setInternalScale] = useState(1);
  const [internalTranslateX, setInternalTranslateX] = useState(0);
  const [internalTranslateY, setInternalTranslateY] = useState(0);

  const scale = onScaleChange !== undefined ? externalScale : internalScale;
  const translateX =
    onTranslateXChange !== undefined ? externalTranslateX : internalTranslateX;
  const translateY =
    onTranslateYChange !== undefined ? externalTranslateY : internalTranslateY;

  const setScale = onScaleChange || setInternalScale;
  const setTranslateX = onTranslateXChange || setInternalTranslateX;
  const setTranslateY = onTranslateYChange || setInternalTranslateY;

  const handleZoom = useCallback((deltaY: number, mouseX: number, mouseY: number) => {
    const zoomFactor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newScale = Math.min(Math.max(scale * zoomFactor, MIN_SCALE), MAX_SCALE);

    const canvasXUnderMouse = (mouseX - translateX) / scale;
    const canvasYUnderMouse = (mouseY - translateY) / scale;

    const newTranslateX = mouseX - newScale * canvasXUnderMouse;
    const newTranslateY = mouseY - newScale * canvasYUnderMouse;

    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  }, [scale, translateX, translateY, setScale, setTranslateX, setTranslateY]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      handleZoom(e.deltaY, mouseX, mouseY);
    };

    container.addEventListener("wheel", wheelHandler, { passive: false });
    return () => container.removeEventListener("wheel", wheelHandler);
  }, [handleZoom, containerRef]);

  return {
    scale,
    translateX,
    translateY,
    setScale,
    setTranslateX,
    setTranslateY,
  };
};
