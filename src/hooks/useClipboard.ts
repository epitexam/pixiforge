import { useCallback } from 'react';
import { toast } from 'sonner';
import { CanvasHandle } from '../components/organisms/canvas/types';

export const useClipboard = (canvasRef: React.RefObject<CanvasHandle | null>) => {
    const handleCopy = useCallback(() => {
        canvasRef.current?.copySelection();
        toast.success('Selection copied');
    }, [canvasRef]);

    const handlePaste = useCallback(() => {
        canvasRef.current?.pasteAtMouse();
        toast.success('Selection pasted');
    }, [canvasRef]);

    return { handleCopy, handlePaste };
};