import React, { useRef } from 'react';
import { Color } from '../../types';

export interface PaletteProps {
    colors: Color[];
    selectedColor: Color;
    onSelectColor: (color: Color) => void;
    onAddColor?: (color: Color) => void;
    onRemoveColor?: (index: number) => void;
    onUpdateColor?: (index: number, color: Color) => void;
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

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const Palette: React.FC<PaletteProps> = ({
    colors,
    selectedColor,
    onSelectColor,
    onAddColor,
    onRemoveColor,
    onUpdateColor,
    className = '',
    swatchSize = 24,
    showCustomPicker = true,
}) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const addColorInputRef = useRef<HTMLInputElement>(null);

    const handleCustomButtonClick = () => {
        colorInputRef.current?.click();
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        onSelectColor(newColor);
    };

    const handleAddColor = () => {
        if (addColorInputRef.current) {
            addColorInputRef.current.click();
        }
    };

    const handleAddColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        onAddColor?.(newColor);
    };

    const handleUpdateColor = (index: number) => {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = colors[index];
        input.onchange = (e) => {
            const newColor = (e.target as HTMLInputElement).value;
            onUpdateColor?.(index, newColor);
        };
        input.click();
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
                {colors.map((color, index) => (
                    <div
                        key={`${color}-${index}`}
                        className="relative group flex-none"
                    >
                        <button
                            onClick={() => onSelectColor(color)}
                            onDoubleClick={() => handleUpdateColor(index)}
                            className={`
                                rounded-sm transition-all duration-150 cursor-pointer
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
                            title={`${color} (double-click to edit, right-click to delete)`}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                onRemoveColor?.(index);
                            }}
                        />
                        {onRemoveColor && (
                            <button
                                onClick={() => onRemoveColor(index)}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove color"
                            >
                                <CloseIcon className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>
                ))}
                {onAddColor && (
                    <>
                        <button
                            onClick={handleAddColor}
                            className="flex-none w-8 h-8 rounded-md bg-[#252525] border border-[#3a3a3a] 
                                     hover:border-[#4a9eff] hover:bg-[#2a2a2a] hover:text-[#4a9eff]
                                     transition-all duration-150 flex items-center justify-center text-[#aaa]"
                            title="Add current color to palette"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                        <input
                            ref={addColorInputRef}
                            type="color"
                            value="#FF0000"
                            onChange={handleAddColorChange}
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden="true"
                        />
                    </>
                )}
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