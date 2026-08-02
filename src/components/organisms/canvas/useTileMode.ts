import { useState, useCallback } from 'react';

interface UseTileModeProps {
  tileModeEnabled: boolean;
  selectedTile: { col: number; row: number } | null;
  tileWidth: number;
  tileHeight: number;
  effectiveWidth: number;
  effectiveHeight: number;
  getPixelIndex: (clientX: number, clientY: number) => { x: number; y: number } | null;
}

export const useTileMode = ({
  tileModeEnabled,
  selectedTile,
  tileWidth,
  tileHeight,
  effectiveWidth,
  effectiveHeight,
  getPixelIndex,
}: UseTileModeProps) => {
  const [isInsideTile, setIsInsideTile] = useState(false);

  const checkTileBounds = useCallback(
    (x: number, y: number): boolean => {
      if (!tileModeEnabled || !selectedTile) return true;
      const startX = selectedTile.col * tileWidth;
      const startY = selectedTile.row * tileHeight;
      const endX = Math.min(startX + tileWidth, effectiveWidth);
      const endY = Math.min(startY + tileHeight, effectiveHeight);
      return x >= startX && x < endX && y >= startY && y < endY;
    },
    [tileModeEnabled, selectedTile, tileWidth, tileHeight, effectiveWidth, effectiveHeight]
  );

  const handleMouseMoveTile = useCallback(
    (clientX: number, clientY: number) => {
      if (!tileModeEnabled || !selectedTile) {
        setIsInsideTile(false);
        return;
      }
      const indices = getPixelIndex(clientX, clientY);
      if (indices) {
        const inside = checkTileBounds(indices.x, indices.y);
        setIsInsideTile(inside);
      } else {
        setIsInsideTile(false);
      }
    },
    [tileModeEnabled, selectedTile, getPixelIndex, checkTileBounds]
  );

  return {
    isInsideTile,
    checkTileBounds,
    handleMouseMoveTile,
    setIsInsideTile,
  };
};