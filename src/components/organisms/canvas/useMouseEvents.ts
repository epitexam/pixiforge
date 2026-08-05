import { useState, useCallback, RefObject } from "react";
import { Tool } from "../../../stores/toolStore";
import { Rect } from "./types";

interface UseMouseEventsProps {
  activeTool: Tool;
  getPixelIndexFromEvent: (
    clientX: number,
    clientY: number,
    rect: DOMRect,
  ) => { x: number; y: number } | null;
  handlePixelAction: (x: number, y: number) => void;
  canSelectPoint: (x: number, y: number) => boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  setSelectionRect: (rect: Rect | null) => void;
  isPointInSelection: (x: number, y: number) => boolean;
  onTranslateXChange: (x: number) => void;
  onTranslateYChange: (y: number) => void;
  currentTranslateX: number;
  currentTranslateY: number;
  onActionStart?: () => void;
  onActionEnd?: () => void;
}

export const useMouseEvents = ({
  activeTool,
  getPixelIndexFromEvent,
  handlePixelAction,
  canSelectPoint,
  containerRef,
  setSelectionRect,
  isPointInSelection,
  onTranslateXChange,
  onTranslateYChange,
  currentTranslateX,
  currentTranslateY,
  onActionStart,
  onActionEnd,
}: UseMouseEventsProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
      if (!indices) return;

      if (e.button === 2) {
        e.preventDefault();
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        return;
      }

      if (activeTool === "select") {
        if (!canSelectPoint(indices.x, indices.y)) return;
        setIsSelecting(true);
        setSelectionStart(indices);
        setSelectionEnd(indices);
      } else {
        setIsDrawing(true);
        onActionStart?.();
        handlePixelAction(indices.x, indices.y);
      }
    },
    [activeTool, getPixelIndexFromEvent, handlePixelAction, canSelectPoint, containerRef, onActionStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && lastPanPoint) {
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        const newX = currentTranslateX + dx;
        const newY = currentTranslateY + dy;

        onTranslateXChange(newX);
        onTranslateYChange(newY);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
      if (!indices) return;

      if (activeTool === "select") {
        if (isSelecting && selectionStart && canSelectPoint(indices.x, indices.y)) {
          setSelectionEnd(indices);
        }
      } else if (isDrawing) {
        handlePixelAction(indices.x, indices.y);
      }
    },
    [
      isPanning,
      lastPanPoint,
      currentTranslateX,
      currentTranslateY,
      onTranslateXChange,
      onTranslateYChange,
      activeTool,
      isSelecting,
      selectionStart,
      isDrawing,
      getPixelIndexFromEvent,
      handlePixelAction,
      canSelectPoint,
      containerRef,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 2) {
        setIsPanning(false);
        setLastPanPoint(null);
        return;
      }

      if (activeTool === "select") {
        if (isSelecting && selectionStart && selectionEnd) {
          const start = selectionStart;
          const end = selectionEnd;
          const x = Math.min(start.x, end.x);
          const y = Math.min(start.y, end.y);
          const width = Math.abs(end.x - start.x) + 1;
          const height = Math.abs(end.y - start.y) + 1;
          setSelectionRect({ x, y, width, height });
          setIsSelecting(false);
          setSelectionStart(null);
          setSelectionEnd(null);
        } else {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const indices = getPixelIndexFromEvent(e.clientX, e.clientY, rect);
          if (indices && !isPointInSelection(indices.x, indices.y)) {
            setSelectionRect(null);
          }
        }
      } else {
        setIsDrawing(false);
        onActionEnd?.();
      }
    },
    [
      activeTool,
      isSelecting,
      selectionStart,
      selectionEnd,
      setSelectionRect,
      isPointInSelection,
      getPixelIndexFromEvent,
      containerRef,
      onActionEnd,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      onActionEnd?.();
    }
    setIsPanning(false);
    setIsSelecting(false);
    setLastPanPoint(null);
  }, [isDrawing, onActionEnd]);

  return {
    isDrawing,
    isSelecting,
    selectionStart,
    selectionEnd,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
