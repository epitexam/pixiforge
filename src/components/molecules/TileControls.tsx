import React from 'react';
import { useCanvasStore } from '../../stores/canvaStore';

export const TileControls: React.FC = () => {
    const { tileWidth, tileHeight, selectedTile, tileModeEnabled, setTileSize, setTileMode } = useCanvasStore();

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 256) {
            setTileSize(val, tileHeight);
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 256) {
            setTileSize(tileWidth, val);
        }
    };

    const toggleTileMode = () => {
        setTileMode(!tileModeEnabled);
    };

    return (
        <div className="flex items-center gap-3 text-[11px] text-[#888]">
            <div className="flex items-center gap-1">
                <span className="uppercase tracking-wider">Tile:</span>
                <input
                    type="number"
                    value={tileWidth}
                    onChange={handleWidthChange}
                    className="w-12 bg-[#252525] border border-[#333] rounded px-1 py-0.5 text-center text-[#ccc]"
                    min={1}
                    max={256}
                    step={1}
                    aria-label="Tile width"
                />
                <span className="text-[#555]">x</span>
                <input
                    type="number"
                    value={tileHeight}
                    onChange={handleHeightChange}
                    className="w-12 bg-[#252525] border border-[#333] rounded px-1 py-0.5 text-center text-[#ccc]"
                    min={1}
                    max={256}
                    step={1}
                    aria-label="Tile height"
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTileMode}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        tileModeEnabled
                            ? 'bg-[#4a9eff] text-white'
                            : 'bg-[#252525] text-[#aaa] hover:bg-[#333]'
                    }`}
                >
                    Tile Mode {tileModeEnabled ? 'ON' : 'OFF'}
                </button>
                {selectedTile && (
                    <span className="text-[10px] text-[#4a9eff]">
                        Selected: ({selectedTile.col}, {selectedTile.row})
                    </span>
                )}
            </div>
        </div>
    );
};