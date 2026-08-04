import React, { useState } from 'react';
import { toast } from 'sonner';
import { Color } from '../../types';
import ColorModal from './ColorModal';
import { CloseIcon } from '../atoms/PaletteIcons';

export interface PaletteProps {
    colors: Color[];
    selectedColor: Color;
    onSelectColor: (color: Color) => void;
    onRemoveColor?: (index: number) => void;
    onUpdateColor?: (index: number, color: Color) => void;
    className?: string;
    swatchSize?: number;
}

export const Palette: React.FC<PaletteProps> = ({
    colors,
    selectedColor,
    onSelectColor,
    onRemoveColor,
    onUpdateColor,
    className = '',
    swatchSize = 32,
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleOpenEditModal = (index: number) => {
        setEditingIndex(index);
        setShowEditModal(true);
    };

    const handleRemoveColor = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onRemoveColor) return;
        onRemoveColor(index);
        toast.success('Color removed');
    };

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>

            <div
                className="max-h-[35vh] lg:max-h-[45vh] overflow-y-auto overflow-x-hidden p-2 -m-2"
                style={{ scrollbarWidth: 'thin' }}
            >

                <div className="grid gap-2 justify-items-center" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${swatchSize}px, 1fr))` }}>
                    {colors.map((color, index) => (
                        <div
                            key={`${color}-${index}`}
                            className="relative group w-full aspect-square"
                        >
                            <button
                                onClick={() => onSelectColor(color)}
                                onDoubleClick={() => handleOpenEditModal(index)}
                                className={`
                                    w-full h-full rounded-lg transition-all duration-150
                                    cursor-pointer hover:scale-110
                                    ${color === selectedColor
                                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#111] scale-105'
                                        : 'ring-1 ring-[#2a2a2a] hover:ring-blue-500'
                                    }
                                `}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                                title={`${color} (double-click to edit)`}
                            />

                            {onRemoveColor && colors.length > 1 && (
                                <button
                                    onClick={(e) => handleRemoveColor(index, e)}
                                    className="
                                        absolute -top-1.5 -right-1.5
                                        w-5 h-5 rounded-full
                                        bg-red-500 text-white
                                        flex items-center justify-center
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity cursor-pointer
                                        hover:bg-red-400 z-10
                                    "
                                    aria-label="Remove color"
                                >
                                    <CloseIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ColorModal
                isOpen={showEditModal}
                title="Edit Existing Color"
                description='Adjust the color with the picker, then click "Save".'
                initialColor={editingIndex !== null ? colors[editingIndex] : '#FF0000'}
                confirmLabel="Save Changes"
                onConfirm={(newColor) => {
                    if (editingIndex !== null && onUpdateColor) {
                        onUpdateColor(editingIndex, newColor);
                        toast.success('Color updated');
                        setShowEditModal(false);
                        setEditingIndex(null);
                    }
                }}
                onCancel={() => {
                    setShowEditModal(false);
                    setEditingIndex(null);
                }}
            />
        </div>
    );
};

export default Palette;
