import { useCallback } from "react";

interface UseCanvasTransformProps {
  translateX: number;
  translateY: number;
  scale: number;
  cellSize: number;
  effectiveWidth: number;
  effectiveHeight: number;
}

export const useCanvasTransform = ({
  translateX,
  translateY,
  scale,
  cellSize,
  effectiveWidth,
  effectiveHeight,
}: UseCanvasTransformProps) => {
  const getPixelIndexFromEvent = useCallback(
    (clientX: number, clientY: number, containerRect: DOMRect) => {
      const containerX = clientX - containerRect.left;
      const containerY = clientY - containerRect.top;

      const transformedX = (containerX - translateX) / scale;
      const transformedY = (containerY - translateY) / scale;

      const pixelX = Math.floor(transformedX / cellSize);
      const pixelY = Math.floor(transformedY / cellSize);

      if (
        pixelX >= 0 &&
        pixelX < effectiveWidth &&
        pixelY >= 0 &&
        pixelY < effectiveHeight
      ) {
        return { x: pixelX, y: pixelY };
      }
      return null;
    },
    [translateX, translateY, scale, cellSize, effectiveWidth, effectiveHeight],
  );

  return { getPixelIndexFromEvent };
};
