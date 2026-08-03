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
        <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">
                        Tile size
                    </span>
                    <span className="text-[9px] text-[#555]">
                        {tileWidth}×{tileHeight} cells
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-[#888]">Width</label>
                        <input
                            type="number"
                            value={tileWidth}
                            onChange={handleWidthChange}
                            className="w-16 bg-[#252525] border border-[#333] rounded px-2 py-1 text-center text-[#ccc] text-sm focus:border-[#4a9eff] outline-none transition-colors"
                            min={1}
                            max={256}
                            step={1}
                            aria-label="Tile width in cells"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-[#888]">Height</label>
                        <input
                            type="number"
                            value={tileHeight}
                            onChange={handleHeightChange}
                            className="w-16 bg-[#252525] border border-[#333] rounded px-2 py-1 text-center text-[#ccc] text-sm focus:border-[#4a9eff] outline-none transition-colors"
                            min={1}
                            max={256}
                            step={1}
                            aria-label="Tile height in cells"
                        />
                    </div>
                </div>
                <div className="text-[9px] text-[#555]">
                    Grid: {cols}×{rows} tiles
                </div>
            </div>

            <div className="w-full h-px bg-[#2a2a2a]" />

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">
                            Restriction
                        </span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${tileModeEnabled
                                ? 'bg-[#4a9eff]/20 text-[#4a9eff] border border-[#4a9eff]/40'
                                : 'bg-[#2a2a2a] text-[#666] border border-[#333]'
                                }`}
                        >
                            {tileModeEnabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {selectedTile && (
                        <span className="text-sm text-[#4a9eff] whitespace-nowrap">
                            Tile ({selectedTile.col}, {selectedTile.row})
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTileMode}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${tileModeEnabled
                            ? 'bg-[#4a9eff] text-white hover:bg-[#3a8eff]'
                            : 'bg-[#252525] text-[#aaa] border border-[#333] hover:bg-[#2f2f2f] hover:border-[#4a9eff]'
                            }`}
                    >
                        {tileModeEnabled ? 'Disable restriction' : 'Enable restriction'}
                    </button>
                    {tileModeEnabled && (
                        <button
                            onClick={() => setTileMode(false)}
                            className="px-3 py-1.5 text-sm font-medium text-[#cf6679] hover:text-white hover:bg-[#cf6679]/20 rounded border border-[#cf6679]/30 transition-all"
                        >
                            Exit
                        </button>
                    )}
                </div>

                {tileModeEnabled ? (
                    <div className="text-[10px] text-[#4a9eff] bg-[#4a9eff]/5 rounded p-1.5 border border-[#4a9eff]/20 text-center">
                        Drawing is restricted to the selected tile
                    </div>
                ) : !selectedTile ? (
                    <div className="text-[10px] text-[#666] text-center">
                        Use the Tile Select tool to pick a tile
                    </div>
                ) : null}
            </div>
        </div>
    );
};