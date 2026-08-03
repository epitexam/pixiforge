import React, { useRef, useState, useLayoutEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useToolStore } from '../../stores/toolStore';
import { MenuBar } from '../organisms/MenuBar';
import { Toolbar } from '../organisms/Toolbar';
import { Palette } from '../molecules/Palette';
import { Canvas } from '../organisms/Canvas';
import { ZoomControls } from '../atoms/ZoomControls';
import { CopyIcon, PasteIcon, ClearIcon, DownloadIcon, UploadIcon, ImageIcon } from '../atoms/EditorIcons';
import { CustomColorIcon } from '../atoms/PaletteIcons';
import { useCanvasStore } from '../../stores/canvaStore';
import { CanvasHandle } from '../organisms/canvas/types';
import { TileControls } from '../molecules/TileControls';
import { useZoom, useExport, useClipboard, usePaletteActions } from '../../hooks';
import { ExportOptions } from '../../hooks/useExport';
import { usePaletteStore } from '../../stores/paletteStore';
import ExportModal from '../molecules/ExportModal';

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

    const { scale, translateX, translateY, setScale, setTranslateX, setTranslateY, handleZoomIn, handleZoomOut, handleZoomReset } = useZoom();
    const { exportCanvas } = useExport(canvasRef);
    const { handleCopy, handlePaste } = useClipboard(canvasRef);
    const { exportPalette, handleImportPalette } = usePaletteActions();

    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(24);

    useLayoutEffect(() => {
        let rafId: number;

        const updateCellSize = () => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                rafId = requestAnimationFrame(updateCellSize);
                return;
            }
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

        const resizeObserver = new ResizeObserver(() => {
            updateCellSize();
        });
        resizeObserver.observe(container);

        window.addEventListener('resize', updateCellSize);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateCellSize);
        };
    }, [gridWidth, gridHeight]);

    const handleExport = () => {
        setShowExportModal(true);
    };

    const handleExportConfirm = (options: ExportOptions) => {
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

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExportConfirm}
            />

            <header className="flex-none h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-stretch z-20">
                <MenuBar />
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="flex-none w-14 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1">
                    <Toolbar orientation="vertical" />

                    <button
                        onClick={() => setShowSidebar((v) => !v)}
                        className={`
                            lg:hidden mt-auto flex items-center justify-center
                            w-11 h-11 rounded-xl transition-all duration-150 cursor-pointer
                            ${showSidebar
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50'
                                : 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a] border border-transparent'
                            }
                        `}
                        title="Palette & Tiles"
                        aria-label="Toggle palette and tiles"
                        aria-pressed={showSidebar}
                    >
                        <CustomColorIcon className="w-5 h-5" />
                    </button>
                </aside>

                <aside
                    className={`
                        flex-none overflow-hidden bg-[#1a1a1a] border-r border-[#2a2a2a]
                        transition-[width] duration-200 ease-in-out
                        ${showSidebar ? 'w-64' : 'w-0'}
                        lg:w-64
                    `}
                >
                    <div className="w-64 h-full flex flex-col">
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
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
                                    <button onClick={exportPalette} className="flex-1 px-3 py-1.5 text-xs bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all">
                                        <DownloadIcon className="w-3.5 h-3.5 inline mr-1.5" />
                                        Export
                                    </button>
                                    <button onClick={handleImportPalette} className="flex-1 px-3 py-1.5 text-xs bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all">
                                        <UploadIcon className="w-3.5 h-3.5 inline mr-1.5" />
                                        Import
                                    </button>
                                </div>
                            </div>

                            <div className="w-full h-px bg-[#2a2a2a]" />

                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">Tiles</span>
                                <TileControls />
                            </div>
                        </div>

                        <div className="flex-none p-4 border-t border-[#2a2a2a]">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">Active Color</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-sm border border-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" style={{ backgroundColor: currentColor }} />
                                    <span className="text-sm text-[#888] font-mono uppercase tracking-wider">{currentColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <section
                        ref={containerRef}
                        className="flex-1 flex items-center justify-center bg-[#0f0f0f] overflow-hidden relative"
                    >
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
                        <div className="absolute bottom-3 right-4 text-[9px] text-[#4a4a4a] tracking-[0.2em] uppercase bg-[#0f0f0f]/80 px-2.5 py-1 rounded-sm backdrop-blur-sm pointer-events-none">
                            {cellSize}px · {gridWidth}×{gridHeight}
                        </div>
                    </section>

                    <footer className="flex-none py-3 px-4 bg-[#1a1a1a] border-t border-[#2a2a2a] flex flex-wrap items-center justify-center gap-3">
                        <ZoomControls zoomLevel={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />

                        <div className="w-px h-6 bg-[#2a2a2a] hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button onClick={handleCopy} className="w-8 h-8 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Copy selection (Ctrl+C)">
                                <CopyIcon className="w-4 h-4" />
                            </button>
                            <button onClick={handlePaste} className="w-8 h-8 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Paste at mouse position (Ctrl+V)">
                                <PasteIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-[#2a2a2a] hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide text-[#888] hover:text-[#4a9eff] border border-[#333] hover:border-[#4a9eff] rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Export canvas">
                                <ImageIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>

                        <div className="w-px h-6 bg-[#2a2a2a] hidden sm:block" />

                        <button onClick={handleClearCanvas} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide text-[#888] hover:text-[#cf6679] border border-[#333] hover:border-[#cf6679]/50 rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Clear canvas">
                            <ClearIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
};