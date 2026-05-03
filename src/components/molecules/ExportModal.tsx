import React, { useState } from 'react';

export type ExportFormat = 'png' | 'jpeg' | 'bmp' | 'webp';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: ExportFormat, quality?: number) => void;
}

const formatLabels: Record<ExportFormat, string> = {
    png: 'PNG (lossless)',
    jpeg: 'JPEG (compressed)',
    bmp: 'BMP (uncompressed)',
    webp: 'WebP (modern)'
};

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    const [format, setFormat] = useState<ExportFormat>('png');
    const [quality, setQuality] = useState(90); // pour JPEG/WebP

    if (!isOpen) return null;

    const handleExport = () => {
        if (format === 'jpeg' || format === 'webp') {
            onExport(format, quality / 100);
        } else {
            onExport(format);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-base font-bold text-white mb-2">Export Canvas</h3>
                <p className="text-xs text-[#888] mb-4">Choose format and quality.</p>

                <div className="mb-4">
                    <label className="block text-xs font-medium text-[#aaa] mb-2">Format</label>
                    <div className="flex gap-2 flex-wrap">
                        {(Object.keys(formatLabels) as ExportFormat[]).map((fmt) => (
                            <button
                                key={fmt}
                                onClick={() => setFormat(fmt)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                                    format === fmt
                                        ? 'bg-[#4a9eff] text-white'
                                        : 'bg-[#252525] text-[#aaa] hover:bg-[#2a2a2a] border border-[#333]'
                                }`}
                            >
                                {formatLabels[fmt]}
                            </button>
                        ))}
                    </div>
                </div>

                {(format === 'jpeg' || format === 'webp') && (
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-[#aaa] mb-2">
                            Quality: {quality}%
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium bg-[#252525] border border-[#333] rounded-md hover:bg-[#2a2a2a] text-[#aaa] transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-1.5 text-xs font-medium bg-[#4a9eff] border border-[#4a9eff] rounded-md hover:bg-[#3a8eff] text-white transition"
                    >
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};