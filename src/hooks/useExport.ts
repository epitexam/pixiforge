import { toast } from 'sonner';
import { useCanvasStore } from '../stores/canvaStore';
import { CanvasHandle } from '../components/organisms/canvas/types';

export const useExport = (canvasRef: React.RefObject<CanvasHandle | null>) => {
    const exportWithGrid = async () => {
        const canvas = canvasRef.current?.getCanvas();
        if (!canvas) {
            toast.error('Canvas not available');
            return;
        }
        const link = document.createElement('a');
        link.download = 'pixiforge.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('PNG exported with grid');
    };

    const exportWithoutGrid = () => {
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
        const link = document.createElement('a');
        link.download = 'pixiforge_nogrid.png';
        link.href = offscreen.toDataURL('image/png');
        link.click();
        toast.success('PNG exported without grid');
    };

    return { exportWithGrid, exportWithoutGrid };
};