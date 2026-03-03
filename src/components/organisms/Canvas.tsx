import React, { useState, useEffect, useRef } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { Pixel } from '../atoms/Pixel';
import { useCanvasStore } from '../../stores/canvaStore';

export interface CanvasProps {
    width?: number;
    height?: number;
    cellSize?: number;
    className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
    width: propWidth,
    height: propHeight,
    cellSize = 16,
    className = '',
}) => {
    const { width: storeWidth, height: storeHeight, pixels, setPixel, getPixel } = useCanvasStore();
    const { activeTool, currentColor, setCurrentColor } = useToolStore();

    const effectiveWidth = propWidth ?? storeWidth;
    const effectiveHeight = propHeight ?? storeHeight;
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handlePixelAction = (x: number, y: number) => {
        switch (activeTool) {
            case 'pencil': {
                setPixel(x, y, currentColor);
                break;
            }
            case 'eraser': {
                setPixel(x, y, '#FFFFFF');
                break;
            }
            case 'picker': {
                const color = getPixel(x, y);
                if (color) setCurrentColor(color);
                break;
            }
            default:
                break;
        }
    };

    const handleMouseDown = (x: number, y: number) => {
        setIsDrawing(true);
        handlePixelAction(x, y);
    };

    const handleMouseEnter = (x: number, y: number) => {
        if (isDrawing) handlePixelAction(x, y);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDrawing(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    useEffect(() => {
        const preventDrag = (e: Event) => e.preventDefault();
        const el = canvasRef.current;
        if (el) el.addEventListener('dragstart', preventDrag);
        return () => { if (el) el.removeEventListener('dragstart', preventDrag); };
    }, []);

    return (
        <div
            ref={canvasRef}
            className={`select-none ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${effectiveWidth}, ${cellSize}px)`,
                outline: '1px solid rgba(255,255,255,0.06)',
                gap: 0,
            }}
        >
            {Array.from({ length: effectiveHeight }).map((_, y) =>
                Array.from({ length: effectiveWidth }).map((_, x) => {
                    const pixelColor = pixels[y]?.[x] ?? '#FFFFFF';
                    return (
                        <Pixel
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            color={pixelColor}
                            size={cellSize}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                        />
                    );
                })
            )}
        </div>
    );
};

export default Canvas;