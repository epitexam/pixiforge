import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
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
import { useKeyboardSelectionClear } from "./canvas/useKeyboardSelectionClear";
import { useTileMode } from "./canvas/useTileMode";
import { toast } from "sonner";
import { Color } from "../../types";

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
  brushSize?: number;
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
      brushSize = 1,
    },
    ref,
  ) => {
    const {
      width: storeWidth,
      height: storeHeight,
      pixels,
      setPixel,
      getPixel,
      fillArea,
      tileWidth,
      beginAction,
      commitAction,
      undo,
      redo,
      tileHeight,
      selectedTile,
      tileModeEnabled,
      selectTile,
      setTileMode,
      getActiveLibraryTile,
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
    const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
    const [shapeEnd, setShapeEnd] = useState<{ x: number; y: number } | null>(null);

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

    const { isInsideTile, checkTileBounds, handleMouseMoveTile } = useTileMode({
      tileModeEnabled,
      selectedTile,
      tileWidth,
      tileHeight,
      effectiveWidth,
      effectiveHeight,
      getPixelIndex,
    });

    const {
      selectionRect,
      setSelectionRect,
      isPointInSelection,
      copySelection,
      pasteSelection,
      pasteAtMouse,
      moveSelection,
      selectionDragOffset,
      setSelectionDragOffset,
    } = useSelection(
      pixels,
      effectiveWidth,
      effectiveHeight,
      setPixel,
      {
        mousePosRef: lastMousePosRef,
        getPixelIndex,
      },
      checkTileBounds,
    );

    useKeyboardSelectionClear({
      selectionRect,
      setSelectionRect,
      setPixel,
      effectiveWidth,
      effectiveHeight,
      canEditPixel: checkTileBounds,
    });

    useCanvasRendering({
      canvasRef,
      effectiveWidth,
      effectiveHeight,
      cellSize,
      scale,
      translateX,
      translateY,
      pixels,
      tileWidth,
      tileHeight,
    });

    const drawShape = useCallback(
      (start: { x: number; y: number }, end: { x: number; y: number }) => {
        const { x: x1, y: y1 } = start;
        const { x: x2, y: y2 } = end;
        const drawPoint = (px: number, py: number) => {
          if (tileModeEnabled && selectedTile) {
            if (!checkTileBounds(px, py)) return;
          }
          setPixel(px, py, currentColor);
        };

        const drawLine = () => {
          const dx = Math.abs(x2 - x1);
          const dy = Math.abs(y2 - y1);
          const sx = x1 < x2 ? 1 : -1;
          const sy = y1 < y2 ? 1 : -1;
          let err = dx - dy;
          let currentX = x1;
          let currentY = y1;

          while (true) {
            drawPoint(currentX, currentY);
            if (currentX === x2 && currentY === y2) break;
            const e2 = err * 2;
            if (e2 > -dy) {
              err -= dy;
              currentX += sx;
            }
            if (e2 < dx) {
              err += dx;
              currentY += sy;
            }
          }
        };

        const drawRectangle = () => {
          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              if (x === minX || x === maxX || y === minY || y === maxY) {
                drawPoint(x, y);
              }
            }
          }
        };

        const drawEllipse = () => {
          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);
          const rx = Math.max(1, Math.floor((maxX - minX) / 2));
          const ry = Math.max(1, Math.floor((maxY - minY) / 2));
          const cx = Math.floor((minX + maxX) / 2);
          const cy = Math.floor((minY + maxY) / 2);

          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const normalizedX = (x - cx) / rx;
              const normalizedY = (y - cy) / ry;
              if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
                drawPoint(x, y);
              }
            }
          }
        };

        switch (activeTool) {
          case "line":
            drawLine();
            break;
          case "rectangle":
            drawRectangle();
            break;
          case "ellipse":
            drawEllipse();
            break;
          default:
            break;
        }
      },
      [activeTool, checkTileBounds, currentColor, selectedTile, setPixel, tileModeEnabled],
    );

    const paintBrush = useCallback(
      (x: number, y: number, color: Color) => {
        const radius = Math.max(1, Math.floor(brushSize / 2));
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px < 0 || py < 0 || px >= effectiveWidth || py >= effectiveHeight) continue;
            if (tileModeEnabled && selectedTile) {
              if (!checkTileBounds(px, py)) continue;
            }
            setPixel(px, py, color);
          }
        }
      },
      [brushSize, checkTileBounds, effectiveWidth, effectiveHeight, selectedTile, setPixel, tileModeEnabled],
    );

    const handlePixelAction = useCallback(
      (x: number, y: number) => {
        if (tileModeEnabled && selectedTile) {
          const inside = checkTileBounds(x, y);
          if (!inside) {
            toast.warning("This action is outside the locked tile area", {
              duration: 1500,
            });
            return;
          }
        }

        switch (activeTool) {
          case "pencil":
            paintBrush(x, y, currentColor);
            break;
          case "eraser":
            paintBrush(x, y, DEFAULT_COLOR);
            break;
          case "smartFill":
            fillArea(x, y, currentColor, (px, py) => {
              if (tileModeEnabled && selectedTile) {
                return checkTileBounds(px, py);
              }
              return true;
            });
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
      [activeTool, currentColor, setPixel, getPixel, fillArea, setCurrentColor, tileModeEnabled, selectedTile, checkTileBounds, paintBrush],
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
      getPixelIndexFromEvent,
      handlePixelAction,
      canSelectPoint: checkTileBounds,
      containerRef,
      setSelectionRect,
      isPointInSelection,
      onTranslateXChange: setTranslateX,
      onTranslateYChange: setTranslateY,
      currentTranslateX: translateX,
      currentTranslateY: translateY,
      onActionStart: () => {
        beginAction();
      },
      onActionEnd: () => {
        commitAction();
      },
      onShapeStart: (point) => {
        setShapeStart(point);
        setShapeEnd(point);
      },
      onShapeUpdate: (point) => {
        setShapeEnd(point);
      },
      onShapeComplete: () => {
        if (shapeStart && shapeEnd) {
          drawShape(shapeStart, shapeEnd);
        }
        setShapeStart(null);
        setShapeEnd(null);
      },
    });

    const handleMouseUpSelection = useCallback(() => {
      if (selectionDragOffset) {
        setSelectionDragOffset(null);
        commitAction();
      }
    }, [selectionDragOffset, commitAction, setSelectionDragOffset]);

    useKeyboardShortcuts({
      copySelection,
      pasteAtMouse,
      undo,
      redo,
    });

    usePreventContextMenu(containerRef);

    useImperativeHandle(
      ref,
      () => ({
        copySelection,
        pasteSelection,
        pasteAtMouse,
        hasSelection: () => !!selectionRect,
        getCanvas: () => canvasRef.current,
      }),
      [copySelection, pasteSelection, pasteAtMouse, selectionRect],
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

    const tileOverlay = useMemo(() => {
      if (!tileModeEnabled || !selectedTile) return null;
      const startX = selectedTile.col * tileWidth;
      const startY = selectedTile.row * tileHeight;
      const width = Math.min(tileWidth, effectiveWidth - startX);
      const height = Math.min(tileHeight, effectiveHeight - startY);
      const left = startX * cellSize * scale + translateX;
      const top = startY * cellSize * scale + translateY;
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
            border: "2px solid cyan",
            backgroundColor: isInsideTile ? "rgba(0, 255, 255, 0.15)" : "rgba(255, 0, 0, 0.1)",
            pointerEvents: "none",
            zIndex: 10,
            transition: "background-color 0.15s",
          }}
        />
      );
    }, [tileModeEnabled, selectedTile, tileWidth, tileHeight, effectiveWidth, effectiveHeight, cellSize, scale, translateX, translateY, isInsideTile]);

    const handleCloseTileMode = useCallback(() => setTileMode(false), [setTileMode]);

    const tileModeIndicator = useMemo(() => {
      if (!tileModeEnabled || !selectedTile) return null;
      return (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 20,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid #4a9eff",
            borderRadius: 6,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            pointerEvents: "auto",
            fontSize: 11,
            color: "#ccc",
          }}
        >
          <span style={{ color: "#4a9eff" }}>Locked tile area</span>
          <span>
            ({selectedTile.col}, {selectedTile.row})
          </span>
          <button
            onClick={handleCloseTileMode}
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: 14,
              padding: "0 2px",
              lineHeight: 1,
            }}
            title="Exit tile mode"
          >
            ✕
          </button>
        </div>
      );
    }, [tileModeEnabled, selectedTile, handleCloseTileMode]);

    const cursor = useMemo(() => {
      if (isPanning) return "grabbing";
      if (tileModeEnabled && selectedTile && !isInsideTile) return "not-allowed";
      switch (activeTool) {
        case "select":
        case "picker":
        case "tileSelect":
        case "tileStamp":
          return "crosshair";
        default:
          return "default";
      }
    }, [isPanning, tileModeEnabled, selectedTile, isInsideTile, activeTool]);

    const customHandleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("button")) return;
        if (activeTool === "tileSelect") {
          if (e.button !== 0) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
            if (indices) {
              const col = Math.floor(indices.x / tileWidth);
              const row = Math.floor(indices.y / tileHeight);
              selectTile(col, row);
              setTileMode(true);
              toast.info(`Tile (${col}, ${row}) selected`, { duration: 1200 });
            }
          }
          return;
        }
        if (selectionRect && activeTool === 'select' && e.button === 0) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
            if (indices) {
              const offsetX = indices.x - selectionRect.x;
              const offsetY = indices.y - selectionRect.y;
              setSelectionDragOffset({ x: offsetX, y: offsetY });
              beginAction();
              return;
            }
          }
        }
        if (activeTool === "tileStamp") {
          if (e.button !== 0) return;
          const rect = containerRef.current?.getBoundingClientRect();
          const tile = getActiveLibraryTile();
          if (!rect || !tile) {
            toast.error("Choose a tile from the library before placing it.");
            return;
          }
          const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
          if (!indices) return;
          beginAction();
          let placedPixels = 0;
          for (let y = 0; y < tile.height; y++) {
            for (let x = 0; x < tile.width; x++) {
              const targetX = indices.x + x;
              const targetY = indices.y + y;
              if (targetX >= effectiveWidth || targetY >= effectiveHeight || !checkTileBounds(targetX, targetY)) continue;
              setPixel(targetX, targetY, tile.pixels[y * tile.width + x]);
              placedPixels++;
            }
          }
          if (!placedPixels) toast.warning("This placement is outside the locked tile area.");
          commitAction();
          return;
        }
        handleMouseDown(e);
      },
      [activeTool, getPixelIndexFromEvent, tileWidth, tileHeight, selectTile, setTileMode, handleMouseDown, getActiveLibraryTile, effectiveWidth, effectiveHeight, checkTileBounds, setPixel, beginAction, commitAction],
    );

    const handleMouseMoveSelection = useCallback((e: React.MouseEvent) => {
      if (!selectionRect || !selectionDragOffset) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
      if (!indices) return;
      const targetX = indices.x - selectionDragOffset.x;
      const targetY = indices.y - selectionDragOffset.y;
      moveSelection(targetX, targetY);
    }, [selectionRect, selectionDragOffset, getPixelIndexFromEvent, moveSelection]);

    const handleMouseMoveWrapper = useCallback(
      (e: React.MouseEvent) => {
        if (selectionRect && selectionDragOffset) {
          handleMouseMoveSelection(e);
          return;
        }
        handleMouseMove(e);
        handleMouseMoveTile(e.clientX, e.clientY);
      },
      [handleMouseMove, handleMouseMoveTile, handleMouseMoveSelection, selectionRect, selectionDragOffset],
    );

    const containerStyle = useMemo(() => ({
      width: effectiveWidth * cellSize,
      height: effectiveHeight * cellSize,
      cursor,
    }), [effectiveWidth, cellSize, effectiveHeight, cursor]);

    const canvasStyle = useMemo(() => ({
      display: "block",
      width: "100%",
      height: "100%",
    }), []);

    return (
      <div
        ref={containerRef}
        className={`relative inline-block ${className}`}
        style={containerStyle}
        onMouseDown={customHandleMouseDown}
        onMouseMove={handleMouseMoveWrapper}
        onMouseUp={(event) => {
          handleMouseUp(event);
          handleMouseUpSelection();
        }}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          style={canvasStyle}
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
        {tileOverlay}
        {tileModeIndicator}
      </div>
    );
  },
);

Canvas.displayName = "Canvas";

export default Canvas;
