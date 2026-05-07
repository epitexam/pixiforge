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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                ref={modalRef}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 shadow-xl w-96"
            >
                <h3 className="text-base font-bold text-white mb-2">
                    {title}
                </h3>

                <p className="text-xs text-[#888] mb-4">
                    {description}
                </p>

                <div className="flex items-center gap-4 mb-5">
                    <input
                        ref={inputRef}
                        type="color"
                        value={color}
                        onChange={(e) => onChangeColor(e.target.value)}
                        className="w-16 h-16 rounded border-2 border-[#444] cursor-pointer bg-transparent hover:border-[#4a9eff] transition"
                    />

                    <div className="flex-1">
                        <div className="text-xs text-[#888] mb-1">
                            Live Preview
                        </div>

                        <div
                            className="w-full h-10 rounded-md border border-[#333] shadow-inner"
                            style={{ backgroundColor: color }}
                        />

                        <div className="text-[10px] text-[#555] mt-1 font-mono">
                            {color}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-1.5 text-xs font-medium bg-[#252525] border border-[#333] rounded-md hover:bg-[#2a2a2a] text-[#aaa] transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-1.5 text-xs font-medium bg-[#4a9eff] border border-[#4a9eff] rounded-md hover:bg-[#3a8eff] text-white transition"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColorModal;