import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { CanvasHandle } from "./canvas/types";
import { DEFAULT_COLOR, useCanvasStore } from "../../stores/canvaStore";
import { useToolStore } from "../../stores/toolStore";
import { useGlobalMousePosition } from "./canvas/useGlobalMousePosition";
import { useZoomPan } from "./canvas/useZoomPan";
import { useCanvasTransform } from "./canvas/useCanvasTransform";
import { useSelection } from "./canvas/useSelection";
import { useCanvasRendering } from "./canvas/useCanvasRendering";
import { useMouseEvents } from "./canvas/useMouseEvents";
import { useKeyboardShortcuts } from "./canvas/useKeyboardShortcuts";
import { usePreventContextMenu } from "./canvas/usePreventContextMenu";
import { SelectionOverlay } from "./canvas/SelectionOverlay";

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
    const lastMousePosRef = useGlobalMousePosition();

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
            setPixel(x, y, DEFAULT_COLOR);
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

    usePreventContextMenu(containerRef);

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

    const activeRect = useMemo(() => {
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
      return {
        x: Math.min(start!.x, end!.x),
        y: Math.min(start!.y, end!.y),
        width: Math.abs(end!.x - start!.x) + 1,
        height: Math.abs(end!.y - start!.y) + 1,
      };
    }, [activeTool, isSelecting, selectionStart, selectionEnd]);

    const staticRect = useMemo(() => selectionRect, [selectionRect]);

    const getCursor = () => {
      if (isPanning) return "grabbing";
      switch (activeTool) {
        case "select":
          return "crosshair";
        case "picker":
          return "crosshair";
        default:
          return "default";
      }
    };

    return (
      <div
        ref={containerRef}
        className={`relative inline-block ${className}`}
        style={{
          width: effectiveWidth * cellSize,
          height: effectiveHeight * cellSize,
          cursor: getCursor(),
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
            width: "100%",
            height: "100%",
          }}
        />
        <SelectionOverlay
          rect={activeRect}
          cellSize={cellSize}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
          isActive={true}
          backgroundColor="rgba(74, 158, 255, 0.2)"
        />
        <SelectionOverlay
          rect={staticRect}
          cellSize={cellSize}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
          isActive={false}
          backgroundColor="rgba(74, 158, 255, 0.1)"
        />
      </div>
    );
  },
);

Canvas.displayName = "Canvas";

export default Canvas;