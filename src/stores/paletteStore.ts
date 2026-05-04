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
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#C0C0C0', '#808080',
        '#800000', '#808000', '#008000', '#800080', '#008080',
        '#000080', '#FF6600', '#6600FF', '#FF0066', '#00FF66',
        '#993366', '#66CCCC', '#FF99CC', '#CCCC00', '#996633',
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