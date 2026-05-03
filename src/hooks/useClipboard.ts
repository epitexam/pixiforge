import { toast } from 'sonner';
import { CanvasHandle } from '../components/organisms/canvas/types';

export const useClipboard = (canvasRef: React.RefObject<CanvasHandle | null>) => {
    const handleCopy = () => {
        canvasRef.current?.copySelection();
        toast.success('Selection copied');
    };

    const handlePaste = () => {
        canvasRef.current?.pasteAtMouse();
        toast.success('Selection pasted');
    };

    return { handleCopy, handlePaste };
};