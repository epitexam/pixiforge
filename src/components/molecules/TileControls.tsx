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

    const cols = Math.ceil(64 / tileWidth);
    const rows = Math.ceil(64 / tileHeight);

    return (
        <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-medium">Tile size</span>
                    <span className="text-xs text-gray-500 font-mono">
                        {tileWidth}×{tileHeight}
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Width</label>
                        <input
                            type="number"
                            value={tileWidth}
                            onChange={handleWidthChange}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-gray-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            min={1}
                            max={256}
                            step={1}
                            aria-label="Tile width in cells"
                        />
                    </div>
                    <div className="w-full flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Height</label>
                        <input
                            type="number"
                            value={tileHeight}
                            onChange={handleHeightChange}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-gray-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            min={1}
                            max={256}
                            step={1}
                            aria-label="Tile height in cells"
                        />
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Grid: {cols}×{rows} tiles
                </div>
            </div>

            <div className="w-full h-px bg-[#2a2a2a]" />


            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300 font-medium">Restriction</span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${tileModeEnabled
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/40'
                                : 'bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]'
                                }`}
                        >
                            {tileModeEnabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {selectedTile && (
                        <span className="text-xs text-blue-400 whitespace-nowrap font-mono">
                            ({selectedTile.col}, {selectedTile.row})
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTileMode}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${tileModeEnabled
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow'
                            : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:bg-[#222] hover:border-blue-500 hover:text-blue-400'
                            }`}
                    >
                        {tileModeEnabled ? 'Disable' : 'Enable'}
                    </button>
                    {tileModeEnabled && (
                        <button
                            onClick={() => setTileMode(false)}
                            className="px-3 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-all"
                        >
                            Exit
                        </button>
                    )}
                </div>

                {tileModeEnabled ? (
                    <div className="text-xs text-blue-400 bg-blue-500/5 rounded-lg p-2.5 border border-blue-500/20 text-center">
                        Drawing is restricted to the selected tile
                    </div>
                ) : !selectedTile ? (
                    <div className="text-xs text-gray-500 text-center">
                        Use the Tile Select tool to pick a tile
                    </div>
                ) : null}
            </div>
        </div>
    );
};