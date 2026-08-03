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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = effectiveWidth * cellSize;
        const logicalHeight = effectiveHeight * cellSize;

        if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
            canvas.width = logicalWidth * dpr;
            canvas.height = logicalHeight * dpr;
            canvas.style.width = logicalWidth + 'px';
            canvas.style.height = logicalHeight + 'px';
        }

        if (!offscreenCanvasRef.current ||
            offscreenCanvasRef.current.width !== logicalWidth ||
            offscreenCanvasRef.current.height !== logicalHeight) {
            offscreenCanvasRef.current = new OffscreenCanvas(logicalWidth, logicalHeight);
            lastPixelsRef.current = null;
        }

        const offscreen = offscreenCanvasRef.current;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        offCtx.imageSmoothingEnabled = false;

        const pixelsChanged = lastPixelsRef.current !== pixels;

        if (pixelsChanged) {
            offCtx.clearRect(0, 0, logicalWidth, logicalHeight);

            let currentDrawColor = '';
            for (let y = 0; y < effectiveHeight; y++) {
                for (let x = 0; x < effectiveWidth; x++) {
                    const index = y * effectiveWidth + x;
                    const color = pixels[index] ?? DEFAULT_COLOR;
                    if (color !== currentDrawColor) {
                        offCtx.fillStyle = color;
                        currentDrawColor = color;
                    }
                    offCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }

            offCtx.strokeStyle = DEFAULT_GRID_COLOR;
            offCtx.lineWidth = 1;
            offCtx.beginPath();
            for (let y = 0; y <= effectiveHeight; y++) {
                const yPos = y * cellSize;
                offCtx.moveTo(0, yPos);
                offCtx.lineTo(logicalWidth, yPos);
            }
            for (let x = 0; x <= effectiveWidth; x++) {
                const xPos = x * cellSize;
                offCtx.moveTo(xPos, 0);
                offCtx.lineTo(xPos, logicalHeight);
            }
            offCtx.stroke();

            // Grille des Tiles
            offCtx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
            offCtx.lineWidth = 2;
            offCtx.beginPath();
            for (let x = tileWidth; x < effectiveWidth; x += tileWidth) {
                const xPos = x * cellSize;
                offCtx.moveTo(xPos, 0);
                offCtx.lineTo(xPos, logicalHeight);
            }
            for (let y = tileHeight; y < effectiveHeight; y += tileHeight) {
                const yPos = y * cellSize;
                offCtx.moveTo(0, yPos);
                offCtx.lineTo(logicalWidth, yPos);
            }
            offCtx.stroke();

            lastPixelsRef.current = pixels;
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(
            scale * dpr, 0,
            0, scale * dpr,
            translateX * dpr, translateY * dpr
        );
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offscreen, 0, 0);
    }, [pixels, effectiveWidth, effectiveHeight, cellSize, scale, translateX, translateY, tileWidth, tileHeight, canvasRef]);
};