import React from 'react';

export interface ZoomControlsProps {
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    className = '',
}) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={onZoomOut}
                className="w-7 h-7 flex items-center justify-center bg-[#252525] border border-[#333] rounded-sm hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                title="Zoom Out (Ctrl -)"
                aria-label="Zoom out"
            >
                <span className="text-lg font-bold">−</span>
            </button>
            <button
                onClick={onZoomReset}
                className="px-2 h-7 flex items-center justify-center bg-[#252525] border border-[#333] rounded-sm hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] text-xs transition-all"
                title="Reset Zoom (Ctrl 0)"
                aria-label="Reset zoom"
            >
                {Math.round(zoomLevel * 100)}%
            </button>
            <button
                onClick={onZoomIn}
                className="w-7 h-7 flex items-center justify-center bg-[#252525] border border-[#333] rounded-sm hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                title="Zoom In (Ctrl +)"
                aria-label="Zoom in"
            >
                <span className="text-lg font-bold">+</span>
            </button>
        </div>
    );
};