import { useState, useEffect, useRef } from 'react';
import { ExportOptions } from '../../hooks/useExport';

export type ExportFormat = 'png' | 'jpeg' | 'bmp' | 'webp';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => void;
}

const formatOptions = [
    { value: 'png', label: 'PNG', desc: 'Lossless, best quality' },
    { value: 'jpeg', label: 'JPEG', desc: 'Smaller size, lossy' },
    { value: 'webp', label: 'WebP', desc: 'Modern, optimized' },
    { value: 'bmp', label: 'BMP', desc: 'Uncompressed, large' }
] as const;

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
    const [format, setFormat] = useState<ExportFormat>('png');
    const [quality, setQuality] = useState(90);
    const [fileName, setFileName] = useState('pixiforge');
    const [scale, setScale] = useState(8);
    const [includeGrid, setIncludeGrid] = useState(false);
    const [transparent, setTransparent] = useState(true);


    const modalRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isCentered, setIsCentered] = useState(true);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, modalX: 0, modalY: 0, width: 0, height: 0 });

    useEffect(() => {
        if (isOpen) {
            setIsCentered(true);
        }
    }, [isOpen]);


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

    const showQuality = format === 'jpeg' || format === 'webp';

    const handleExport = () => {
        const options: ExportOptions = {
            format: format as 'png' | 'jpeg' | 'webp',
            quality: showQuality ? quality / 100 : undefined,
            fileName: fileName.trim() || 'pixiforge',
            scale: Math.max(1, Number(scale) || 1),
            includeGrid,
            transparent: format === 'png' ? transparent : undefined,
        };
        onExport(options);
        onClose();
    };

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
                            <h2 className="text-sm font-semibold text-white">Export</h2>
                            <p className="text-xs text-gray-500">Download your canvas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>


                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-300 mb-2">File Name</p>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="pixiforge"
                        />
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-300 mb-3">Format</p>
                        <div className="grid grid-cols-2 gap-3">
                            {formatOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormat(opt.value)}
                                    className={`p-3 rounded-xl border text-left transition group ${format === opt.value
                                        ? 'bg-blue-500/10 border-blue-500'
                                        : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white">{opt.label}</span>
                                        {format === opt.value && (
                                            <span className="text-blue-400 text-xs">Selected</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-2">Scale (X)</p>
                            <input
                                type="number"
                                min="1"
                                max="64"
                                value={scale}
                                onChange={(e) => setScale(Number(e.target.value))}
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>
                        {showQuality && (
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-300">Quality</span>
                                    <span className="text-sm text-white font-medium">{quality}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full accent-blue-500 cursor-pointer mt-3"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-6 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeGrid"
                            checked={includeGrid}
                            onChange={(e) => setIncludeGrid(e.target.checked)}
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                        <label htmlFor="includeGrid" className="text-sm text-gray-300 cursor-pointer">
                            Include grid lines in export
                        </label>
                    </div>

                    {format === 'png' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="transparent"
                                checked={transparent}
                                onChange={(e) => setTransparent(e.target.checked)}
                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                            />
                            <label htmlFor="transparent" className="text-sm text-gray-300 cursor-pointer">
                                Transparent background (empty pixels)
                            </label>
                        </div>
                    )}
                </div>


                <div className="flex justify-end items-center gap-3 p-4 sm:px-6 border-t border-[#2a2a2a] shrink-0 bg-[#111]">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-[#1a1a1a]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition shadow"
                    >
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
}