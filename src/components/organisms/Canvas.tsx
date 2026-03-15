import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { Color } from '../../types';
import { DEFAULT_COLOR, useCanvasStore } from '../../stores/canvaStore';

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

    // Dimensions effectives (mémorisées)
    const effectiveWidth = useMemo(() => propWidth ?? storeWidth, [propWidth, storeWidth]);
    const effectiveHeight = useMemo(() => propHeight ?? storeHeight, [propHeight, storeHeight]);

    // Gestion interne du zoom/pan
    const [internalScale, setInternalScale] = useState(1);
    const [internalTranslateX, setInternalTranslateX] = useState(0);
    const [internalTranslateY, setInternalTranslateY] = useState(0);

    const scale = externalScale !== undefined ? externalScale : internalScale;
    const translateX = externalTranslateX !== undefined ? externalTranslateX : internalTranslateX;
    const translateY = externalTranslateY !== undefined ? externalTranslateY : internalTranslateY;

    // États
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
    const [copiedPixels, setCopiedPixels] = useState<Color[][] | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

    // Références
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);

    // --- Rendu des pixels (déclenché par changement de pixels ou de zoom/pan) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redimensionner le canvas physique
        canvas.width = effectiveWidth * cellSize;
        canvas.height = effectiveHeight * cellSize;

        // Appliquer transformation
        ctx.setTransform(scale, 0, 0, scale, translateX, translateY);

        // Dessiner les pixels
        for (let y = 0; y < effectiveHeight; y++) {
            for (let x = 0; x < effectiveWidth; x++) {
                const index = y * effectiveWidth + x;
                const color = pixels[index] ?? DEFAULT_COLOR;
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }, [pixels, effectiveWidth, effectiveHeight, cellSize, scale, translateX]);

    // --- Rendu de la grille (déclenché uniquement par zoom/pan, pas par les pixels) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sauvegarder l'état actuel
        ctx.save();
        // Dessiner la grille en coordonnées écran
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;

        // Lignes horizontales
        for (let y = 0; y <= effectiveHeight; y++) {
            const yPos = y * cellSize * scale + translateY;
            ctx.beginPath();
            ctx.moveTo(translateX, yPos);
            ctx.lineTo(effectiveWidth * cellSize * scale + translateX, yPos);
            ctx.stroke();
        }

        // Lignes verticales
        for (let x = 0; x <= effectiveWidth; x++) {
            const xPos = x * cellSize * scale + translateX;
            ctx.beginPath();
            ctx.moveTo(xPos, translateY);
            ctx.lineTo(xPos, effectiveHeight * cellSize * scale + translateY);
            ctx.stroke();
        }

        ctx.restore();
    }, [effectiveWidth, effectiveHeight, cellSize, scale, translateX, translateY]);

    // --- Conversion des coordonnées ---
    const getPixelIndexFromEvent = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
        const rect = containerRef.current?.getBoundingClientRect();
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

    const isPointInSelection = useCallback((x: number, y: number): boolean => {
        if (!selectionRect) return false;
        const { x: sx, y: sy, width, height } = selectionRect;
        return x >= sx && x < sx + width && y >= sy && y < sy + height;
    }, [selectionRect]);

    // --- Actions sur les pixels ---
    const handlePixelAction = useCallback((x: number, y: number) => {
        switch (activeTool) {
            case 'pencil': setPixel(x, y, currentColor); break;
            case 'eraser': setPixel(x, y, DEFAULT_COLOR); break;
            case 'picker': {
                const color = getPixel(x, y);
                if (color) setCurrentColor(color);
                break;
            }
            default: break;
        }
    }, [activeTool, currentColor, setPixel, getPixel, setCurrentColor]);

    // --- Copier/Coller ---
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
                    const index = py * effectiveWidth + px;
                    row.push(pixels[index]);
                } else {
                    row.push(DEFAULT_COLOR);
                }
            }
            copied.push(row);
        }
        setCopiedPixels(copied);
        console.log('Selection copied', { width, height });
    }, [selectionRect, pixels, effectiveWidth, effectiveHeight]);

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

    useImperativeHandle(ref, () => ({
        copySelection,
        pasteSelection,
        pasteAtMouse,
        hasSelection: () => !!selectionRect,
    }), [copySelection, pasteSelection, pasteAtMouse, selectionRect]);

    // --- Gestionnaires d'événements souris ---
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        const indices = getPixelIndexFromEvent(e.clientX, e.clientY);
        if (!indices) return;

        if (e.button === 2) {
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
    }, [activeTool, getPixelIndexFromEvent, handlePixelAction]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
    }, [isPanning, lastPanPoint, translateX, translateY, onTranslateXChange, onTranslateYChange, activeTool, isSelecting, selectionStart, isDrawing, getPixelIndexFromEvent, handlePixelAction]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
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
    }, [activeTool, isSelecting, selectionStart, selectionEnd, isPointInSelection, getPixelIndexFromEvent]);

    const handleMouseLeave = useCallback(() => {
        setIsDrawing(false);
        setIsPanning(false);
        setIsSelecting(false);
        setLastPanPoint(null);
    }, []);

    // --- Zoom à la molette ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const wheelHandler = (e: globalThis.WheelEvent) => {
            e.preventDefault();

            const rect = container.getBoundingClientRect();
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

        container.addEventListener('wheel', wheelHandler, { passive: false });
        return () => container.removeEventListener('wheel', wheelHandler);
    }, [scale, translateX, translateY, onScaleChange, onTranslateXChange, onTranslateYChange]);

    // --- Raccourcis clavier ---
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

    // --- Mémorisation position souris globale ---
    useEffect(() => {
        const handleMouseMoveGlobal = (e: globalThis.MouseEvent) => {
            lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMoveGlobal);
        return () => window.removeEventListener('mousemove', handleMouseMoveGlobal);
    }, []);

    // --- Empêcher le menu contextuel ---
    useEffect(() => {
        const preventContextMenu = (e: Event) => e.preventDefault();
        const el = containerRef.current;
        if (el) {
            el.addEventListener('contextmenu', preventContextMenu);
        }
        return () => {
            if (el) {
                el.removeEventListener('contextmenu', preventContextMenu);
            }
        };
    }, []);

    // --- Overlays de sélection ---
    const selectionOverlay = useMemo(() => {
        if (!selectionRect) return null;
        const { x, y, width, height } = selectionRect;
        const left = x * cellSize * scale + translateX;
        const top = y * cellSize * scale + translateY;
        const w = width * cellSize * scale;
        const h = height * cellSize * scale;
        return (
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
    }, [selectionRect, cellSize, scale, translateX, translateY]);

    const activeSelectionOverlay = useMemo(() => {
        if (!(activeTool === 'select' && isSelecting && selectionStart && selectionEnd)) return null;
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
        return (
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
    }, [activeTool, isSelecting, selectionStart, selectionEnd, cellSize, scale, translateX, translateY]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                width: '100%',
                height: '100%',
                cursor: isPanning ? 'grabbing' : (activeTool === 'select' ? 'crosshair' : 'default'),
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: effectiveWidth * cellSize,
                    height: effectiveHeight * cellSize,
                }}
            />
            {activeSelectionOverlay}
            {selectionOverlay}
        </div>
    );
});

Canvas.displayName = 'Canvas';

export default Canvas;