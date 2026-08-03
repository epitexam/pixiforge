import React, { useEffect, useRef } from 'react';

interface ColorModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    color: string;
    confirmLabel: string;
    onChangeColor: (color: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ColorModal: React.FC<ColorModalProps> = ({
    isOpen,
    title,
    description,
    color,
    confirmLabel,
    onChangeColor,
    onConfirm,
    onCancel,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        inputRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();

            if (e.key === 'Tab') {
                const focusableElements =
                    modalRef.current?.querySelectorAll(
                        'button, input, [tabindex]:not([tabindex="-1"])'
                    );

                if (focusableElements && focusableElements.length) {
                    const first = focusableElements[0] as HTMLElement;
                    const last =
                        focusableElements[
                        focusableElements.length - 1
                        ] as HTMLElement;

                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (
                        !e.shiftKey &&
                        document.activeElement === last
                    ) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onCancel, onConfirm]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                ref={modalRef}
                className="w-full max-w-md rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl p-6"
            >

                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-white transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Zone de sélection de couleur */}
                <div className="mb-6">
                    <p className="text-sm text-gray-300 mb-3">Color Selection</p>
                    <div className="flex items-center gap-4">
                        <input
                            ref={inputRef}
                            type="color"
                            value={color}
                            onChange={(e) => onChangeColor(e.target.value)}
                            className="w-16 h-16 rounded-xl border border-[#2a2a2a] cursor-pointer bg-[#1a1a1a] p-1 focus:outline-none focus:border-blue-500 transition"
                        />

                        <div className="flex-1">
                            <div className="text-sm text-gray-300 mb-2">
                                Live Preview
                            </div>
                            <div
                                className="w-full h-10 rounded-lg border border-[#2a2a2a] shadow-inner transition-colors"
                                style={{ backgroundColor: color }}
                            />
                            <div className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-wider">
                                {color}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex justify-between items-center mt-8">
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-400 hover:text-white transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition shadow"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColorModal;