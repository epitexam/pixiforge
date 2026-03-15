import { create } from 'zustand';
import { Color } from '../types';

const DEFAULT_COLOR: Color = '#FFFFFF';
const DEFAULT_WIDTH = 32;
const DEFAULT_HEIGHT = 32;

const createEmptyPixels = (width: number, height: number): Color[] => {
    return new Array(width * height).fill(DEFAULT_COLOR);
};

interface CanvasState {
    width: number;
    height: number;
    pixels: Color[]; // tableau 1D (row-major)
}

interface CanvasStore extends CanvasState {
    setPixel: (x: number, y: number, color: Color) => void;
    getPixel: (x: number, y: number) => Color | undefined;
    clearCanvas: () => void;
    resizeCanvas: (width: number, height: number) => void;
    setAllPixels: (pixels: Color[][]) => void; // garde l'interface 2D
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    pixels: createEmptyPixels(DEFAULT_WIDTH, DEFAULT_HEIGHT),

    setPixel: (x, y, color) => set((state) => {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return state;
        const index = y * state.width + x;
        const newPixels = [...state.pixels]; // copie unique du tableau plat
        newPixels[index] = color;
        return { pixels: newPixels };
    }),

    getPixel: (x, y) => {
        const state = get();
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return undefined;
        const index = y * state.width + x;
        return state.pixels[index];
    },

    clearCanvas: () => set((state) => ({
        pixels: createEmptyPixels(state.width, state.height)
    })),

    resizeCanvas: (width, height) => set((state) => {
        const newPixels = createEmptyPixels(width, height);
        const minWidth = Math.min(state.width, width);
        const minHeight = Math.min(state.height, height);
        for (let y = 0; y < minHeight; y++) {
            for (let x = 0; x < minWidth; x++) {
                const oldIndex = y * state.width + x;
                const newIndex = y * width + x;
                newPixels[newIndex] = state.pixels[oldIndex];
            }
        }
        return { width, height, pixels: newPixels };
    }),

    setAllPixels: (pixels2D) => set({
        width: pixels2D[0]?.length || 0,
        height: pixels2D.length,
        pixels: (() => {
            if (!pixels2D.length) return [];
            const w = pixels2D[0].length;
            const h = pixels2D.length;
            const flat = new Array(w * h);
            for (let y = 0; y < h; y++) {
                const row = pixels2D[y];
                for (let x = 0; x < w; x++) {
                    flat[y * w + x] = row[x];
                }
            }
            return flat;
        })(),
    }),
}));