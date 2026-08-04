import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useToolStore } from '../../stores/toolStore';
import { MenuBar } from '../organisms/MenuBar';
import { Toolbar } from '../organisms/Toolbar';
import { Palette } from '../molecules/Palette';
import { Canvas } from '../organisms/Canvas';
import { ZoomControls } from '../atoms/ZoomControls';
import { CopyIcon, PasteIcon, ClearIcon, DownloadIcon, UploadIcon } from '../atoms/EditorIcons';
import { CustomColorIcon } from '../atoms/PaletteIcons';
import { useCanvasStore } from '../../stores/canvaStore';
import { CanvasHandle } from '../organisms/canvas/types';
import { TileControls } from '../molecules/TileControls';
import { useZoom, useExport, useClipboard, usePaletteActions } from '../../hooks';
import { ExportOptions } from '../../hooks/useExport';
import { usePaletteStore } from '../../stores/paletteStore';
import ExportModal from '../molecules/ExportModal';
import ColorModal from '../molecules/ColorModal';

export const EditorPage: React.FC = () => {
    const { clearCanvas, width: gridWidth, height: gridHeight } = useCanvasStore();
    const { currentColor, setCurrentColor } = useToolStore();
    const {
        colors: paletteColors,
        addColor,
        removeColor,
        updateColor
    } = usePaletteStore();

    const canvasRef = useRef<CanvasHandle>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showActiveColorModal, setShowActiveColorModal] = useState(false);

    const { scale, translateX, translateY, setScale, setTranslateX, setTranslateY, handleZoomIn, handleZoomOut, handleZoomReset } = useZoom();
    const { exportCanvas } = useExport(canvasRef);
    const { handleCopy, handlePaste } = useClipboard(canvasRef);
    const { exportPalette, handleImportPalette } = usePaletteActions();

    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(24);


    useEffect(() => {
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setShowActiveColorModal(v => !v);
            }
        };
        window.addEventListener('keydown', handleGlobalShortcut);
        return () => window.removeEventListener('keydown', handleGlobalShortcut);
    }, []);

    useLayoutEffect(() => {
        let rafId: number;
        const updateCellSize = () => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) { rafId = requestAnimationFrame(updateCellSize); return; }
            const padding = 32;
            const availableWidth = rect.width - padding;
            const availableHeight = rect.height - padding;
            const cols = gridWidth || 32;
            const rows = gridHeight || 32;
            let newCellSize = Math.min(availableWidth / cols, availableHeight / rows);
            newCellSize = Math.max(newCellSize, 8);
            newCellSize = Math.min(newCellSize, 64);
            newCellSize = Math.floor(newCellSize);
            setCellSize(prev => (prev !== newCellSize ? newCellSize : prev));
        };
        updateCellSize();
        const container = containerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver(() => updateCellSize());
        resizeObserver.observe(container);
        window.addEventListener('resize', updateCellSize);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateCellSize);
        };
    }, [gridWidth, gridHeight]);

    const handleExport = () => setShowExportModal(true);
    const handleExportConfirm = (options: ExportOptions) => {
        exportCanvas(options);
        setShowExportModal(false);
    };
    const handleClearCanvas = () => { clearCanvas(); toast.success('Canvas cleared'); };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] overflow-hidden font-sans select-none">
            <Toaster position="top-center" richColors />

            <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExportConfirm} />

            <ColorModal
                isOpen={showActiveColorModal}
                title="Active Color"
                description="Pick a color to draw with, or add it to your palette."
                initialColor={currentColor}
                confirmLabel="Save"
                onConfirm={(newColor) => {
                    setCurrentColor(newColor);
                    setShowActiveColorModal(false);
                }}
                onCancel={() => setShowActiveColorModal(false)}
                onAddToPalette={(color) => {
                    addColor(color);
                    toast.success("Color added to palette");
                }}
                isColorInPalette={(color) => paletteColors.includes(color)}
            />

            <header className="flex-none h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center z-20 px-2">
                <MenuBar onExport={handleExport} />
            </header>

            <main className="relative flex flex-1 overflow-hidden">
                <aside className="flex-none w-14 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1 z-30">
                    <Toolbar orientation="vertical" />
                    <button
                        onClick={() => setShowSidebar((v) => !v)}
                        className={`lg:hidden mt-auto flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150 cursor-pointer ${showSidebar ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50' : 'text-gray-500 hover:text-gray-200 hover:bg-[#222] border border-transparent'
                            }`}
                        title="Palette & Tiles"
                    >
                        <CustomColorIcon className="w-5 h-5" />
                    </button>
                </aside>

                <div className={`absolute inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${showSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)} />

                <aside className={`absolute lg:static inset-y-0 left-14 lg:left-auto z-30 w-72 max-w-[calc(100vw-3.5rem)] lg:w-64 lg:max-w-none bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="flex-none flex items-center justify-between px-4 h-12 border-b border-[#2a2a2a] lg:hidden">
                        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Palette & Tiles</span>
                        <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-white transition p-2 -mr-2">✕</button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-600 uppercase">Palette</span>
                            <Palette
                                colors={paletteColors}
                                selectedColor={currentColor}
                                onSelectColor={setCurrentColor}
                                onRemoveColor={removeColor}
                                onUpdateColor={updateColor}
                                swatchSize={32}
                            />
                            <div className="flex gap-2 mt-1">
                                <button onClick={exportPalette} className="flex-1 px-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-blue-500 hover:text-blue-400 text-gray-400 transition-all">
                                    <DownloadIcon className="w-3.5 h-3.5 inline mr-1.5" /> Export
                                </button>
                                <button onClick={handleImportPalette} className="flex-1 px-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-blue-500 hover:text-blue-400 text-gray-400 transition-all">
                                    <UploadIcon className="w-3.5 h-3.5 inline mr-1.5" /> Import
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-px bg-[#2a2a2a]" />

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-600 uppercase">Tiles</span>
                            <TileControls />
                        </div>
                    </div>

                    <div className="flex-none p-4 border-t border-[#2a2a2a]">

                        <button
                            onClick={() => setShowActiveColorModal(v => !v)}
                            className={`w-full flex flex-col gap-2 text-left group cursor-pointer transition-all ${showActiveColorModal ? 'bg-blue-500/5 rounded-lg p-2 -m-2' : ''}`}
                        >
                            <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors ${showActiveColorModal ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                Active Color
                            </span>
                            <div className="flex items-center gap-3">

                                <div
                                    className={`w-10 h-10 rounded-lg border transition-colors shadow-inner ${showActiveColorModal ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-[#2a2a2a] group-hover:border-blue-500'}`}
                                    style={{ backgroundColor: currentColor }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-300 font-mono uppercase tracking-wider">{currentColor}</span>
                                    <span className={`text-[10px] transition-colors ${showActiveColorModal ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>
                                        {showActiveColorModal ? 'Click to close' : 'Click to edit'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>
                </aside>

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <section ref={containerRef} className="flex-1 flex items-center justify-center bg-[#0f0f0f] overflow-hidden relative">
                        <Canvas
                            ref={canvasRef}
                            cellSize={cellSize}
                            scale={scale}
                            onScaleChange={setScale}
                            translateX={translateX}
                            onTranslateXChange={setTranslateX}
                            translateY={translateY}
                            onTranslateYChange={setTranslateY}
                        />
                        <div className="absolute bottom-3 right-4 text-[9px] text-gray-700 tracking-[0.2em] uppercase bg-[#0f0f0f]/80 px-2.5 py-1 rounded-sm backdrop-blur-sm pointer-events-none">
                            {cellSize}px · {gridWidth}×{gridHeight}
                        </div>
                    </section>

                    <footer className="flex-none py-3 px-4 bg-[#1a1a1a] border-t border-[#2a2a2a] flex flex-wrap items-center justify-center gap-3 z-10">
                        <ZoomControls zoomLevel={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />

                        <div className="w-px h-6 bg-[#2a2a2a] hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button onClick={handleCopy} className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-blue-500 hover:text-blue-400 text-gray-400 transition-all" title="Copy (Ctrl+C)"><CopyIcon className="w-4 h-4" /></button>
                            <button onClick={handlePaste} className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-blue-500 hover:text-blue-400 text-gray-400 transition-all" title="Paste (Ctrl+V)"><PasteIcon className="w-4 h-4" /></button>
                        </div>

                        <div className="w-px h-6 bg-[#2a2a2a] hidden sm:block" />

                        <button onClick={handleClearCanvas} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide text-gray-400 hover:text-red-400 border border-[#2a2a2a] hover:border-red-500/50 rounded-lg transition-all bg-[#1a1a1a] hover:bg-[#222]" title="Clear"><ClearIcon className="w-4 h-4" /><span className="hidden sm:inline">Clear</span></button>
                    </footer>
                </div>
            </main>
        </div>
    );
};