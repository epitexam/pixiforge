// src/stores/paletteStore.ts
import { create } from 'zustand';

interface PaletteStore {
    colors: string[];
    setColors: (colors: string[]) => void;
    exportPalette: () => void;
    importPalette: (file: File) => Promise<void>;
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

    exportPalette: () => {
        const { colors } = get();
        const data = { name: 'Exported Palette', colors, version: '1.0' };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },
}));