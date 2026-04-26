import React, { useState, useRef } from 'react';
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
import { usePaletteStore } from '../../stores/paletteStore';

export const EditorPage: React.FC = () => {
    const { clearCanvas } = useCanvasStore();
    const { currentColor, setCurrentColor } = useToolStore();
    const {
        colors: paletteColors,
        exportPalette,
        importPalette,
        addColor,
        removeColor,
        updateColor
    } = usePaletteStore();

    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [exportWithGrid, setExportWithGrid] = useState(true);

    const canvasRef = useRef<CanvasHandle>(null);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.2, 5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev * 0.8, 0.2));
    };

    const handleZoomReset = () => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
    };

    const handleCopy = () => {
        canvasRef.current?.copySelection();
        toast.success('Selection copied');
    };

    const handlePaste = () => {
        canvasRef.current?.pasteAtMouse();
        toast.success('Selection pasted');
    };

    const handleExportPNG = () => {
        if (exportWithGrid) {
            const canvas = canvasRef.current?.getCanvas();
            if (!canvas) {
                toast.error('Canvas not available');
                return;
            }
            const link = document.createElement('a');
            link.download = 'pixiforge.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('PNG exported with grid');
        } else {
            const { width, height, pixels: pixels1D } = useCanvasStore.getState();
            const cellSize = 16;
            const offscreen = document.createElement('canvas');
            offscreen.width = width * cellSize;
            offscreen.height = height * cellSize;
            const ctx = offscreen.getContext('2d');
            if (!ctx) {
                toast.error('Failed to create export canvas');
                return;
            }
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = y * width + x;
                    const color = pixels1D[index] ?? '#F0F0F0';
                    ctx.fillStyle = color;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
            const link = document.createElement('a');
            link.download = 'pixiforge_nogrid.png';
            link.href = offscreen.toDataURL('image/png');
            link.click();
            toast.success('PNG exported without grid');
        }
    };

    const handleImportPalette = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                await importPalette(file);
                toast.success('Palette imported successfully');
            } catch (err) {
                toast.error('Invalid palette file');
            }
        };
        input.click();
    };

    const handleClearCanvas = () => {
        clearCanvas();
        toast.success('Canvas cleared');
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] overflow-hidden font-sans select-none">
            <Toaster position="top-center" richColors />

            <header className="flex-none h-11 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-stretch z-20">
                <MenuBar />
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="flex-none w-12 sm:w-14 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-2 sm:py-3 gap-0.5 sm:gap-1">
                    <Toolbar orientation="vertical" />
                </aside>

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

                <aside className="hidden lg:flex lg:flex-col lg:w-56 bg-[#1a1a1a] border-l border-[#2a2a2a]">
                    <div className="px-4 py-3 border-b border-[#2a2a2a]">
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#666] uppercase">
                            Layers
                        </span>
                    </div>
                    <div className="m-2 p-2 rounded-sm bg-[#252525] border border-[#333] flex items-center gap-2 cursor-pointer hover:border-[#4a9eff] transition-colors group">
                        <div className="w-4 h-4 rounded-sm bg-[#3a3a3a] flex-none" />
                        <span className="text-[12px] text-[#aaa] group-hover:text-[#ddd]">Background</span>
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#4a9eff] flex-none" />
                    </div>
                    <div className="flex-1" />
                    <div className="px-4 py-4 border-t border-[#2a2a2a]">
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-[#666] uppercase">
                            Active Color
                        </span>
                        <div className="mt-3 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-sm border border-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                                style={{ backgroundColor: currentColor }}
                            />
                            <span className="text-[11px] text-[#888] font-mono uppercase tracking-wider">
                                {currentColor}
                            </span>
                        </div>
                    </div>
                </aside>
            </main>

            <footer className="flex-none py-2 sm:py-3 px-2 sm:px-4 bg-[#1a1a1a] border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center gap-2 sm:gap-4 overflow-x-auto">
                <div className="flex-none w-7 h-7 sm:w-10 sm:h-10 rounded-sm border border-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: currentColor }} title={currentColor} />

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <div className="flex-1 w-full min-w-0">
                    <Palette
                        colors={paletteColors}
                        selectedColor={currentColor}
                        onSelectColor={setCurrentColor}
                        onAddColor={addColor}
                        onRemoveColor={removeColor}
                        onUpdateColor={updateColor}
                        swatchSize={24}
                        showCustomPicker={true}
                    />
                </div>

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={exportPalette} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Export palette">
                        <DownloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button onClick={handleImportPalette} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Import palette">
                        <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <TileControls />

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={handleCopy} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Copy selection (Ctrl+C)">
                        <CopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button onClick={handlePaste} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all" title="Paste at mouse position (Ctrl+V)">
                        <PasteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <ZoomControls zoomLevel={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={handleExportPNG} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-medium tracking-wide text-[#888] hover:text-[#4a9eff] border border-[#333] hover:border-[#4a9eff] rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Export as PNG">
                        <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">PNG</span>
                    </button>
                    <button onClick={() => setExportWithGrid(!exportWithGrid)} className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border transition-all ${exportWithGrid ? 'bg-[#4a9eff] text-white border-[#4a9eff]' : 'bg-[#252525] text-[#888] border-[#333] hover:border-[#4a9eff] hover:text-[#4a9eff]'}`} title={exportWithGrid ? "Export includes grid" : "Export without grid"}>
                        <GridIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>

                <div className="flex-none w-px h-5 bg-[#2a2a2a] hidden sm:block" />

                <button onClick={handleClearCanvas} className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-medium tracking-wide text-[#888] hover:text-[#cf6679] border border-[#333] hover:border-[#cf6679]/50 rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]" title="Clear canvas">
                    <ClearIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Clear</span>
                </button>
            </footer>
        </div>
    );
};