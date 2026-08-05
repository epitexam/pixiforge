import React, { useEffect, useState, useRef } from 'react';

export interface NewProjectOptions {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    backgroundColor: string;
}

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (options: NewProjectOptions) => void;
    initialWidth: number;
    initialHeight: number;
    initialTileWidth: number;
    initialTileHeight: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const NewProjectModal: React.FC<NewProjectModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    initialWidth,
    initialHeight,
    initialTileWidth,
    initialTileHeight,
}) => {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
    const [tileWidth, setTileWidth] = useState(initialTileWidth);
    const [tileHeight, setTileHeight] = useState(initialTileHeight);
    const [backgroundColor, setBackgroundColor] = useState('#F0F0F0');

    const modalRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isCentered, setIsCentered] = useState(true);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, modalX: 0, modalY: 0, width: 0, height: 0 });

    useEffect(() => {
        if (isOpen) {
            setWidth(initialWidth);
            setHeight(initialHeight);
            setTileWidth(initialTileWidth);
            setTileHeight(initialTileHeight);
            setBackgroundColor('#F0F0F0');
            setIsCentered(true);
        }
    }, [isOpen, initialWidth, initialHeight, initialTileWidth, initialTileHeight]);

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

        const handlePointerUp = () => setIsDragging(false);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    const handleCreate = () => {
        const nextWidth = clamp(Math.round(Number(width) || initialWidth), 1, 512);
        const nextHeight = clamp(Math.round(Number(height) || initialHeight), 1, 512);
        const nextTileWidth = clamp(Math.round(Number(tileWidth) || initialTileWidth), 1, nextWidth);
        const nextTileHeight = clamp(Math.round(Number(tileHeight) || initialTileHeight), 1, nextHeight);

        onCreate({
            width: nextWidth,
            height: nextHeight,
            tileWidth: nextTileWidth,
            tileHeight: nextTileHeight,
            backgroundColor,
        });
        onClose();
    };

    const inputClass = "mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none transition";
    const labelClass = "text-xs uppercase tracking-wider text-gray-500";

    const modalStyle: React.CSSProperties = isCentered
        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        : { top: position.y, left: position.x, transform: 'none' };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div
                ref={modalRef}
                style={modalStyle}
                className={`absolute w-full max-w-md max-h-[90vh] rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl pointer-events-auto flex flex-col overflow-hidden ${isDragging ? 'cursor-grabbing' : ''
                    }`}
            >

                <div
                    onPointerDown={handlePointerDown}
                    className="flex items-center justify-between p-4 bg-[#181818] border-b border-[#2a2a2a] cursor-grab active:cursor-grabbing select-none touch-none shrink-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                            <div className="w-1 h-1 bg-gray-600 rounded-full" />
                            <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">New Project</h2>
                            <p className="text-xs text-gray-500">Set canvas size and base settings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <label className={labelClass}>
                            Width
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className={inputClass}
                            />
                        </label>
                        <label className={labelClass}>
                            Height
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className={inputClass}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className={labelClass}>
                            Tile width
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={tileWidth}
                                onChange={(e) => setTileWidth(Number(e.target.value))}
                                className={inputClass}
                            />
                        </label>
                        <label className={labelClass}>
                            Tile height
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={tileHeight}
                                onChange={(e) => setTileHeight(Number(e.target.value))}
                                className={inputClass}
                            />
                        </label>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="flex flex-col">
                            <span className={labelClass}>Background Color</span>
                            <span className="text-xs text-gray-600 mt-1.5">Default fill for empty pixels</span>
                        </div>
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#2a2a2a] cursor-pointer group flex-none">
                            <div
                                className="absolute inset-0 transition-colors"
                                style={{ backgroundColor: backgroundColor }}
                            />
                            <input
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5 uppercase tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                Pick
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex justify-end items-center gap-3 p-4 sm:px-6 border-t border-[#2a2a2a] shrink-0 bg-[#111]">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-[#1a1a1a]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition shadow"
                    >
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;