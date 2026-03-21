import React, {
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { CanvasHandle } from "./canvas/types";
import { useToolStore } from "../../stores/toolStore";
import { useCanvasStore } from "../../stores/canvaStore";
import { useZoomPan } from "./canvas/useZoomPan";
import { useCanvasTransform } from "./canvas/useCanvasTransform";
import { useSelection } from "./canvas/useSelection";
import { useCanvasRendering } from "./canvas/useCanvasRendering";
import { useMouseEvents } from "./canvas/useMouseEvents";
import { useKeyboardShortcuts } from "./canvas/useKeyboardShortcuts";


export interface CanvasProps {
  width?: number;
  height?: number;
  cellSize?: number;
  className?: string;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  translateX?: number;
  onTranslateXChange?: (x: number) => void;
  translateY?: number;
  onTranslateYChange?: (y: number) => void;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  (
    {
      width: propWidth,
      height: propHeight,
      cellSize = 16,
      className = "",
      scale: externalScale,
      onScaleChange,
      translateX: externalTranslateX,
      onTranslateXChange,
      translateY: externalTranslateY,
      onTranslateYChange,
    },
    ref,
  ) => {
    const {
      width: storeWidth,
      height: storeHeight,
      pixels,
      setPixel,
      getPixel,
    } = useCanvasStore();
    const { activeTool, currentColor, setCurrentColor } = useToolStore();

    const effectiveWidth = useMemo(
      () => propWidth ?? storeWidth,
      [propWidth, storeWidth],
    );
    const effectiveHeight = useMemo(
      () => propHeight ?? storeHeight,
      [propHeight, storeHeight],
    );

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(
      null,
    );

    const { scale, translateX, translateY, setTranslateX, setTranslateY } =
      useZoomPan({
        scale: externalScale ?? 1,
        translateX: externalTranslateX ?? 0,
        translateY: externalTranslateY ?? 0,
        onScaleChange,
        onTranslateXChange,
        onTranslateYChange,
        containerRef,
      });

    const { getPixelIndexFromEvent } = useCanvasTransform({
      translateX,
      translateY,
      scale,
      cellSize,
      effectiveWidth,
      effectiveHeight,
    });

    const getPixelIndex = useCallback(
      (clientX: number, clientY: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return getPixelIndexFromEvent(clientX, clientY, rect);
      },
      [getPixelIndexFromEvent],
    );

    const {
      selectionRect,
      setSelectionRect,
      isPointInSelection,
      copySelection,
      pasteSelection,
      pasteAtMouse,
    } = useSelection(pixels, effectiveWidth, effectiveHeight, setPixel);

    useCanvasRendering({
      canvasRef,
      effectiveWidth,
      effectiveHeight,
      cellSize,
      scale,
      translateX,
      translateY,
      pixels,
    });

    const handlePixelAction = useCallback(
      (x: number, y: number) => {
        switch (activeTool) {
          case "pencil":
            setPixel(x, y, currentColor);
            break;
          case "eraser":
            setPixel(x, y, "#F0F0F0");
            break;
          case "picker": {
            const color = getPixel(x, y);
            if (color) setCurrentColor(color);
            break;
          }
          default:
            break;
        }
      },
      [activeTool, currentColor, setPixel, getPixel, setCurrentColor],
    );

    const {
      isDrawing,
      isSelecting,
      selectionStart,
      selectionEnd,
      isPanning,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
    } = useMouseEvents({
      activeTool,
      getPixelIndexFromEvent: (clientX, clientY, rect) =>
        getPixelIndexFromEvent(clientX, clientY, rect),
      handlePixelAction,
      containerRef,
      selectionRect,
      setSelectionRect,
      isPointInSelection,
      onTranslateXChange: setTranslateX,
      onTranslateYChange: setTranslateY,
      currentTranslateX: translateX,
      currentTranslateY: translateY,
    });

    const pasteAtMouseHandler = useCallback(() => {
      pasteAtMouse(lastMousePosRef.current, getPixelIndex);
    }, [pasteAtMouse, getPixelIndex]);

    useKeyboardShortcuts({ copySelection, pasteAtMouse: pasteAtMouseHandler });

    React.useEffect(() => {
      const handleMouseMoveGlobal = (e: globalThis.MouseEvent) => {
        lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
      };
      window.addEventListener("mousemove", handleMouseMoveGlobal);
      return () =>
        window.removeEventListener("mousemove", handleMouseMoveGlobal);
    }, []);

    React.useEffect(() => {
      const preventContextMenu = (e: Event) => e.preventDefault();
      const el = containerRef.current;
      if (el) {
        el.addEventListener("contextmenu", preventContextMenu);
      }
      return () => {
        if (el) {
          el.removeEventListener("contextmenu", preventContextMenu);
        }
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        copySelection,
        pasteSelection,
        pasteAtMouse: pasteAtMouseHandler,
        hasSelection: () => !!selectionRect,
      }),
      [copySelection, pasteSelection, pasteAtMouseHandler, selectionRect],
    );

    const selectionOverlay = useMemo(() => {
      if (!selectionRect) return null;
      const { x, y, width, height } = selectionRect;
      const left = x * cellSize * scale + translateX;
      const top = y * cellSize * scale + translateY;
      const w = width * cellSize * scale;
      const h = height * cellSize * scale;
      return (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: w,
            height: h,
            border: "2px dashed #4a9eff",
            backgroundColor: "rgba(74, 158, 255, 0.1)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      );
    }, [selectionRect, cellSize, scale, translateX, translateY]);

    const activeSelectionOverlay = useMemo(() => {
      if (
        !(
          activeTool === "select" &&
          isSelecting &&
          selectionStart &&
          selectionEnd
        )
      )
        return null;
      const start = selectionStart;
      const end = selectionEnd;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x) + 1;
      const height = Math.abs(end.y - start.y) + 1;
      const left = x * cellSize * scale + translateX;
      const top = y * cellSize * scale + translateY;
      const w = width * cellSize * scale;
      const h = height * cellSize * scale;
      return (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: w,
            height: h,
            border: "2px solid #4a9eff",
            backgroundColor: "rgba(74, 158, 255, 0.2)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      );
    }, [
      activeTool,
      isSelecting,
      selectionStart,
      selectionEnd,
      cellSize,
      scale,
      translateX,
      translateY,
    ]);

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{
          width: "100%",
          height: "100%",
          cursor: isPanning
            ? "grabbing"
            : activeTool === "select"
              ? "crosshair"
              : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: effectiveWidth * cellSize,
            height: effectiveHeight * cellSize,
          }}
        />
        {activeSelectionOverlay}
        {selectionOverlay}
      </div>
    );
  },
);

Canvas.displayName = "Canvas";

export default Canvas;
