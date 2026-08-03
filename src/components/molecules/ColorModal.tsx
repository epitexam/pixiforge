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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                ref={modalRef}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl p-4 sm:p-6"
            >

                <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="shrink-0 text-gray-500 hover:text-white transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-300 mb-3">Color Selection</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            ref={inputRef}
                            type="color"
                            value={color}
                            onChange={(e) => onChangeColor(e.target.value)}
                            className="w-16 h-16 shrink-0 rounded-xl border border-[#2a2a2a] cursor-pointer bg-[#1a1a1a] p-1 focus:outline-none focus:border-blue-500 transition"
                        />

                        <div className="w-full flex-1">
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