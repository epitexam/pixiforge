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

export interface LayerDefinition {
    id: string;
    name: string;
    visible: boolean;
    pixels: Color[];
}

interface CanvasSnapshot {
    width: number;
    height: number;
    pixels: Color[];
    tileWidth: number;
    tileHeight: number;
    selectedTile: { col: number; row: number } | null;
    tileModeEnabled: boolean;
    tiles: TileDefinition[];
    activeLibraryTileId: string | null;
    layers: LayerDefinition[];
    activeLayerId: string | null;
}

const createEmptyPixels = (width: number, height: number, fill: Color = DEFAULT_COLOR): Color[] => {
    return new Array(width * height).fill(fill);
};

const MAX_HISTORY = 100;

const cloneLayer = (layer: LayerDefinition): LayerDefinition => ({ ...layer, pixels: [...layer.pixels] });

const composePixels = (width: number, height: number, layers: LayerDefinition[]): Color[] => {
    const composite = createEmptyPixels(width, height, DEFAULT_COLOR);
    layers.forEach((layer) => {
        if (!layer.visible) return;
        layer.pixels.forEach((color, index) => {
            if (color !== DEFAULT_COLOR) {
                composite[index] = color;
            }
        });
    });
    return composite;
};

const createCanvasSnapshot = (state: CanvasState): CanvasSnapshot => ({
    width: state.width,
    height: state.height,
    pixels: [...state.pixels],
    tileWidth: state.tileWidth,
    tileHeight: state.tileHeight,
    selectedTile: state.selectedTile ? { ...state.selectedTile } : null,
    tileModeEnabled: state.tileModeEnabled,
    tiles: state.tiles.map((tile) => ({ ...tile, pixels: [...tile.pixels] })),
    activeLibraryTileId: state.activeLibraryTileId,
    layers: state.layers.map(cloneLayer),
    activeLayerId: state.activeLayerId,
});

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
    layers: LayerDefinition[];
    activeLayerId: string | null;
    past: CanvasSnapshot[];
    future: CanvasSnapshot[];
    pendingActionSnapshot: CanvasSnapshot | null;
    pendingActionDirty: boolean;
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
    createNewProject: (options: { width: number; height: number; tileWidth: number; tileHeight: number; backgroundColor: Color }) => void;
    fillArea: (x: number, y: number, color: Color, canEditPixel?: (x: number, y: number) => boolean) => void;
    beginAction: () => void;
    commitAction: () => void;
    undo: () => void;
    redo: () => void;
    addLayer: (name?: string) => void;
    removeLayer: (id: string) => void;
    toggleLayerVisibility: (id: string) => void;
    setActiveLayer: (id: string | null) => void;
    setLayerName: (id: string, name: string) => void;
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
    layers: [{ id: crypto.randomUUID(), name: 'Layer 1', visible: true, pixels: createEmptyPixels(DEFAULT_WIDTH, DEFAULT_HEIGHT) }],
    activeLayerId: null,
    past: [],
    future: [],
    pendingActionSnapshot: null,
    pendingActionDirty: false,

    setPixel: (x, y, color) => set((state) => {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return state;
        const activeLayer = state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0];
        if (!activeLayer) return state;
        const index = y * state.width + x;
        if (activeLayer.pixels[index] === color) return state;
        const nextLayers = state.layers.map((layer) => layer.id === activeLayer.id ? cloneLayer(layer) : layer);
        const targetLayer = nextLayers.find((layer) => layer.id === activeLayer.id);
        if (!targetLayer) return state;
        targetLayer.pixels[index] = color;
        const nextPixels = composePixels(state.width, state.height, nextLayers);
        if (state.pendingActionSnapshot) {
            return {
                pixels: nextPixels,
                layers: nextLayers,
                pendingActionDirty: true,
            };
        }
        return {
            pixels: nextPixels,
            layers: nextLayers,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
        };
    }),

    getPixel: (x, y) => {
        const state = get();
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return undefined;
        const index = y * state.width + x;
        return state.pixels[index];
    },

    clearCanvas: () => set((state) => {
        const blankPixels = createEmptyPixels(state.width, state.height);
        const layers = state.layers.map((layer) => ({ ...layer, pixels: createEmptyPixels(state.width, state.height) }));
        return {
            pixels: blankPixels,
            layers,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    resizeCanvas: (width, height) => set((state) => {
        const resizedLayers = state.layers.map((layer) => {
            const resizedPixels = createEmptyPixels(width, height);
            const minWidth = Math.min(state.width, width);
            const minHeight = Math.min(state.height, height);
            for (let y = 0; y < minHeight; y++) {
                for (let x = 0; x < minWidth; x++) {
                    const oldIndex = y * state.width + x;
                    const newIndex = y * width + x;
                    resizedPixels[newIndex] = layer.pixels[oldIndex];
                }
            }
            return { ...layer, pixels: resizedPixels };
        });

        return {
            width,
            height,
            pixels: composePixels(width, height, resizedLayers),
            selectedTile: null,
            tileModeEnabled: false,
            layers: resizedLayers,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    setAllPixels: (pixels2D) => set((state) => {
        const width = pixels2D[0]?.length || 0;
        const height = pixels2D.length;
        const flat = (() => {
            if (!pixels2D.length) return [];
            const output = new Array(width * height);
            for (let y = 0; y < height; y++) {
                const row = pixels2D[y];
                for (let x = 0; x < width; x++) {
                    output[y * width + x] = row[x];
                }
            }
            return output;
        })();
        const layer: LayerDefinition = {
            id: crypto.randomUUID(),
            name: 'Layer 1',
            visible: true,
            pixels: flat,
        };
        return {
            width,
            height,
            pixels: composePixels(width, height, [layer]),
            selectedTile: null,
            tileModeEnabled: false,
            layers: [layer],
            activeLayerId: layer.id,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
        };
    }),

    setTileSize: (width, height) => set((state) => ({
        tileWidth: width,
        tileHeight: height,
        selectedTile: null,
        tileModeEnabled: false,
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
    })),

    selectTile: (col, row) => set((state) => ({
        selectedTile: { col, row },
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
        pendingActionSnapshot: null,
        pendingActionDirty: false,
    })),

    setTileMode: (enabled) => set((state) => {
        if (enabled && !state.selectedTile) {
            return {
                tileModeEnabled: true,
                selectedTile: { col: 0, row: 0 },
                past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
                future: [],
                pendingActionSnapshot: null,
                pendingActionDirty: false,
            };
        }
        return {
            tileModeEnabled: enabled,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
        };
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
        set((current) => ({
            tiles: [...current.tiles, tile],
            activeLibraryTileId: tile.id,
            past: [...current.past, createCanvasSnapshot(current)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        }));
        return tile;
    },

    removeTile: (id) => set((state) => ({
        tiles: state.tiles.filter((tile) => tile.id !== id),
        activeLibraryTileId: state.activeLibraryTileId === id ? null : state.activeLibraryTileId,
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
    })),

    renameTile: (id, name) => set((state) => ({
        tiles: state.tiles.map((tile) => tile.id === id ? { ...tile, name: name.trim() || tile.name } : tile),
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
    })),

    setActiveLibraryTile: (id) => set((state) => ({
        activeLibraryTileId: id,
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
        pendingActionSnapshot: null,
        pendingActionDirty: false,
    })),

    getActiveLibraryTile: () => {
        const state = get();
        return state.tiles.find((tile) => tile.id === state.activeLibraryTileId) ?? null;
    },

    loadTileProject: (tileWidth, tileHeight, tiles) => set((state) => ({
        tileWidth: Number.isInteger(tileWidth) && tileWidth > 0 ? tileWidth : DEFAULT_TILE_WIDTH,
        tileHeight: Number.isInteger(tileHeight) && tileHeight > 0 ? tileHeight : DEFAULT_TILE_HEIGHT,
        tiles: Array.isArray(tiles) ? tiles : [],
        activeLibraryTileId: null,
        selectedTile: null,
        tileModeEnabled: false,
        past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        future: [],
        pendingActionSnapshot: null,
        pendingActionDirty: false,
    })),

    createNewProject: ({ width, height, tileWidth, tileHeight, backgroundColor }) => set((state) => {
        const layerPixels = createEmptyPixels(width, height, backgroundColor);
        const layer: LayerDefinition = {
            id: crypto.randomUUID(),
            name: 'Layer 1',
            visible: true,
            pixels: layerPixels,
        };
        return {
            width: Number.isInteger(width) && width > 0 ? width : DEFAULT_WIDTH,
            height: Number.isInteger(height) && height > 0 ? height : DEFAULT_HEIGHT,
            pixels: composePixels(width, height, [layer]),
            tileWidth: Number.isInteger(tileWidth) && tileWidth > 0 ? tileWidth : DEFAULT_TILE_WIDTH,
            tileHeight: Number.isInteger(tileHeight) && tileHeight > 0 ? tileHeight : DEFAULT_TILE_HEIGHT,
            tiles: [],
            activeLibraryTileId: null,
            selectedTile: null,
            tileModeEnabled: false,
            layers: [layer],
            activeLayerId: layer.id,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    fillArea: (x, y, color, canEditPixel) => set((state) => {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return state;
        const activeLayer = state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0];
        if (!activeLayer) return state;
        const startIndex = y * state.width + x;
        const targetColor = activeLayer.pixels[startIndex];
        if (targetColor === color) return state;

        const nextLayers = state.layers.map((layer) => layer.id === activeLayer.id ? cloneLayer(layer) : layer);
        const targetLayer = nextLayers.find((layer) => layer.id === activeLayer.id);
        if (!targetLayer) return state;
        const newPixels = [...targetLayer.pixels];
        const visited = new Uint8Array(state.width * state.height);
        const stack: number[] = [startIndex];
        visited[startIndex] = 1;

        let changed = 0;
        while (stack.length) {
            const index = stack.pop()!;
            const pixelColor = newPixels[index];
            if (pixelColor !== targetColor) continue;

            const pixelX = index % state.width;
            const pixelY = Math.floor(index / state.width);
            if (canEditPixel && !canEditPixel(pixelX, pixelY)) continue;

            newPixels[index] = color;
            changed += 1;

            if (pixelX > 0) {
                const leftIndex = index - 1;
                if (!visited[leftIndex] && newPixels[leftIndex] === targetColor) {
                    visited[leftIndex] = 1;
                    stack.push(leftIndex);
                }
            }
            if (pixelX < state.width - 1) {
                const rightIndex = index + 1;
                if (!visited[rightIndex] && newPixels[rightIndex] === targetColor) {
                    visited[rightIndex] = 1;
                    stack.push(rightIndex);
                }
            }
            if (pixelY > 0) {
                const upIndex = index - state.width;
                if (!visited[upIndex] && newPixels[upIndex] === targetColor) {
                    visited[upIndex] = 1;
                    stack.push(upIndex);
                }
            }
            if (pixelY < state.height - 1) {
                const downIndex = index + state.width;
                if (!visited[downIndex] && newPixels[downIndex] === targetColor) {
                    visited[downIndex] = 1;
                    stack.push(downIndex);
                }
            }
        }

        if (!changed) return state;
        targetLayer.pixels = newPixels;
        const nextPixels = composePixels(state.width, state.height, nextLayers);

        if (state.pendingActionSnapshot) {
            return {
                pixels: nextPixels,
                layers: nextLayers,
                pendingActionDirty: true,
            };
        }

        return {
            pixels: nextPixels,
            layers: nextLayers,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
        };
    }),

    beginAction: () => set((state) => {
        if (state.pendingActionSnapshot) return state;
        return {
            pendingActionSnapshot: createCanvasSnapshot(state),
            pendingActionDirty: false,
        };
    }),

    commitAction: () => set((state) => {
        if (!state.pendingActionSnapshot) return state;
        return {
            pendingActionSnapshot: null,
            pendingActionDirty: false,
            past: state.pendingActionDirty ? [...state.past, state.pendingActionSnapshot].slice(-MAX_HISTORY) : state.past,
            future: [],
        };
    }),

    addLayer: (name) => set((state) => {
        const newLayer: LayerDefinition = {
            id: crypto.randomUUID(),
            name: name?.trim() || `Layer ${state.layers.length + 1}`,
            visible: true,
            pixels: createEmptyPixels(state.width, state.height, DEFAULT_COLOR),
        };
        const nextLayers = [...state.layers, newLayer];
        return {
            pixels: composePixels(state.width, state.height, nextLayers),
            layers: nextLayers,
            activeLayerId: newLayer.id,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    removeLayer: (id) => set((state) => {
        if (state.layers.length <= 1) return state;
        const nextLayers = state.layers.filter((layer) => layer.id !== id);
        const nextActiveId = state.activeLayerId === id ? nextLayers[0]?.id ?? null : state.activeLayerId;
        return {
            pixels: composePixels(state.width, state.height, nextLayers),
            layers: nextLayers,
            activeLayerId: nextActiveId,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: [],
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    toggleLayerVisibility: (id) => set((state) => {
        const nextLayers = state.layers.map((layer) => layer.id === id ? { ...layer, visible: !layer.visible } : layer);
        return {
            pixels: composePixels(state.width, state.height, nextLayers),
            layers: nextLayers,
            pendingActionSnapshot: null,
            pendingActionDirty: false,
        };
    }),

    setActiveLayer: (id) => set({ activeLayerId: id }),

    setLayerName: (id, name) => set((state) => ({
        layers: state.layers.map((layer) => layer.id === id ? { ...layer, name: name.trim() || layer.name } : layer),
    })),

    undo: () => set((state) => {
        if (!state.past.length) return state;
        const previousSnapshot = state.past[state.past.length - 1];
        return {
            ...previousSnapshot,
            past: state.past.slice(0, -1),
            future: [...state.future, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
        };
    }),

    redo: () => set((state) => {
        if (!state.future.length) return state;
        const nextSnapshot = state.future[state.future.length - 1];
        return {
            ...nextSnapshot,
            past: [...state.past, createCanvasSnapshot(state)].slice(-MAX_HISTORY),
            future: state.future.slice(0, -1),
        };
    }),
}));
