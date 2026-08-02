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
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#666] uppercase tracking-wider">Tile</span>
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        type="number"
                        value={tileWidth}
                        onChange={handleWidthChange}
                        className="w-14 bg-[#252525] border border-[#333] rounded px-2 py-1 text-center text-[#ccc] text-sm"
                        min={1}
                        max={256}
                        step={1}
                        aria-label="Tile width"
                    />
                    <span className="text-[#555] text-sm">×</span>
                    <input
                        type="number"
                        value={tileHeight}
                        onChange={handleHeightChange}
                        className="w-14 bg-[#252525] border border-[#333] rounded px-2 py-1 text-center text-[#ccc] text-sm"
                        min={1}
                        max={256}
                        step={1}
                        aria-label="Tile height"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTileMode}
                    className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        tileModeEnabled
                            ? 'bg-[#4a9eff] text-white'
                            : 'bg-[#252525] text-[#aaa] hover:bg-[#333]'
                    }`}
                >
                    {tileModeEnabled ? 'ON' : 'OFF'}
                </button>
                {selectedTile && (
                    <span className="text-sm text-[#4a9eff]">
                        ({selectedTile.col}, {selectedTile.row})
                    </span>
                )}
            </div>
        </div>
    );
};