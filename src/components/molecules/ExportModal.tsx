import { useState } from 'react';
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-white">Export</h2>
                        <p className="text-sm text-gray-400">Download your canvas</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 text-gray-500 hover:text-white transition">
                        ✕
                    </button>
                </div>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formatOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFormat(opt.value)}
                                className={`p-3 rounded-xl border text-left transition group ${
                                    format === opt.value
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
                    <div className="mb-6 flex items-center gap-2">
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

                <div className="flex justify-between items-center mt-8">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition">
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