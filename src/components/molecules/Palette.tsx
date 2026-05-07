import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Color } from '../../types';
import ColorModal from './ColorModal';

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
    <svg
        className={className}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 5 L8 8" />
        <path d="M19 5 L16 8" />
        <path d="M5 19 L8 16" />
        <path d="M19 19 L16 16" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
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
    swatchSize = 28,
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

    const handleCustomColorChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
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

    const handleRemoveColor = (
        index: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();

        if (!onRemoveColor) return;

        onRemoveColor(index);

        toast.success('Color removed');
    };

    return (
        <div className={`flex flex-col gap-3 w-full ${className}`}>
            <div
                className="max-h-48 overflow-y-auto p-2"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div className="flex flex-wrap gap-2 justify-center items-center">
                    {colors.map((color, index) => (
                        <div
                            key={`${color}-${index}`}
                            className="relative group"
                            style={{
                                width: swatchSize,
                                height: swatchSize,
                            }}
                        >
                            <button
                                onClick={() => onSelectColor(color)}
                                onDoubleClick={() =>
                                    handleOpenEditModal(index)
                                }
                                className={`
                                    w-full h-full rounded-sm transition-all duration-150
                                    cursor-pointer hover:scale-110
                                    hover:ring-2 hover:ring-[#4a9eff]
                                    hover:ring-offset-1 hover:ring-offset-[#1a1a1a]
                                    ${color === selectedColor
                                        ? 'ring-2 ring-[#4a9eff] ring-offset-2 ring-offset-[#1a1a1a] scale-105'
                                        : 'ring-1 ring-[#3a3a3a] hover:ring-[#4a9eff]'
                                    }
                                `}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                                title={`${color} (double-click to edit, right-click to delete)`}
                            />

                            {onRemoveColor && colors.length > 1 && (
                                <button
                                    onClick={(e) =>
                                        handleRemoveColor(index, e)
                                    }
                                    className="
                                        absolute -top-1.5 -right-1.5
                                        w-4 h-4 rounded-full
                                        bg-red-500 text-white
                                        flex items-center justify-center
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity cursor-pointer
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
                        w-full rounded-sm transition-all duration-150
                        cursor-pointer hover:bg-[#2a2a2a]
                        bg-[#252525] border border-[#3a3a3a]
                        flex items-center justify-center gap-2
                        py-2 text-[#aaa] hover:text-[#4a9eff]
                    "
                    title="Add custom color (Ctrl+Shift+A)"
                    aria-label="Add color"
                >
                    <PlusIcon className="w-4 h-4" />

                    <span className="text-xs">Add Color</span>
                </button>
            )}

            {showCustomPicker && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2a2a2a]">
                    <span className="text-[9px] text-[#666] uppercase tracking-wider">
                        Custom
                    </span>

                    <button
                        onClick={handleCustomButtonClick}
                        className="
                            w-8 h-8 rounded-md
                            bg-[#252525] border border-[#3a3a3a]
                            hover:border-[#4a9eff]
                            hover:bg-[#2a2a2a]
                            hover:text-[#4a9eff]
                            transition-all duration-150
                            flex items-center justify-center
                            text-[#aaa]
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