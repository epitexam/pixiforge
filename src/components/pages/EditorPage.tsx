import React, { useState, useRef } from 'react';
import { useToolStore } from '../../stores/toolStore';
import { MenuBar } from '../organisms/MenuBar';
import { Toolbar } from '../organisms/Toolbar';
import { Palette } from '../molecules/Palette';
import { Canvas, CanvasHandle } from '../organisms/Canvas';
import { ZoomControls } from '../atoms/ZoomControls';
import { useCanvasStore } from '../../stores/canvaStore';

const DEFAULT_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#C0C0C0', '#808080',
    '#800000', '#808000', '#008000', '#800080', '#008080',
    '#000080', '#FF6600', '#6600FF', '#FF0066', '#00FF66',
    '#993366', '#66CCCC', '#FF99CC', '#CCCC00', '#996633',
];

export const EditorPage: React.FC = () => {
    const { clearCanvas } = useCanvasStore();
    const { currentColor, setCurrentColor } = useToolStore();

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

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] overflow-hidden font-mono select-none">
            <header className="flex-none h-10 bg-[#161616] border-b border-[#2a2a2a] flex items-stretch z-20">
                <MenuBar />
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="flex-none w-14 bg-[#161616] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1">
                    <Toolbar orientation="vertical" />
                </aside>

                <section className="flex-1 flex items-center justify-center bg-[#0d0d0d] relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #3a3a3a 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative z-10 w-full h-full flex items-center justify-center overflow-auto">
                        <div className="inline-block shadow-[0_0_60px_rgba(0,0,0,0.8)] ring-1 ring-[#2a2a2a] bg-[#1a1a1a]">
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
                        </div>
                    </div>

                    <div className="absolute bottom-3 right-4 text-[10px] text-[#3a3a3a] tracking-[0.2em] uppercase">
                        16px · 64×64
                    </div>
                </section>

                <aside className="hidden lg:flex lg:flex-col lg:w-52 bg-[#161616] border-l border-[#2a2a2a]">
                    <div className="px-3 py-2 border-b border-[#2a2a2a]">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#444] uppercase">
                            Layers
                        </span>
                    </div>

                    <div className="m-2 px-2 py-2 rounded-sm bg-[#1e1e1e] border border-[#2f2f2f] flex items-center gap-2 cursor-pointer hover:border-[#3f3f3f] transition-colors">
                        <div className="w-3 h-3 rounded-sm bg-[#3a3a3a] flex-none" />
                        <span className="text-[11px] text-[#999]">Background</span>
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#4a9eff] flex-none" />
                    </div>

                    <div className="flex-1" />

                    <div className="px-3 py-3 border-t border-[#2a2a2a]">
                        <span className="text-[9px] tracking-[0.2em] text-[#444] uppercase">
                            Active Color
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-sm border border-[#333] flex-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                                style={{ backgroundColor: currentColor }}
                            />
                            <span className="text-[10px] text-[#666] font-mono uppercase tracking-wider">
                                {currentColor}
                            </span>
                        </div>
                    </div>
                </aside>
            </main>

            <footer className="flex-none h-14 bg-[#161616] border-t border-[#2a2a2a] flex items-center gap-3 px-4 overflow-x-auto">
                <div
                    className="flex-none w-8 h-8 rounded-sm border border-[#333] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: currentColor }}
                    title={currentColor}
                />

                <div className="flex-none w-px h-6 bg-[#2a2a2a]" />

                <div className="flex-1 min-w-0">
                    <Palette
                        colors={DEFAULT_COLORS}
                        selectedColor={currentColor}
                        onSelectColor={setCurrentColor}
                        swatchSize={28}
                        showCustomPicker={true}
                    />
                </div>

                <div className="flex-none w-px h-6 bg-[#2a2a2a]" />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="w-7 h-7 flex items-center justify-center bg-[#252525] border border-[#333] rounded-sm hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] text-xs transition-all"
                        title="Copy selection (Ctrl+C)"
                    >
                        📋
                    </button>
                    <button
                        onClick={handlePaste}
                        className="w-7 h-7 flex items-center justify-center bg-[#252525] border border-[#333] rounded-sm hover:border-[#4a9eff] hover:text-[#4a9eff] text-[#aaa] text-xs transition-all"
                        title="Paste at mouse position (Ctrl+V)"
                    >
                        📌
                    </button>
                </div>

                <div className="flex-none w-px h-6 bg-[#2a2a2a]" />

                <ZoomControls
                    zoomLevel={scale}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                />

                <div className="flex-none w-px h-6 bg-[#2a2a2a]" />

                <button
                    onClick={clearCanvas}
                    className="flex-none px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase
                               text-[#555] hover:text-[#cf6679]
                               border border-[#252525] hover:border-[#cf6679]/40
                               rounded-sm transition-all duration-150 cursor-pointer bg-transparent"
                >
                    ✕ Clear
                </button>
            </footer>
        </div>
    );
};