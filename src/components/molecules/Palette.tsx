import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Color } from '../../types';
import ColorModal from './ColorModal';
import { CloseIcon, CustomColorIcon, PlusIcon } from '../atoms/PaletteIcons';

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

export const Palette: React.FC<PaletteProps> = ({
    colors,
    selectedColor,
    onSelectColor,
    onAddColor,
    onRemoveColor,
    onUpdateColor,
    className = '',
    swatchSize = 32,
    showCustomPicker = true,
}) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [tempColor, setTempColor] = useState('#FF0000');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                handleOpenAddModal();
            }
        };

        window.addEventListener('keydown', handleGlobalShortcut);

        return () => {
            window.removeEventListener('keydown', handleGlobalShortcut);
        };
    }, []);

    const handleCustomButtonClick = () => {
        colorInputRef.current?.click();
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectColor(e.target.value);
    };

    const handleOpenAddModal = () => {
        setTempColor('#FF0000');
        setShowAddModal(true);
    };

    const handleConfirmAdd = () => {
        if (!onAddColor) return;

        if (colors.includes(tempColor)) {
            toast.warning('Color already in palette');
            return;
        }

        onAddColor(tempColor);
        toast.success('Color added');
        setShowAddModal(false);
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
    };

    const handleOpenEditModal = (index: number) => {
        setEditingIndex(index);
        setTempColor(colors[index]);
        setShowEditModal(true);
    };

    const handleConfirmEdit = () => {
        if (editingIndex === null || !onUpdateColor) return;

        onUpdateColor(editingIndex, tempColor);
        toast.success('Color updated');
        setShowEditModal(false);
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingIndex(null);
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
                className="max-h-[min(48rem, 120vh)] overflow-y-auto p-2 -m-2"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-2 justify-items-center">
                    {colors.map((color, index) => (
                        <div
                            key={`${color}-${index}`}
                            className="relative group"
                            style={{ width: swatchSize, height: swatchSize }}
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
                                title={`${color} (double-click to edit, right-click to delete)`}
                            />

                            {onRemoveColor && colors.length > 1 && (
                                <button
                                    onClick={(e) => handleRemoveColor(index, e)}
                                    className="
                                        absolute -top-1.5 -right-1.5
                                        w-4 h-4 rounded-full
                                        bg-red-500 text-white
                                        flex items-center justify-center
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity cursor-pointer
                                        hover:bg-red-400
                                    "
                                    aria-label="Remove color"
                                >
                                    <CloseIcon className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {onAddColor && (
                <button
                    onClick={handleOpenAddModal}
                    className="
                        w-full rounded-xl transition-all duration-150
                        cursor-pointer hover:border-blue-500 hover:text-blue-400
                        bg-[#1a1a1a] border border-[#2a2a2a]
                        flex items-center justify-center gap-2
                        py-2.5 text-gray-400 text-sm font-medium
                    "
                    title="Add custom color (Ctrl+Shift+A)"
                    aria-label="Add color"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Color</span>
                </button>
            )}

            {showCustomPicker && (
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2a2a2a]">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        Custom
                    </span>

                    <button
                        onClick={handleCustomButtonClick}
                        className="
                            w-9 h-9 rounded-lg
                            bg-[#1a1a1a] border border-[#2a2a2a]
                            hover:border-blue-500 hover:text-blue-400
                            transition-all duration-150
                            flex items-center justify-center
                            text-gray-400
                        "
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
                </div>
            )}

            <ColorModal
                isOpen={showAddModal}
                title="Add a New Color"
                description='Use the picker below to select a color, then click "Add".'
                color={tempColor}
                confirmLabel="Add Color"
                onChangeColor={setTempColor}
                onConfirm={handleConfirmAdd}
                onCancel={handleCancelAdd}
            />

            <ColorModal
                isOpen={showEditModal}
                title="Edit Existing Color"
                description='Adjust the color with the picker, then click "Save".'
                color={tempColor}
                confirmLabel="Save Changes"
                onChangeColor={setTempColor}
                onConfirm={handleConfirmEdit}
                onCancel={handleCancelEdit}
            />
        </div>
    );
};

export default Palette;