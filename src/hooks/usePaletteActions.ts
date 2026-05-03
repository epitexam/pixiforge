import { toast } from 'sonner';
import { usePaletteStore } from '../stores/paletteStore';

export const usePaletteActions = () => {
    const { exportPalette, importPalette } = usePaletteStore();

    const handleImportPalette = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                await importPalette(file);
                toast.success('Palette imported successfully');
            } catch (err) {
                toast.error('Invalid palette file');
            }
        };
        input.click();
    };

    return { exportPalette, handleImportPalette };
};