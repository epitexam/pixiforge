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

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isCentered, setIsCentered] = useState(true);

    const dragStart = useRef({ mouseX: 0, mouseY: 0, modalX: 0, modalY: 0, width: 0, height: 0 });

    const [localColor, setLocalColor] = useState(initialColor);

    useEffect(() => {
        if (isOpen) {
            setLocalColor(initialColor);
            setIsCentered(true);
        }
    }, [isOpen, initialColor]);

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input')) return;

        e.preventDefault();

        let currentX = position.x;
        let currentY = position.y;
        let modalWidth = 0;
        let modalHeight = 0;

        if (isCentered && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            currentX = rect.left;
            currentY = rect.top;
            modalWidth = rect.width;
            modalHeight = rect.height;

            setPosition({ x: currentX, y: currentY });
            setIsCentered(false);
        } else if (modalRef.current) {
            modalWidth = modalRef.current.offsetWidth;
            modalHeight = modalRef.current.offsetHeight;
        }

        setIsDragging(true);
        dragStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            modalX: currentX,
            modalY: currentY,
            width: modalWidth,
            height: modalHeight
        };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            const dx = e.clientX - dragStart.current.mouseX;
            const dy = e.clientY - dragStart.current.mouseY;

            let newX = dragStart.current.modalX + dx;
            let newY = dragStart.current.modalY + dy;

            const margin = 20;
            const maxX = window.innerWidth - dragStart.current.width - margin;
            const maxY = window.innerHeight - dragStart.current.height - margin;

            newX = Math.max(-dragStart.current.width + margin * 2, Math.min(newX, maxX));
            newY = Math.max(margin, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm(localColor);
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


    const modalStyle: React.CSSProperties = isCentered
        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        : { top: position.y, left: position.x, transform: 'none' };

    return (

        <div className="fixed inset-0 z-50 pointer-events-none">

            <div
                ref={modalRef}
                style={modalStyle}
                className={`absolute w-full max-w-sm rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl pointer-events-auto flex flex-col overflow-hidden ${isDragging ? 'cursor-grabbing' : ''}`}
            >

                <div
                    onPointerDown={handlePointerDown}
                    className="flex items-center justify-between p-4 bg-[#181818] border-b border-[#2a2a2a] cursor-grab active:cursor-grabbing select-none touch-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                            <div className="w-1 h-1 bg-gray-600 rounded-full" />
                            <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">{title}</h2>
                            <p className="text-xs text-gray-500">{description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>


                <div className="p-6">
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
        </div>
    );
};

export default ColorModal;