import { create } from 'zustand';
import { Color } from '../types';

export const DEFAULT_COLOR: Color = '#F0F0F0';
const DEFAULT_WIDTH = 32;
const DEFAULT_HEIGHT = 32;
const DEFAULT_TILE_WIDTH = 16;
const DEFAULT_TILE_HEIGHT = 16;

export interface TileDefinition {
    id: string;
    name: string;
    width: number;
    height: number;
    pixels: Color[];
}

const createEmptyPixels = (width: number, height: number): Color[] => {
    return new Array(width * height).fill(DEFAULT_COLOR);
};

interface CanvasState {
    width: number;
    height: number;
    pixels: Color[];
    tileWidth: number;
    tileHeight: number;
    selectedTile: { col: number; row: number } | null;
    tileModeEnabled: boolean;
    tiles: TileDefinition[];
    activeLibraryTileId: string | null;
}

interface CanvasStore extends CanvasState {
    setPixel: (x: number, y: number, color: Color) => void;
    getPixel: (x: number, y: number) => Color | undefined;
    clearCanvas: () => void;
    resizeCanvas: (width: number, height: number) => void;
    setAllPixels: (pixels: Color[][]) => void;
    setTileSize: (width: number, height: number) => void;
    selectTile: (col: number, row: number) => void;
    setTileMode: (enabled: boolean) => void;
    captureTile: (name?: string) => TileDefinition | null;
    removeTile: (id: string) => void;
    renameTile: (id: string, name: string) => void;
    setActiveLibraryTile: (id: string | null) => void;
    getActiveLibraryTile: () => TileDefinition | null;
    loadTileProject: (tileWidth: number, tileHeight: number, tiles: TileDefinition[]) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    pixels: createEmptyPixels(DEFAULT_WIDTH, DEFAULT_HEIGHT),
    tileWidth: DEFAULT_TILE_WIDTH,
    tileHeight: DEFAULT_TILE_HEIGHT,
    selectedTile: null,
    tileModeEnabled: false,
    tiles: [],
    activeLibraryTileId: null,

    setPixel: (x, y, color) => set((state) => {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return state;
        const index = y * state.width + x;
        const newPixels = [...state.pixels];
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
        return { width, height, pixels: newPixels, selectedTile: null, tileModeEnabled: false };
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
        selectedTile: null,
        tileModeEnabled: false,
    }),

    setTileSize: (width, height) => set(() => {
        return { tileWidth: width, tileHeight: height, selectedTile: null, tileModeEnabled: false };
    }),

    selectTile: (col, row) => set({ selectedTile: { col, row } }),

    setTileMode: (enabled) => set((state) => {
        if (enabled && !state.selectedTile) {
            return { tileModeEnabled: true, selectedTile: { col: 0, row: 0 } };
        }
        return { tileModeEnabled: enabled };
    }),

    captureTile: (name) => {
        const state = get();
        if (!state.selectedTile) return null;
        const { col, row } = state.selectedTile;
        const startX = col * state.tileWidth;
        const startY = row * state.tileHeight;
        if (startX >= state.width || startY >= state.height) return null;

        const width = Math.min(state.tileWidth, state.width - startX);
        const height = Math.min(state.tileHeight, state.height - startY);
        const pixels: Color[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                pixels.push(state.pixels[(startY + y) * state.width + startX + x]);
            }
        }
        const tile: TileDefinition = {
            id: crypto.randomUUID(),
            name: name?.trim() || `Tile ${state.tiles.length + 1}`,
            width,
            height,
            pixels,
        };
        set((current) => ({ tiles: [...current.tiles, tile], activeLibraryTileId: tile.id }));
        return tile;
    },

    removeTile: (id) => set((state) => ({
        tiles: state.tiles.filter((tile) => tile.id !== id),
        activeLibraryTileId: state.activeLibraryTileId === id ? null : state.activeLibraryTileId,
    })),

    renameTile: (id, name) => set((state) => ({
        tiles: state.tiles.map((tile) => tile.id === id ? { ...tile, name: name.trim() || tile.name } : tile),
    })),

    setActiveLibraryTile: (id) => set({ activeLibraryTileId: id }),

    getActiveLibraryTile: () => {
        const state = get();
        return state.tiles.find((tile) => tile.id === state.activeLibraryTileId) ?? null;
    },

    loadTileProject: (tileWidth, tileHeight, tiles) => set({
        tileWidth: Number.isInteger(tileWidth) && tileWidth > 0 ? tileWidth : DEFAULT_TILE_WIDTH,
        tileHeight: Number.isInteger(tileHeight) && tileHeight > 0 ? tileHeight : DEFAULT_TILE_HEIGHT,
        tiles: Array.isArray(tiles) ? tiles : [],
        activeLibraryTileId: null,
        selectedTile: null,
        tileModeEnabled: false,
    }),
}));
