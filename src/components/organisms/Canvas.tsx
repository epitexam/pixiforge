import React, { useState, useEffect, useRef, WheelEvent, MouseEvent } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { Pixel } from '../atoms/Pixel';
import { useCanvasStore } from '../../stores/canvaStore';

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

export const Canvas: React.FC<CanvasProps> = ({
    width: propWidth,
    height: propHeight,
    cellSize = 16,
    className = '',
    scale: externalScale,
    onScaleChange,
    translateX: externalTranslateX,
    onTranslateXChange,
    translateY: externalTranslateY,
    onTranslateYChange,
}) => {
    const { width: storeWidth, height: storeHeight, pixels, setPixel, getPixel } = useCanvasStore();
    const { activeTool, currentColor, setCurrentColor } = useToolStore();

    const effectiveWidth = propWidth ?? storeWidth;
    const effectiveHeight = propHeight ?? storeHeight;

    const [internalScale, setInternalScale] = useState(1);
    const [internalTranslateX, setInternalTranslateX] = useState(0);
    const [internalTranslateY, setInternalTranslateY] = useState(0);


    const scale = externalScale !== undefined ? externalScale : internalScale;
    const translateX = externalTranslateX !== undefined ? externalTranslateX : internalTranslateX;
    const translateY = externalTranslateY !== undefined ? externalTranslateY : internalTranslateY;

    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const handlePixelAction = (x: number, y: number) => {
        switch (activeTool) {
            case 'pencil': setPixel(x, y, currentColor); break;
            case 'eraser': setPixel(x, y, '#FFFFFF'); break;
            case 'picker': {
                const color = getPixel(x, y);
                if (color) setCurrentColor(color);
                break;
            }
            default: break;
        }
    };

    const getPixelIndexFromEvent = (clientX: number, clientY: number): { x: number; y: number } | null => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const gridRect = gridRef.current?.getBoundingClientRect();
        if (!rect || !gridRect) return null;

        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        const transformedX = (containerX - translateX) / scale;
        const transformedY = (containerY - translateY) / scale;

        const pixelX = Math.floor(transformedX / cellSize);
        const pixelY = Math.floor(transformedY / cellSize);

        if (pixelX >= 0 && pixelX < effectiveWidth && pixelY >= 0 && pixelY < effectiveHeight) {
            return { x: pixelX, y: pixelY };
        }
        return null;
    };

    const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        if (e.button === 2) {
            e.preventDefault();
            setIsPanning(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
            return;
        }

        const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
        if (indices) {
            setIsDrawing(true);
            handlePixelAction(indices.x, indices.y);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isPanning && lastPanPoint) {
            const dx = e.clientX - lastPanPoint.x;
            const dy = e.clientY - lastPanPoint.y;

            const newX = translateX + dx;
            const newY = translateY + dy;

            if (onTranslateXChange) onTranslateXChange(newX);
            else setInternalTranslateX(newX);

            if (onTranslateYChange) onTranslateYChange(newY);
            else setInternalTranslateY(newY);

            setLastPanPoint({ x: e.clientX, y: e.clientY });
            return;
        }

        if (isDrawing) {
            const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
            if (indices) {
                handlePixelAction(indices.x, indices.y);
            }
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 2) {
            setIsPanning(false);
            setLastPanPoint(null);
        } else {
            setIsDrawing(false);
        }
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
        setIsPanning(false);
        setLastPanPoint(null);
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 5);

    
        const newTranslateX = mouseX - (mouseX - translateX) * (newScale / scale);
        const newTranslateY = mouseY - (mouseY - translateY) * (newScale / scale);

        if (onScaleChange) onScaleChange(newScale);
        else setInternalScale(newScale);

        if (onTranslateXChange) onTranslateXChange(newTranslateX);
        else setInternalTranslateX(newTranslateX);

        if (onTranslateYChange) onTranslateYChange(newTranslateY);
        else setInternalTranslateY(newTranslateY);
    };

    
    useEffect(() => {
        const preventContextMenu = (e: Event) => e.preventDefault();
        const el = canvasRef.current;
        if (el) {
            el.addEventListener('contextmenu', preventContextMenu);
        }
        return () => {
            if (el) {
                el.removeEventListener('contextmenu', preventContextMenu);
            }
        };
    }, []);

    return (
        <div
            ref={canvasRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                width: '100%',
                height: '100%',
                cursor: isPanning ? 'grabbing' : 'default',
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={gridRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${effectiveWidth}, ${cellSize}px)`,
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    gap: 0,
                    willChange: 'transform',
                }}
            >
                {Array.from({ length: effectiveHeight }).map((_, y) =>
                    Array.from({ length: effectiveWidth }).map((_, x) => (
                        <Pixel
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            color={pixels[y]?.[x] ?? '#FFFFFF'}
                            size={cellSize}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Canvas;