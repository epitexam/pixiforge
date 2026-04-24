import { useEffect } from 'react';
import { DEFAULT_COLOR } from '../../../stores/canvaStore';

interface UseKeyboardSelectionClearProps {
    selectionRect: { x: number; y: number; width: number; height: number } | null;
    setSelectionRect: (rect: null) => void;
    setPixel: (x: number, y: number, color: string) => void;
    effectiveWidth: number;
    effectiveHeight: number;
}

export const useKeyboardSelectionClear = ({
    selectionRect,
    setSelectionRect,
    setPixel,
    effectiveWidth,
    effectiveHeight,
}: UseKeyboardSelectionClearProps) => {
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectionRect) {
                    e.preventDefault();
                    setSelectionRect(null);
                }
            } else if (e.key === 'Delete') {
                if (selectionRect) {
                    e.preventDefault();
                    const { x, y, width, height } = selectionRect;
                    for (let dy = 0; dy < height; dy++) {
                        for (let dx = 0; dx < width; dx++) {
                            const px = x + dx;
                            const py = y + dy;
                            if (px >= 0 && px < effectiveWidth && py >= 0 && py < effectiveHeight) {
                                setPixel(px, py, DEFAULT_COLOR);
                            }
                        }
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectionRect, setSelectionRect, setPixel, effectiveWidth, effectiveHeight]);
};