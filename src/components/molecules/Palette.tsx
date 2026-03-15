import React, { useRef } from 'react';
import { Color } from '../../types';

export interface PaletteProps {
    colors: Color[];
    selectedColor: Color;
    onSelectColor: (color: Color) => void;
    className?: string;
    swatchSize?: number;
    showCustomPicker?: boolean;
}

const CustomColorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 5 L8 8" />
        <path d="M19 5 L16 8" />
        <path d="M5 19 L8 16" />
        <path d="M19 19 L16 16" />
    </svg>
);

export const Palette: React.FC<PaletteProps> = ({
    colors,
    selectedColor,
    onSelectColor,
    className = '',
    swatchSize = 24,
    showCustomPicker = true,
}) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleCustomButtonClick = () => {
        colorInputRef.current?.click();
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        onSelectColor(newColor);
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                className="flex overflow-x-auto gap-1 py-1 px-0.5 rounded-sm"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4a4a4a #2a2a2a',
                }}
            >
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => onSelectColor(color)}
                        className={`
                            flex-none rounded-sm transition-all duration-150 cursor-pointer
                            hover:scale-110 hover:ring-2 hover:ring-[#4a9eff] hover:ring-offset-1 hover:ring-offset-[#1a1a1a]
                            ${color === selectedColor 
                                ? 'ring-2 ring-[#4a9eff] ring-offset-2 ring-offset-[#1a1a1a] scale-110' 
                                : 'ring-1 ring-[#3a3a3a] hover:ring-[#4a9eff]'
                            }
                        `}
                        style={{
                            width: swatchSize,
                            height: swatchSize,
                            backgroundColor: color,
                        }}
                        aria-label={`Select color ${color}`}
                        title={color}
                    />
                ))}
            </div>

            {showCustomPicker && (
                <>
                    <div className="w-px h-6 bg-[#2a2a2a] flex-none" />

                    <button
                        onClick={handleCustomButtonClick}
                        className="flex-none w-8 h-8 rounded-md bg-[#252525] border border-[#3a3a3a] 
                                 hover:border-[#4a9eff] hover:bg-[#2a2a2a] hover:text-[#4a9eff]
                                 transition-all duration-150 flex items-center justify-center text-[#aaa]"
                        title="Choose custom color"
                        aria-label="Custom color"
                    >
                        <CustomColorIcon className="w-4 h-4" />
                    </button>

                    <input
                        ref={colorInputRef}
                        type="color"
                        value={selectedColor}
                        onChange={handleCustomColorChange}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                </>
            )}
        </div>
    );
};

export default Palette;