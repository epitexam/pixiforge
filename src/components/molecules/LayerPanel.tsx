import React from 'react';
import { useCanvasStore } from '../../stores/canvaStore';

const EyeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export const LayerPanel: React.FC = () => {
    const { layers, activeLayerId, addLayer, removeLayer, toggleLayerVisibility, setActiveLayer, setLayerName } = useCanvasStore();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-600 uppercase">Layers</span>
            </div>


            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-1 -m-1" style={{ scrollbarWidth: 'thin' }}>
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id)}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-2 cursor-pointer transition-all ${activeLayerId === layer.id
                            ? 'border-blue-500/50 bg-blue-500/5'
                            : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                            }`}
                    >

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                            }}
                            className={`p-1 rounded transition-colors ${layer.visible ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-400'
                                }`}
                            title={layer.visible ? 'Hide layer' : 'Show layer'}
                        >
                            {layer.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                        </button>


                        <input
                            value={layer.name}
                            onChange={(event) => setLayerName(layer.id, event.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-transparent text-sm text-gray-300 outline-none focus:bg-[#111] rounded px-1 py-0.5 transition-colors min-w-0"
                        />


                        {activeLayerId === layer.id && (
                            <span className="text-[10px] text-blue-400 font-medium pr-1 select-none">Active</span>
                        )}



                        {layers.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeLayer(layer.id);
                                }}
                                className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded"
                                title="Remove layer"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => addLayer()}
                className="w-full rounded-xl transition-all duration-150 cursor-pointer hover:border-blue-500 hover:text-blue-400 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center gap-2 py-2 text-gray-400 text-sm font-medium"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Add Layer</span>
            </button>
        </div>
    );
};

export default LayerPanel;