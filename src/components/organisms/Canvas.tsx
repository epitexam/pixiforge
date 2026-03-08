import React, { useState, useEffect, useRef, WheelEvent, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { Pixel } from '../atoms/Pixel';
import { Color } from '../../types';
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

export interface CanvasHandle {
    copySelection: () => void;
    pasteSelection: (x?: number, y?: number) => void;
    pasteAtMouse: () => void;
    hasSelection: () => boolean;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(({
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
}, ref) => {
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

    const [isDrawing, setIsDrawing] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
    const [copiedPixels, setCopiedPixels] = useState<Color[][] | null>(null);

    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Dernière position de la souris pour le collage
    const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);

    // Helper pour convertir les coordonnées écran en indices de pixel
    const getPixelIndexFromEvent = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;

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
    }, [translateX, translateY, scale, cellSize, effectiveWidth, effectiveHeight]);

    // Vérifier si un point est dans le rectangle de sélection
    const isPointInSelection = useCallback((x: number, y: number): boolean => {
        if (!selectionRect) return false;
        const { x: sx, y: sy, width, height } = selectionRect;
        return x >= sx && x < sx + width && y >= sy && y < sy + height;
    }, [selectionRect]);

    // Gestion des actions de dessin
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

    // Copier la sélection
    const copySelection = useCallback(() => {
        if (!selectionRect) {
            console.log('No selection to copy');
            return;
        }
        const { x, y, width, height } = selectionRect;
        const copied: Color[][] = [];
        for (let dy = 0; dy < height; dy++) {
            const row: Color[] = [];
            for (let dx = 0; dx < width; dx++) {
                const px = x + dx;
                const py = y + dy;
                if (px < effectiveWidth && py < effectiveHeight) {
                    row.push(pixels[py][px]);
                } else {
                    row.push('#FFFFFF');
                }
            }
            copied.push(row);
        }
        setCopiedPixels(copied);
        console.log('Selection copied', { width, height });
    }, [selectionRect, pixels, effectiveWidth, effectiveHeight]);

    // Coller la sélection à une position donnée
    const pasteSelection = useCallback((targetX?: number, targetY?: number) => {
        if (!copiedPixels) return;
        let pasteX = targetX;
        let pasteY = targetY;
        if (pasteX === undefined || pasteY === undefined) {
            console.warn('No paste position');
            return;
        }
        const width = copiedPixels[0].length;
        const height = copiedPixels.length;
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const px = pasteX + dx;
                const py = pasteY + dy;
                if (px < effectiveWidth && py < effectiveHeight) {
                    setPixel(px, py, copiedPixels[dy][dx]);
                }
            }
        }
        console.log('Pasted at', pasteX, pasteY);
    }, [copiedPixels, setPixel, effectiveWidth, effectiveHeight]);

    // Coller à la dernière position connue de la souris
    const pasteAtMouse = useCallback(() => {
        if (lastMousePosRef.current) {
            const indices = getPixelIndexFromEvent(lastMousePosRef.current.clientX, lastMousePosRef.current.clientY);
            if (indices) {
                pasteSelection(indices.x, indices.y);
            }
        } else {
            console.warn('No mouse position available for paste');
        }
    }, [getPixelIndexFromEvent, pasteSelection]);

    // Exposer les méthodes via ref
    useImperativeHandle(ref, () => ({
        copySelection,
        pasteSelection: (x, y) => pasteSelection(x, y),
        pasteAtMouse,
        hasSelection: () => !!selectionRect,
    }), [copySelection, pasteSelection, pasteAtMouse, selectionRect]);

    // Gestionnaires d'événements souris React
    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
        if (!indices) return;

        if (e.button === 2) { // Clic droit pour pan
            e.preventDefault();
            setIsPanning(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
            return;
        }

        if (activeTool === 'select') {
            setIsSelecting(true);
            setSelectionStart(indices);
            setSelectionEnd(indices);
        } else {
            setIsDrawing(true);
            handlePixelAction(indices.x, indices.y);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
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

        const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
        if (!indices) return;

        if (activeTool === 'select') {
            if (isSelecting && selectionStart) {
                setSelectionEnd(indices);
            }
        } else if (isDrawing) {
            handlePixelAction(indices.x, indices.y);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.button === 2) {
            setIsPanning(false);
            setLastPanPoint(null);
            return;
        }

        if (activeTool === 'select') {
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
                const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
                if (indices && !isPointInSelection(indices.x, indices.y)) {
                    setSelectionRect(null);
                }
            }
        } else {
            setIsDrawing(false);
        }
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
        setIsPanning(false);
        setIsSelecting(false);
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

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c') {
                    e.preventDefault();
                    copySelection();
                } else if (e.key === 'v') {
                    e.preventDefault();
                    pasteAtMouse();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copySelection, pasteAtMouse]);

    // Mettre à jour la dernière position de la souris globalement
    useEffect(() => {
        const handleMouseMoveGlobal = (e: globalThis.MouseEvent) => {
            lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMoveGlobal);
        return () => window.removeEventListener('mousemove', handleMouseMoveGlobal);
    }, []);

    // Empêcher le menu contextuel
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

    let selectionOverlay = null;
    if (selectionRect) {
        const { x, y, width, height } = selectionRect;
        const left = x * cellSize * scale + translateX;
        const top = y * cellSize * scale + translateY;
        const w = width * cellSize * scale;
        const h = height * cellSize * scale;

        selectionOverlay = (
            <div
                style={{
                    position: 'absolute',
                    left,
                    top,
                    width: w,
                    height: h,
                    border: '2px dashed #4a9eff',
                    backgroundColor: 'rgba(74, 158, 255, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
        );
    }

    let activeSelectionOverlay = null;
    if (activeTool === 'select' && isSelecting && selectionStart && selectionEnd) {
        const start = selectionStart;
        const end = selectionEnd;
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x) + 1;
        const height = Math.abs(end.y - start.y) + 1;

        const left = x * cellSize * scale + translateX;
        const top = y * cellSize * scale + translateY;
        const w = width * cellSize * scale;
        const h = height * cellSize * scale;

        activeSelectionOverlay = (
            <div
                style={{
                    position: 'absolute',
                    left,
                    top,
                    width: w,
                    height: h,
                    border: '2px solid #4a9eff',
                    backgroundColor: 'rgba(74, 158, 255, 0.2)',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
        );
    }

    return (
        <div
            ref={canvasRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                width: '100%',
                height: '100%',
                cursor: isPanning ? 'grabbing' : (activeTool === 'select' ? 'crosshair' : 'default'),
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
            {activeSelectionOverlay}
            {selectionOverlay}
        </div>
    );
});

Canvas.displayName = 'Canvas';

export default Canvas;