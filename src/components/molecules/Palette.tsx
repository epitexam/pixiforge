import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
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
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 5 L8 8" />
        <path d="M19 5 L16 8" />
        <path d="M5 19 L8 16" />
        <path d="M19 19 L16 16" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    const [tempColor, setTempColor] = useState('#FF0000');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const addColorInputRef = useRef<HTMLInputElement>(null);
    const editColorInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showAddModal && !showEditModal) return;
        const handleTab = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
                if (focusableElements && focusableElements.length) {
                    const first = focusableElements[0] as HTMLElement;
                    const last = focusableElements[focusableElements.length - 1] as HTMLElement;
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleTab);
        return () => window.removeEventListener('keydown', handleTab);
    }, [showAddModal, showEditModal]);

    useEffect(() => {
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                handleOpenAddModal();
            }
        };
        window.addEventListener('keydown', handleGlobalShortcut);
        return () => window.removeEventListener('keydown', handleGlobalShortcut);
    }, []);

    useEffect(() => {
        if (showAddModal && addColorInputRef.current) addColorInputRef.current.focus();
        if (showEditModal && editColorInputRef.current) editColorInputRef.current.focus();
    }, [showAddModal, showEditModal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showAddModal) {
                if (e.key === 'Escape') handleCancelAdd();
                if (e.key === 'Enter') handleConfirmAdd();
            }
            if (showEditModal) {
                if (e.key === 'Escape') handleCancelEdit();
                if (e.key === 'Enter') handleConfirmEdit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAddModal, showEditModal, tempColor, editingIndex]);

    const handleCustomButtonClick = () => colorInputRef.current?.click();
    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => onSelectColor(e.target.value);

    const handleOpenAddModal = () => {
        setTempColor('#FF0000');
        setShowAddModal(true);
    };
    const handleConfirmAdd = () => {
        if (onAddColor) {
            if (colors.includes(tempColor)) {
                toast.warning('Color already in palette');
                return;
            }
            onAddColor(tempColor);
            toast.success('Color added');
        }
        setShowAddModal(false);
    };
    const handleCancelAdd = () => setShowAddModal(false);

    const handleOpenEditModal = (index: number) => {
        setEditingIndex(index);
        setTempColor(colors[index]);
        setShowEditModal(true);
    };
    const handleConfirmEdit = () => {
        if (editingIndex !== null && onUpdateColor) {
            onUpdateColor(editingIndex, tempColor);
            toast.success('Color updated');
        }
        setShowEditModal(false);
        setEditingIndex(null);
    };
    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingIndex(null);
    };

    const handleRemoveColor = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRemoveColor) {
            onRemoveColor(index);
            toast.success('Color removed');
        }
    };

    const handleBackdropClick = (e: React.MouseEvent, modalType: 'add' | 'edit') => {
        if (e.target === e.currentTarget) {
            if (modalType === 'add') handleCancelAdd();
            else handleCancelEdit();
        }
    };

    return (
        <div className={`flex flex-col gap-3 w-full ${className}`}>
            <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <div className="flex flex-wrap gap-2 justify-start">
                    {colors.map((color, index) => (
                        <div key={`${color}-${index}`} className="relative group" style={{ width: swatchSize, height: swatchSize }}>
                            <button
                                onClick={() => onSelectColor(color)}
                                onDoubleClick={() => handleOpenEditModal(index)}
                                className={`w-full h-full rounded-sm transition-all duration-150 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-[#4a9eff] hover:ring-offset-1 hover:ring-offset-[#1a1a1a] ${color === selectedColor ? 'ring-2 ring-[#4a9eff] ring-offset-2 ring-offset-[#1a1a1a] scale-105' : 'ring-1 ring-[#3a3a3a] hover:ring-[#4a9eff]'}`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                                title={`${color} (double-click to edit, right-click to delete)`}
                            />
                            {onRemoveColor && colors.length > 1 && (
                                <button
                                    onClick={(e) => handleRemoveColor(index, e)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                    className="w-full rounded-sm transition-all duration-150 cursor-pointer hover:bg-[#2a2a2a] bg-[#252525] border border-[#3a3a3a] flex items-center justify-center gap-2 py-2 text-[#aaa] hover:text-[#4a9eff]"
                    title="Add custom color (Ctrl+Shift+A)"
                    aria-label="Add color"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span className="text-xs">Add Color</span>
                </button>
            )}

            {showCustomPicker && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2a2a2a]">
                    <span className="text-[9px] text-[#666] uppercase tracking-wider">Custom</span>
                    <button
                        onClick={handleCustomButtonClick}
                        className="w-8 h-8 rounded-md bg-[#252525] border border-[#3a3a3a] hover:border-[#4a9eff] hover:bg-[#2a2a2a] hover:text-[#4a9eff] transition-all duration-150 flex items-center justify-center text-[#aaa]"
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

            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={(e) => handleBackdropClick(e, 'add')}
                >
                    <div ref={modalRef} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 shadow-xl w-96">
                        <h3 className="text-base font-bold text-white mb-2">Add a New Color</h3>
                        <p className="text-xs text-[#888] mb-4">Use the picker below to select a color, then click "Add".</p>
                        <div className="flex items-center gap-4 mb-5">
                            <input
                                ref={addColorInputRef}
                                type="color"
                                value={tempColor}
                                onChange={(e) => setTempColor(e.target.value)}
                                className="w-16 h-16 rounded border-2 border-[#444] cursor-pointer bg-transparent hover:border-[#4a9eff] transition"
                            />
                            <div className="flex-1">
                                <div className="text-xs text-[#888] mb-1">Live Preview</div>
                                <div className="w-full h-10 rounded-md border border-[#333] shadow-inner" style={{ backgroundColor: tempColor }} />
                                <div className="text-[10px] text-[#555] mt-1 font-mono">{tempColor}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleCancelAdd} className="px-4 py-1.5 text-xs font-medium bg-[#252525] border border-[#333] rounded-md hover:bg-[#2a2a2a] text-[#aaa] transition">Cancel</button>
                            <button onClick={handleConfirmAdd} className="px-4 py-1.5 text-xs font-medium bg-[#4a9eff] border border-[#4a9eff] rounded-md hover:bg-[#3a8eff] text-white transition">Add Color</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={(e) => handleBackdropClick(e, 'edit')}
                >
                    <div ref={modalRef} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 shadow-xl w-96">
                        <h3 className="text-base font-bold text-white mb-2">Edit Existing Color</h3>
                        <p className="text-xs text-[#888] mb-4">Adjust the color with the picker, then click "Save".</p>
                        <div className="flex items-center gap-4 mb-5">
                            <input
                                ref={editColorInputRef}
                                type="color"
                                value={tempColor}
                                onChange={(e) => setTempColor(e.target.value)}
                                className="w-16 h-16 rounded border-2 border-[#444] cursor-pointer bg-transparent hover:border-[#4a9eff] transition"
                            />
                            <div className="flex-1">
                                <div className="text-xs text-[#888] mb-1">Live Preview</div>
                                <div className="w-full h-10 rounded-md border border-[#333] shadow-inner" style={{ backgroundColor: tempColor }} />
                                <div className="text-[10px] text-[#555] mt-1 font-mono">{tempColor}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleCancelEdit} className="px-4 py-1.5 text-xs font-medium bg-[#252525] border border-[#333] rounded-md hover:bg-[#2a2a2a] text-[#aaa] transition">Cancel</button>
                            <button onClick={handleConfirmEdit} className="px-4 py-1.5 text-xs font-medium bg-[#4a9eff] border border-[#4a9eff] rounded-md hover:bg-[#3a8eff] text-white transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Palette;