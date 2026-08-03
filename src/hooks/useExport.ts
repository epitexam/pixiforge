import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCanvasStore, DEFAULT_COLOR } from '../stores/canvaStore';
import { CanvasHandle } from '../components/organisms/canvas/types';

export interface ExportOptions {
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
    includeGrid: boolean;
    scale?: number;
    fileName?: string;
}

export const useExport = (canvasRef: React.RefObject<CanvasHandle | null>) => {
    const exportCanvas = useCallback(async (options: ExportOptions) => {
        const {
            format,
            quality = 1,
            includeGrid,
            scale = 1,
            fileName = 'pixiforge'
        } = options;

        const { width, height, pixels: pixels1D, tileWidth, tileHeight } = useCanvasStore.getState();


        const finalWidth = width * scale;
        const finalHeight = height * scale;

        const offscreen = document.createElement('canvas');
        offscreen.width = finalWidth;
        offscreen.height = finalHeight;
        const ctx = offscreen.getContext('2d');

        if (!ctx) {
            toast.error('Failed to create export canvas');
            return;
        }

        ctx.imageSmoothingEnabled = false;


        let currentDrawColor = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const color = pixels1D[index] ?? DEFAULT_COLOR;

                if (color !== currentDrawColor) {
                    ctx.fillStyle = color;
                    currentDrawColor = color;
                }

                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }


        if (includeGrid && scale >= 4) {
            const lineWidth = scale >= 8 ? 1 : 0.5;


            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            for (let y = 0; y <= height; y++) {
                const yPos = y * scale;
                ctx.moveTo(0, yPos);
                ctx.lineTo(finalWidth, yPos);
            }
            for (let x = 0; x <= width; x++) {
                const xPos = x * scale;
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, finalHeight);
            }
            ctx.stroke();

            // Grille des Tiles
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
            ctx.lineWidth = lineWidth * 2;
            ctx.beginPath();
            for (let x = tileWidth; x < width; x += tileWidth) {
                const xPos = x * scale;
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, finalHeight);
            }
            for (let y = tileHeight; y < height; y += tileHeight) {
                const yPos = y * scale;
                ctx.moveTo(0, yPos);
                ctx.lineTo(finalWidth, yPos);
            }
            ctx.stroke();
        }

        const mimeType = `image/${format}`;
        const fileExtension = format === 'jpeg' ? 'jpg' : format;

        // @ts-ignore
        if (window.showSaveFilePicker) {
            try {
                const blob: Blob = await new Promise((resolve) => {
                    offscreen.toBlob((b) => resolve(b as Blob), mimeType, quality);
                });

                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${fileName}.${fileExtension}`,
                    types: [{
                        description: 'Image File',
                        accept: { [mimeType]: [`.${fileExtension}`] },
                    }],
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                toast.success('Image exportée avec succès');
            } catch (err) {

                if (err instanceof DOMException && err.name === 'AbortError') return;
                toast.error("Erreur lors de l'exportation");
            }
        } else {

            const dataUrl = offscreen.toDataURL(mimeType, quality);
            const link = document.createElement('a');
            link.download = `${fileName}.${fileExtension}`;
            link.href = dataUrl;
            link.click();
            toast.success(`Exporté en ${format.toUpperCase()}${includeGrid ? ' avec grille' : ''}`);
        }
    }, []);

    return { exportCanvas };
};