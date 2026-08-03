import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

interface PaletteStore {
    colors: string[];
    setColors: (colors: string[]) => void;
    exportPalette: () => Promise<void>;
    importPalette: (file: File) => Promise<void>;
    addColor: (color: string) => void;
    removeColor: (index: number) => void;
    updateColor: (index: number, color: string) => void;
}

const isValidHex = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
};

export const usePaletteStore = create<PaletteStore>((set, get) => ({
    colors: [
        '#0d0405', '#1a0a1a', '#2c1320', '#3e2731',
        '#571f2e', '#733e39', '#8f4844', '#a55b4b',
        '#b86f50', '#c98058', '#e4a672', '#ead4aa',
        '#d77643', '#be4a2f', '#a22633', '#e43b44',
        '#f77622', '#fa9a4d', '#feae34', '#fee761',
        '#f9c22b', '#e6c229', '#9e9c1d', '#63c74d',
        '#3e8948', '#265c42', '#193c3e', '#0e2a35',
        '#124e89', '#0868ab', '#0099db', '#2ce8f5',
        '#8bf0f0', '#c0cbdc', '#8b9bb4', '#5a6988',
        '#3a4466', '#262b44', '#181425', '#100c1c',
        '#3a3859', '#565575', '#7b79a1', '#a5a2c6',
        '#d5d5e8', '#ffffff', '#ff0044', '#c93038',
        '#68386c', '#8a4a8f', '#b55088', '#d16ba5',
        '#f6757a', '#f9a9a0', '#e8b796', '#c28569',
        '#9e6b4a', '#7a5038', '#573f2e', '#3a2a20',
        '#2a1e17', '#4f3b26', '#7a5c3d', '#a58259',
    ],

    setColors: (colors) => set({ colors }),

    exportPalette: async () => {
        const { colors } = get();
        const data = { name: 'Exported Palette', colors, version: '1.0' };
        const json = JSON.stringify(data, null, 2);
        try {
            const savedPath = await invoke<string>('save_file', {
                content: json,
                defaultPath: 'palette.json',
            });
            toast.success(`Palette exported to ${savedPath}`);
        } catch (error) {
            console.error('Export palette failed:', error);
            toast.error('Failed to export palette');
        }
    },

    importPalette: async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const parsed = JSON.parse(content);
                    let newColors: string[] = [];
                    if (Array.isArray(parsed)) {
                        newColors = parsed;
                    } else if (parsed.colors && Array.isArray(parsed.colors)) {
                        newColors = parsed.colors;
                    } else {
                        throw new Error('Invalid palette format');
                    }
                    const validColors = newColors.filter(c => isValidHex(c));
                    if (validColors.length === 0) throw new Error('No valid colors found');
                    set({ colors: validColors });
                    toast.success('Palette imported successfully');
                    resolve();
                } catch (err) {
                    toast.error('Invalid palette file');
                    reject(err);
                }
            };
            reader.onerror = () => {
                toast.error('Failed to read file');
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    },

    addColor: (color) => set((state) => {
        if (!isValidHex(color)) return state;
        if (state.colors.includes(color)) return state;
        return { colors: [...state.colors, color] };
    }),

    removeColor: (index) => set((state) => {
        if (state.colors.length <= 1) return state;
        return { colors: state.colors.filter((_, i) => i !== index) };
    }),

    updateColor: (index, color) => set((state) => {
        if (!isValidHex(color)) return state;
        const newColors = [...state.colors];
        newColors[index] = color;
        return { colors: newColors };
    }),
}));