import React, { useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useToolStore } from '../../stores/toolStore';
import { MenuBar } from '../organisms/MenuBar';
import { Toolbar } from '../organisms/Toolbar';
import { Palette } from '../molecules/Palette';
import { Canvas } from '../organisms/Canvas';
import { ZoomControls } from '../atoms/ZoomControls';
import { CopyIcon, PasteIcon, ClearIcon, DownloadIcon, UploadIcon, ImageIcon, GridIcon } from '../atoms/EditorIcons';
import { useCanvasStore } from '../../stores/canvaStore';
import { CanvasHandle } from '../organisms/canvas/types';
import { TileControls } from '../molecules/TileControls';
import { useZoom, useExport, useClipboard, usePaletteActions } from '../../hooks';
import { ExportOptions } from '../../hooks/useExport';
import { usePaletteStore } from '../../stores/paletteStore';

export const EditorPage: React.FC = () => {
    const { clearCanvas } = useCanvasStore();
    const { currentColor, setCurrentColor } = useToolStore();
    const {
        colors: paletteColors,
        addColor,
        removeColor,
        updateColor
    } = usePaletteStore();

    const canvasRef = useRef<CanvasHandle>(null);
    const [exportWithGrid, setExportWithGrid] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
    const [exportQuality, setExportQuality] = useState(1);
    const [tempIncludeGrid, setTempIncludeGrid] = useState(true);

    const { scale, translateX, translateY, setScale, setTranslateX, setTranslateY, handleZoomIn, handleZoomOut, handleZoomReset } = useZoom();
    const { exportCanvas } = useExport(canvasRef);
    const { handleCopy, handlePaste } = useClipboard(canvasRef);
    const { exportPalette, handleImportPalette } = usePaletteActions();

    const handleExport = () => {
        setTempIncludeGrid(exportWithGrid);
        setShowExportModal(true);
    };

    const confirmExport = () => {
        const options: ExportOptions = {
            format: exportFormat,
            quality: exportFormat === 'png' ? undefined : exportQuality,
            includeGrid: tempIncludeGrid,
        };
        exportCanvas(options);
        setShowExportModal(false);
    };

    const handleClearCanvas = () => {
        clearCanvas();
        toast.success('Canvas cleared');
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] overflow-hidden font-sans select-none">
            <Toaster position="top-center" richColors />

            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-80 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Export Canvas</h3>
                        <div className="mb-4">
                            <label className="block text-sm text-[#aaa] mb-1">Format</label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                                className="w-full bg-[#252525] border border-[#333] rounded-md px-3 py-2 text-white"
                            >
                                <option value="png">PNG (lossless)</option>
                                <option value="jpeg">JPEG</option>
                                <option value="webp">WebP</option>
                            </select>
                        </div>
                        {exportFormat !== 'png' && (
                            <div className="mb-4">
                                <label className="block text-sm text-[#aaa] mb-1">Quality: {Math.round(exportQuality * 100)}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={exportQuality}
                                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm text-[#aaa]">
                                <input
                                    type="checkbox"
                                    checked={tempIncludeGrid}
                                    onChange={(e) => setTempIncludeGrid(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                Include grid
                            </label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowExportModal(false)} className="px-4 py-2 text-sm bg-[#252525] border border-[#333] rounded-md hover:bg-[#2a2a2a] text-[#aaa]">Cancel</button>
                            <button onClick={confirmExport} className="px-4 py-2 text-sm bg-[#4a9eff] border border-[#4a9eff] rounded-md hover:bg-[#3a8eff] text-white">Export</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex-none h-11 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-stretch z-20">
                <MenuBar />
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="flex-none w-14 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1">
                    <Toolbar orientation="vertical" />
                </aside>

                <aside className="hidden lg:flex lg:flex-col lg:w-40 bg-[#1a1a1a] border-r border-[#2a2a2a] overflow-y-auto">
                    <div className="px-2 py-2 border-b border-[#2a2a2a]">
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-[#666] uppercase">Layers</span>
                    </div>
                    <div className="flex-1 p-1">
                        <div className="p-1 rounded-sm bg-[#252525] border border-[#333] flex items-center gap-1 cursor-pointer hover:border-[#4a9eff] transition-colors group">
                            <div className="w-3 h-3 rounded-sm bg-[#3a3a3a] flex-none" />
                            <span className="text-[10px] text-[#aaa] group-hover:text-[#ddd] truncate">Background</span>
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4a9eff] flex-none" />
                        </div>
                    </div>
                </aside>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <section className="flex-1 flex items-center justify-center bg-[#0f0f0f] overflow-hidden relative">
                        <Canvas
                            ref={canvasRef}
                            cellSize={16}
                            scale={scale}
                            onScaleChange={setScale}
                            translateX={translateX}
                            onTranslateXChange={setTranslateX}
                            translateY={translateY}
                            onTranslateYChange={setTranslateY}
                        />
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 text-[8px] sm:text-[10px] text-[#4a4a4a] tracking-[0.2em] uppercase bg-[#0f0f0f]/80 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm backdrop-blur-sm pointer-events-none">
                            16px · 64×64
                        </div>
                    </section>

                    <footer className="flex-none py-2 sm:py-3 px-2 sm:px-4 bg-[#1a1a1a] border-t border-[#2a2a2a] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        <ZoomControls zoomLevel={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />
                        <div className="w-px h-5 bg-[#2a2a2a] hidden sm:block" />
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={handleCopy} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Copy selection (Ctrl+C)">
                                <CopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button onClick={handlePaste} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Paste at mouse position (Ctrl+V)">
                                <PasteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        <div className="w-px h-5 bg-[#2a2a2a] hidden sm:block" />
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={handleExport} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-medium tracking-wide text-[#888] hover:text-[#4a9eff] border border-[#333] hover:border-[#4a9eff] rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Export canvas">
                                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button onClick={() => setExportWithGrid(!exportWithGrid)} className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border transition-all ${exportWithGrid ? 'bg-[#4a9eff] text-white border-[#4a9eff]' : 'bg-[#252525] text-[#888] border-[#333] hover:border-[#4a9eff] hover:text-[#4a9eff]'}`} title={exportWithGrid ? "Export includes grid" : "Export without grid"}>
                                <GridIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        <div className="w-px h-5 bg-[#2a2a2a] hidden sm:block" />
                        <button onClick={handleClearCanvas} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-medium tracking-wide text-[#888] hover:text-[#cf6679] border border-[#333] hover:border-[#cf6679]/50 rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Clear canvas">
                            <ClearIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </footer>
                </div>

                <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#1a1a1a] border-l border-[#2a2a2a] overflow-y-auto">
                    <div className="flex-1 flex flex-col p-3 gap-8">

                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">Palette</span>
                            <Palette
                                colors={paletteColors}
                                selectedColor={currentColor}
                                onSelectColor={setCurrentColor}
                                onAddColor={addColor}
                                onRemoveColor={removeColor}
                                onUpdateColor={updateColor}
                                swatchSize={32}
                                showCustomPicker={true}
                            />
                            <div className="flex gap-2 mt-1">
                                <button onClick={exportPalette} className="flex-1 px-2 py-1 text-[10px] bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all">
                                    <DownloadIcon className="w-3 h-3 inline mr-1" />
                                    Export
                                </button>
                                <button onClick={handleImportPalette} className="flex-1 px-2 py-1 text-[10px] bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all">
                                    <UploadIcon className="w-3 h-3 inline mr-1" />
                                    Import
                                </button>
                            </div>
                        </div>


                        <div className="w-full h-px bg-[#2a2a2a]" />


                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">Tiles</span>
                            <TileControls />
                        </div>
                    </div>

                    <div className="mt-auto p-3 border-t border-[#2a2a2a]">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">Active Color</span>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-sm border border-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" style={{ backgroundColor: currentColor }} />
                                <span className="text-[11px] text-[#888] font-mono uppercase tracking-wider">{currentColor}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};