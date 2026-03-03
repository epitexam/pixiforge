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
                className="flex overflow-x-auto pb-1 gap-1"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4a4a4a #1e1e1e',
                }}
            >
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => onSelectColor(color)}
                        className={`
                            flex-none rounded-sm transition-all duration-100 cursor-pointer
                            hover:scale-110 hover:ring-2 hover:ring-[#4a9eff] hover:ring-offset-1 hover:ring-offset-[#161616]
                            ${color === selectedColor ? 'ring-2 ring-[#4a9eff] ring-offset-2 ring-offset-[#161616] scale-110' : ''}
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
                        className="flex-none w-7 h-7 rounded-sm bg-[#252525] border border-[#333] 
                                 hover:border-[#4a9eff] hover:bg-[#2a2a2a] transition-all duration-100
                                 flex items-center justify-center text-[#aaa] hover:text-[#4a9eff]"
                        title="Choose custom color"
                        aria-label="Custom color"
                    >
                        <span className="text-sm font-bold">+</span>
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