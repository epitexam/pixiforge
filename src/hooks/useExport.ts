import { toast } from 'sonner';
import { useCanvasStore } from '../stores/canvaStore';
import { CanvasHandle } from '../components/organisms/canvas/types';

export interface ExportOptions {
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
    includeGrid: boolean;
}

export const useExport = (canvasRef: React.RefObject<CanvasHandle | null>) => {
    const exportCanvas = async (options: ExportOptions) => {
        const { format, quality = 1, includeGrid } = options;
        let dataUrl: string | null = null;

        if (includeGrid) {
            const canvas = canvasRef.current?.getCanvas();
            if (!canvas) {
                toast.error('Canvas not available');
                return;
            }
            dataUrl = canvas.toDataURL(`image/${format}`, quality);
        } else {
            const { width, height, pixels: pixels1D } = useCanvasStore.getState();
            const cellSize = 16;
            const offscreen = document.createElement('canvas');
            offscreen.width = width * cellSize;
            offscreen.height = height * cellSize;
            const ctx = offscreen.getContext('2d');
            if (!ctx) {
                toast.error('Failed to create export canvas');
                return;
            }
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = y * width + x;
                    const color = pixels1D[index] ?? '#F0F0F0';
                    ctx.fillStyle = color;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
            dataUrl = offscreen.toDataURL(`image/${format}`, quality);
        }

        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `pixiforge.${format}`;
            link.href = dataUrl;
            link.click();
            toast.success(`Exported as ${format.toUpperCase()}${includeGrid ? ' with grid' : ''}`);
        }
    };

    return { exportCanvas };
};