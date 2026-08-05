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
import { useKeyboardSelectionClear } from "./canvas/useKeyboardSelectionClear";
import { useTileMode } from "./canvas/useTileMode";
import { toast } from "sonner";

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
            setPixel(x, y, currentColor);
            break;
          case "eraser":
            setPixel(x, y, DEFAULT_COLOR);
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
      [activeTool, currentColor, setPixel, getPixel, fillArea, setCurrentColor, tileModeEnabled, selectedTile, checkTileBounds],
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
      onActionStart: beginAction,
      onActionEnd: commitAction,
    });

    const handleMouseMoveWrapper = useCallback(
      (e: React.MouseEvent) => {
        handleMouseMove(e);
        handleMouseMoveTile(e.clientX, e.clientY);
      },
      [handleMouseMove, handleMouseMoveTile],
    );

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
        onMouseUp={handleMouseUp}
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
