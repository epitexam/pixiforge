import { useState, useEffect, useCallback, RefObject, useRef } from "react";
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
  const [internalScale, setInternalScale] = useState(externalScale);
  const [internalTranslateX, setInternalTranslateX] = useState(externalTranslateX);
  const [internalTranslateY, setInternalTranslateY] = useState(externalTranslateY);

  const scale = onScaleChange !== undefined ? externalScale : internalScale;
  const translateX = onTranslateXChange !== undefined ? externalTranslateX : internalTranslateX;
  const translateY = onTranslateYChange !== undefined ? externalTranslateY : internalTranslateY;

  const setScale = onScaleChange || setInternalScale;
  const setTranslateX = onTranslateXChange || setInternalTranslateX;
  const setTranslateY = onTranslateYChange || setInternalTranslateY;

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const translateXRef = useRef(translateX);
  translateXRef.current = translateX;

  const translateYRef = useRef(translateY);
  translateYRef.current = translateY;

  const settersRef = useRef({ setScale, setTranslateX, setTranslateY });
  settersRef.current = { setScale, setTranslateX, setTranslateY };

  const handleZoom = useCallback((deltaY: number, mouseX: number, mouseY: number) => {
    const currentScale = scaleRef.current;
    const currentTranslateX = translateXRef.current;
    const currentTranslateY = translateYRef.current;

    const zoomFactor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newScale = Math.min(Math.max(currentScale * zoomFactor, MIN_SCALE), MAX_SCALE);

    if (newScale === currentScale) return;

    const canvasXUnderMouse = (mouseX - currentTranslateX) / currentScale;
    const canvasYUnderMouse = (mouseY - currentTranslateY) / currentScale;

    const newTranslateX = mouseX - newScale * canvasXUnderMouse;
    const newTranslateY = mouseY - newScale * canvasYUnderMouse;

    const { setScale, setTranslateX, setTranslateY } = settersRef.current;
    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  }, []);


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
  }, [containerRef, handleZoom]);

  return {
    scale,
    translateX,
    translateY,
    setScale,
    setTranslateX,
    setTranslateY,
  };
};