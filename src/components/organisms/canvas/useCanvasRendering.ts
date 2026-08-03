import { useEffect, RefObject, useRef } from 'react';
import { Color } from '../../../types';
import { DEFAULT_COLOR } from '../../../stores/canvaStore';
import { DEFAULT_GRID_COLOR } from './constants';

interface UseCanvasRenderingProps {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    effectiveWidth: number;
    effectiveHeight: number;
    cellSize: number;
    scale: number;
    translateX: number;
    translateY: number;
    pixels: Color[];
    tileWidth: number;
    tileHeight: number;
}

export const useCanvasRendering = ({
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
}: UseCanvasRenderingProps) => {
    const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null);
    const lastPixelsRef = useRef<Color[] | null>(null);
    const prevCellSizeRef = useRef<number>(cellSize);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        if (prevCellSizeRef.current !== cellSize) {
            offscreenCanvasRef.current = null;
            lastPixelsRef.current = null;
            prevCellSizeRef.current = cellSize;
        }

        const dpr = window.devicePixelRatio || 1;

        const logicalWidth = effectiveWidth * cellSize;
        const logicalHeight = effectiveHeight * cellSize;

        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;
        canvas.style.width = logicalWidth + 'px';
        canvas.style.height = logicalHeight + 'px';
        ctx.scale(dpr, dpr);

        if (!offscreenCanvasRef.current ||
            offscreenCanvasRef.current.width !== logicalWidth ||
            offscreenCanvasRef.current.height !== logicalHeight) {
            offscreenCanvasRef.current = new OffscreenCanvas(logicalWidth, logicalHeight);
            const offCtx = offscreenCanvasRef.current.getContext('2d');
            if (offCtx) {
                offCtx.imageSmoothingEnabled = false;
            }
            lastPixelsRef.current = null;
        }

        const offscreen = offscreenCanvasRef.current;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        offCtx.imageSmoothingEnabled = false;

        const pixelsChanged =
            lastPixelsRef.current === null ||
            lastPixelsRef.current.length !== pixels.length ||
            lastPixelsRef.current.some((color, i) => color !== pixels[i]);

        if (pixelsChanged) {
            offCtx.clearRect(0, 0, logicalWidth, logicalHeight);

            for (let y = 0; y < effectiveHeight; y++) {
                for (let x = 0; x < effectiveWidth; x++) {
                    const index = y * effectiveWidth + x;
                    const color = pixels[index] ?? DEFAULT_COLOR;
                    offCtx.fillStyle = color;
                    offCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }

            offCtx.strokeStyle = DEFAULT_GRID_COLOR;
            offCtx.lineWidth = 1;
            for (let y = 0; y <= effectiveHeight; y++) {
                const yPos = y * cellSize;
                offCtx.beginPath();
                offCtx.moveTo(0, yPos);
                offCtx.lineTo(effectiveWidth * cellSize, yPos);
                offCtx.stroke();
            }
            for (let x = 0; x <= effectiveWidth; x++) {
                const xPos = x * cellSize;
                offCtx.beginPath();
                offCtx.moveTo(xPos, 0);
                offCtx.lineTo(xPos, effectiveHeight * cellSize);
                offCtx.stroke();
            }

            offCtx.save();
            offCtx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
            offCtx.lineWidth = 2;
            for (let x = tileWidth; x < effectiveWidth; x += tileWidth) {
                const xPos = x * cellSize;
                offCtx.beginPath();
                offCtx.moveTo(xPos, 0);
                offCtx.lineTo(xPos, effectiveHeight * cellSize);
                offCtx.stroke();
            }
            for (let y = tileHeight; y < effectiveHeight; y += tileHeight) {
                const yPos = y * cellSize;
                offCtx.beginPath();
                offCtx.moveTo(0, yPos);
                offCtx.lineTo(effectiveWidth * cellSize, yPos);
                offCtx.stroke();
            }
            offCtx.restore();

            lastPixelsRef.current = pixels.slice();
        }

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(scale, 0, 0, scale, translateX, translateY);
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
    }, [pixels, effectiveWidth, effectiveHeight, cellSize, scale, translateX, tileWidth, tileHeight, canvasRef]);
};