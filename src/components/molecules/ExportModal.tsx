import { useState } from 'react';

export type ExportFormat = 'png' | 'jpeg' | 'bmp' | 'webp';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: ExportFormat, quality?: number) => void;
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

    if (!isOpen) return null;

    const showQuality = format === 'jpeg' || format === 'webp';

    const handleExport = () => {
        if (showQuality) {
            onExport(format, quality / 100);
        } else {
            onExport(format);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl p-6">

                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Export</h2>
                        <p className="text-sm text-gray-400">Download your canvas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition"
                    >
                        ✕
                    </button>
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


                {showQuality && (
                    <div className="mb-6">
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
                            className="w-full accent-blue-500 cursor-pointer"
                        />
                    </div>
                )}

                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white transition"
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
