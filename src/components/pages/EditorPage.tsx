import React, { useState, useRef } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { MenuBar } from '../organisms/MenuBar';
import { Toolbar } from '../organisms/Toolbar';
import { Palette } from '../molecules/Palette';
import { Canvas } from '../organisms/Canvas';
import { ZoomControls } from '../atoms/ZoomControls';
import { CopyIcon, PasteIcon, ClearIcon, DownloadIcon, UploadIcon } from '../atoms/EditorIcons';
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
    };

    const handlePaste = () => {
        canvasRef.current?.pasteAtMouse();
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
                alert('Palette imported successfully');
            } catch (err) {
                alert('Invalid palette file');
            }
        };
        input.click();
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] overflow-hidden font-sans select-none">
            <header className="flex-none h-11 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-stretch z-20">
                <MenuBar />
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="flex-none w-14 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1">
                    <Toolbar orientation="vertical" />
                </aside>

                {/* Section avec centrage CSS uniquement */}
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
                    {/* Overlay d'information */}
                    <div className="absolute bottom-3 right-4 text-[10px] text-[#4a4a4a] tracking-[0.2em] uppercase bg-[#0f0f0f]/80 px-2 py-1 rounded-sm backdrop-blur-sm pointer-events-none">
                        16px · 64×64
                    </div>
                </section>

                <aside className="hidden lg:flex lg:flex-col lg:w-56 bg-[#1a1a1a] border-l border-[#2a2a2a]">
                    {/* ... (inchangé) ... */}
                </aside>
            </main>

            {/* Footer avec hauteur augmentée et meilleur espacement */}
            <footer className="flex-none h-16 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center gap-4 px-6 overflow-x-auto">
                {/* Échantillon de couleur active */}
                <div
                    className="flex-none w-10 h-10 rounded-sm border border-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: currentColor }}
                    title={currentColor}
                />

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                {/* Palette avec plus d'espace vertical */}
                <div className="flex-1 min-w-0 py-1">
                    <Palette
                        colors={paletteColors}
                        selectedColor={currentColor}
                        onSelectColor={setCurrentColor}
                        onAddColor={addColor}
                        onRemoveColor={removeColor}
                        onUpdateColor={updateColor}
                        swatchSize={28}
                        showCustomPicker={true}
                    />
                </div>

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                {/* Boutons import/export */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportPalette}
                        className="w-9 h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                        title="Export palette"
                    >
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleImportPalette}
                        className="w-9 h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                        title="Import palette"
                    >
                        <UploadIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                <TileControls />

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="w-9 h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                        title="Copy selection (Ctrl+C)"
                    >
                        <CopyIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handlePaste}
                        className="w-9 h-9 flex items-center justify-center bg-[#252525] border border-[#333] rounded-md hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] transition-all"
                        title="Paste at mouse position (Ctrl+V)"
                    >
                        <PasteIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                <ZoomControls
                    zoomLevel={scale}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                />

                <div className="flex-none w-px h-8 bg-[#2a2a2a]" />

                <button
                    onClick={clearCanvas}
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-medium tracking-wide
                               text-[#888] hover:text-[#cf6679]
                               border border-[#333] hover:border-[#cf6679]/50
                               rounded-md transition-all bg-[#252525] hover:bg-[#2a2a2a]"
                    title="Clear canvas"
                >
                    <ClearIcon className="w-4 h-4" />
                    <span>Clear</span>
                </button>
            </footer>
        </div>
    );
};