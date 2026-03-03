import { create } from 'zustand';
import { CanvasState, Color } from '../types';

const DEFAULT_COLOR: Color = '#FFFFFF';
const DEFAULT_WIDTH = 32;
const DEFAULT_HEIGHT = 32;

const createEmptyPixels = (width: number, height: number): Color[][] => {
    return Array(height).fill(null).map(() => Array(width).fill(DEFAULT_COLOR));
};

interface CanvasStore extends CanvasState {
    setPixel: (x: number, y: number, color: Color) => void;
    clearCanvas: () => void;
    resizeCanvas: (width: number, height: number) => void;
    setAllPixels: (pixels: Color[][]) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    pixels: createEmptyPixels(DEFAULT_WIDTH, DEFAULT_HEIGHT),

    setPixel: (x, y, color) => set((state) => {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return state;
        const newPixels = state.pixels.map(row => [...row]);
        newPixels[y][x] = color;
        return { pixels: newPixels };
    }),

    clearCanvas: () => set((state) => ({
        pixels: createEmptyPixels(state.width, state.height)
    })),

    resizeCanvas: (width, height) => set((state) => {
        const newPixels = createEmptyPixels(width, height);
        for (let y = 0; y < Math.min(state.height, height); y++) {
            for (let x = 0; x < Math.min(state.width, width); x++) {
                newPixels[y][x] = state.pixels[y][x];
            }
        }
        return { width, height, pixels: newPixels };
    }),

    setAllPixels: (pixels) => set({
        width: pixels[0]?.length || 0,
        height: pixels.length,
        pixels
    }),
}));