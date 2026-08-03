import { useState, useCallback } from 'react';

export const useZoom = () => {
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev * 0.8, 0.2));
    }, []);

    const handleZoomReset = useCallback(() => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
    }, []);

    return {
        scale,
        translateX,
        translateY,
        setScale,
        setTranslateX,
        setTranslateY,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
    };
};