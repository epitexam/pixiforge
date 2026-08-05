import React from 'react';

interface BrushSizeControlProps {
    value: number;
    onChange: (value: number) => void;
}

export const BrushSizeControl: React.FC<BrushSizeControlProps> = ({ value, onChange }) => {
    const previewSize = Math.max(2, value * 2);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Brush Size</span>
                <span className="text-xs text-gray-500 font-mono">{value}px</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-none shadow-inner">
                    <div
                        className="bg-blue-500 rounded-full transition-all duration-150"
                        style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
                    />
                </div>

                <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    aria-label="Brush size"
                    className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
            </div>
        </div>
    );
};

export default BrushSizeControl;