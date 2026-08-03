import React, { useEffect, useRef, useState } from 'react';

interface ColorModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    initialColor: string;
    confirmLabel: string;
    onConfirm: (color: string) => void;
    onCancel: () => void;
    onAddToPalette?: (color: string) => void;
    isColorInPalette?: (color: string) => boolean;
}

const ColorModal: React.FC<ColorModalProps> = ({
    isOpen,
    title,
    description,
    initialColor,
    confirmLabel,
    onConfirm,
    onCancel,
    onAddToPalette,
    isColorInPalette,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const hexInputRef = useRef<HTMLInputElement>(null);

    const [localColor, setLocalColor] = useState(initialColor);

    useEffect(() => {
        if (isOpen) {
            setLocalColor(initialColor);
        }
    }, [isOpen, initialColor]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm(localColor);

            if (e.key === 'Tab') {
                const focusableElements =
                    modalRef.current?.querySelectorAll(
                        'button, input, [tabindex]:not([tabindex="-1"])'
                    );

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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, onConfirm, localColor]);

    if (!isOpen) return null;

    const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    const isInPalette = isColorInPalette ? isColorInPalette(localColor) : false;

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (!val.startsWith('#')) val = '#' + val;
        setLocalColor(val.toUpperCase());
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                ref={modalRef}
                className="w-full max-w-sm rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl p-6"
            >
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a]"
                    >
                        ✕
                    </button>
                </div>


                <div className="mb-6 flex gap-4 items-start">

                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#2a2a2a] cursor-pointer group flex-none">
                        <div
                            className="absolute inset-0 transition-colors"
                            style={{ backgroundColor: isValidHex(localColor) ? localColor : '#000000' }}
                        />
                        <input
                            type="color"
                            value={isValidHex(localColor) ? localColor : '#000000'}
                            onChange={(e) => setLocalColor(e.target.value.toUpperCase())}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-1 uppercase tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            Pick
                        </div>
                    </div>


                    <div className="flex-1 flex flex-col gap-2 pt-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Hex Code</label>
                        <input
                            ref={hexInputRef}
                            type="text"
                            value={localColor}
                            onChange={handleHexInputChange}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition"
                            maxLength={7}
                            spellCheck="false"
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <div
                                className="w-4 h-4 rounded border border-[#2a2a2a]"
                                style={{ backgroundColor: isValidHex(localColor) ? localColor : '#000000' }}
                            />
                            <span className="text-xs text-gray-500">
                                {isValidHex(localColor) ? "Valid color" : "Invalid hex code"}
                            </span>
                        </div>
                    </div>
                </div>


                <div className="flex justify-between items-center mt-8 gap-3">
                    <div>
                        {onAddToPalette && (
                            <button
                                onClick={() => onAddToPalette(localColor)}
                                disabled={isInPalette || !isValidHex(localColor)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${isInPalette || !isValidHex(localColor)
                                        ? 'bg-[#1a1a1a] text-gray-600 border border-[#2a2a2a] cursor-not-allowed'
                                        : 'bg-[#1a1a1a] text-blue-400 border border-blue-500/30 hover:bg-blue-500/10'
                                    }`}
                            >
                                {isInPalette ? "Already in palette" : "Add to palette"}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(localColor)}
                            disabled={!isValidHex(localColor)}
                            className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition shadow ${isValidHex(localColor)
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-blue-500/30 cursor-not-allowed'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorModal;