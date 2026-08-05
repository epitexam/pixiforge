import React from 'react';
import { useCanvasStore } from '../../stores/canvaStore';

export const LayerPanel: React.FC = () => {
  const { layers, activeLayerId, addLayer, removeLayer, toggleLayerVisibility, setActiveLayer, setLayerName } = useCanvasStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-600">Layers</span>
        <button
          onClick={() => addLayer()}
          className="rounded-md border border-[#2a2a2a] px-2 py-1 text-[11px] text-gray-400 hover:border-blue-500 hover:text-blue-400"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${activeLayerId === layer.id ? 'border-blue-500/40 bg-blue-500/10' : 'border-[#2a2a2a] bg-[#161616]'}`}
          >
            <button
              onClick={() => toggleLayerVisibility(layer.id)}
              className={`text-sm ${layer.visible ? 'text-gray-200' : 'text-gray-600'}`}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? '👁' : '🙈'}
            </button>
            <input
              value={layer.name}
              onChange={(event) => setLayerName(layer.id, event.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
            />
            <button
              onClick={() => setActiveLayer(layer.id)}
              className="text-[11px] text-gray-500 hover:text-blue-400"
            >
              {activeLayerId === layer.id ? 'Active' : 'Use'}
            </button>
            {layers.length > 1 && (
              <button
                onClick={() => removeLayer(layer.id)}
                className="text-[11px] text-gray-500 hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;
