import React, { useState } from 'react';
import { toast } from 'sonner';
import { TileDefinition, useCanvasStore } from '../../stores/canvaStore';
import { useToolStore } from '../../stores/toolStore';

const TilePreview: React.FC<{ tile: TileDefinition }> = ({ tile }) => (
    <div
        className="grid w-12 h-12 shrink-0 rounded border border-[#3a3a3a] overflow-hidden bg-[#f0f0f0]"
        style={{ gridTemplateColumns: `repeat(${tile.width}, minmax(0, 1fr))` }}
        aria-hidden="true"
    >
        {tile.pixels.map((color, index) => <span key={index} style={{ backgroundColor: color }} />)}
    </div>
);

export const TileControls: React.FC = () => {
    const {
        width: canvasWidth, height: canvasHeight, tileWidth, tileHeight, selectedTile, tileModeEnabled,
        tiles, activeLibraryTileId, setTileSize, setTileMode, captureTile, removeTile, renameTile, setActiveLibraryTile,
    } = useCanvasStore();
    const { setActiveTool } = useToolStore();
    const [tileName, setTileName] = useState('');

    const updateSize = (dimension: 'width' | 'height', rawValue: string) => {
        const value = Number.parseInt(rawValue, 10);
        if (!Number.isInteger(value) || value < 1 || value > 256) return;
        setTileSize(dimension === 'width' ? value : tileWidth, dimension === 'height' ? value : tileHeight);
    };

    const capture = () => {
        const tile = captureTile(tileName);
        if (!tile) {
            toast.error('Select a tile area before capturing it.');
            return;
        }
        setTileName('');
        setActiveTool('tileStamp');
        toast.success(`${tile.name} added to the tile library.`);
    };

    const activateTile = (tile: TileDefinition) => {
        setActiveLibraryTile(tile.id);
        setActiveTool('tileStamp');
        toast.info(`${tile.name} is ready to place.`);
    };

    const exportSpriteSheet = async () => {
        if (!tiles.length) {
            toast.error('Add at least one tile before exporting a spritesheet.');
            return;
        }
        const columns = Math.max(1, Math.ceil(Math.sqrt(tiles.length)));
        const cellWidth = Math.max(...tiles.map((tile) => tile.width));
        const cellHeight = Math.max(...tiles.map((tile) => tile.height));
        const rows = Math.ceil(tiles.length / columns);
        const canvas = document.createElement('canvas');
        canvas.width = columns * cellWidth;
        canvas.height = rows * cellHeight;
        const context = canvas.getContext('2d');
        if (!context) return;
        tiles.forEach((tile, tileIndex) => {
            const offsetX = (tileIndex % columns) * cellWidth;
            const offsetY = Math.floor(tileIndex / columns) * cellHeight;
            tile.pixels.forEach((color, pixelIndex) => {
                context.fillStyle = color;
                context.fillRect(offsetX + pixelIndex % tile.width, offsetY + Math.floor(pixelIndex / tile.width), 1, 1);
            });
        });
        const link = document.createElement('a');
        link.download = 'pixiforge-tiles.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Spritesheet exported.');
    };

    const columns = Math.ceil(canvasWidth / tileWidth);
    const rows = Math.ceil(canvasHeight / tileHeight);

    return (
        <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-medium">Tile grid</span>
                    <span className="text-xs text-gray-500 font-mono">{tileWidth}×{tileHeight}</span>
                </div>
                <div className="flex gap-3">
                    <label className="w-1/2 text-xs text-gray-500">Width
                        <input type="number" value={tileWidth} onChange={(event) => updateSize('width', event.target.value)} min={1} max={256} className="mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-gray-200 text-sm focus:border-blue-500 focus:outline-none" />
                    </label>
                    <label className="w-1/2 text-xs text-gray-500">Height
                        <input type="number" value={tileHeight} onChange={(event) => updateSize('height', event.target.value)} min={1} max={256} className="mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-gray-200 text-sm focus:border-blue-500 focus:outline-none" />
                    </label>
                </div>
                <p className="text-xs text-gray-500">Canvas grid: {columns}×{rows} tile areas</p>
            </section>

            <div className="w-full h-px bg-[#2a2a2a]" />

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <div><p className="text-xs text-gray-300 font-medium">Locked tile area</p><p className="text-[11px] text-gray-500 mt-0.5">Restricts all canvas edits to one area.</p></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${tileModeEnabled ? 'text-blue-400 border-blue-500/40 bg-blue-500/10' : 'text-gray-500 border-[#2a2a2a]'}`}>{tileModeEnabled ? 'Locked' : 'Unlocked'}</span>
                </div>
                <p className="text-xs font-mono text-blue-400">{selectedTile ? `Area (${selectedTile.col}, ${selectedTile.row})` : 'No area selected — press T and click the canvas.'}</p>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTool('tileSelect')} className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a] hover:border-blue-500">Select area (T)</button>
                    <button onClick={() => setTileMode(!tileModeEnabled)} disabled={!selectedTile && !tileModeEnabled} className="px-3 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-40">{tileModeEnabled ? 'Unlock' : 'Lock'}</button>
                </div>
            </section>

            <div className="w-full h-px bg-[#2a2a2a]" />

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between"><div><p className="text-xs text-gray-300 font-medium">Tile library</p><p className="text-[11px] text-gray-500 mt-0.5">Capture an area, then stamp it anywhere.</p></div><span className="text-xs text-gray-500">{tiles.length}</span></div>
                <div className="flex gap-2">
                    <input value={tileName} onChange={(event) => setTileName(event.target.value)} placeholder="Tile name (optional)" className="min-w-0 flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none" />
                    <button onClick={capture} disabled={!selectedTile} className="px-3 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-40">Capture</button>
                </div>
                {tiles.length ? <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {tiles.map((tile) => <div key={tile.id} className={`flex gap-2 p-2 rounded-lg border ${tile.id === activeLibraryTileId ? 'border-blue-500 bg-blue-500/5' : 'border-[#2a2a2a] bg-[#151515]'}`}>
                        <button onClick={() => activateTile(tile)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><TilePreview tile={tile} /><span className="min-w-0"><span className="block truncate text-xs text-gray-200">{tile.name}</span><span className="text-[10px] text-gray-500">{tile.width}×{tile.height}</span></span></button>
                        <button onClick={() => { const name = window.prompt('Tile name', tile.name); if (name !== null) renameTile(tile.id, name); }} className="text-xs text-gray-500 hover:text-white">Rename</button>
                        <button onClick={() => removeTile(tile.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </div>)}
                </div> : <p className="text-xs text-gray-500 text-center py-2">Select an area and capture it to create your first reusable tile.</p>}
                <button onClick={exportSpriteSheet} disabled={!tiles.length} className="w-full px-3 py-2 text-sm rounded-lg border border-[#2a2a2a] text-gray-300 hover:border-blue-500 disabled:opacity-40">Export spritesheet (PNG)</button>
            </section>
        </div>
    );
};
