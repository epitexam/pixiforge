import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { NewFileIcon, OpenFileIcon, SaveFileIcon } from '../atoms/MenuIcons';
import { useCanvasStore } from '../../stores/canvaStore';

export interface MenuBarProps {
    className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ className = '' }) => {
    const { clearCanvas, setAllPixels } = useCanvasStore();

    const handleNew = () => {
        clearCanvas();
        toast.success('New canvas created');
    };

    const handleOpen = async () => {
        if (typeof invoke !== 'function') {
            toast.error('Tauri API not available. Run with `npm run tauri dev`.');
            return;
        }
        try {
            const result = await invoke<{ path?: string; content: string }>('open_file');
            const data = JSON.parse(result.content);
            let pixels2D: string[][];
            if (data.pixels && Array.isArray(data.pixels)) {
                if (data.pixels.length > 0 && Array.isArray(data.pixels[0])) {
                    pixels2D = data.pixels;
                } else {
                    const width = data.width ?? Math.sqrt(data.pixels.length);
                    const height = data.height ?? Math.sqrt(data.pixels.length);
                    pixels2D = [];
                    for (let y = 0; y < height; y++) {
                        const row: string[] = [];
                        for (let x = 0; x < width; x++) {
                            row.push(data.pixels[y * width + x] ?? '#F0F0F0');
                        }
                        pixels2D.push(row);
                    }
                }
            } else {
                throw new Error('Invalid file format');
            }
            setAllPixels(pixels2D);
            toast.success('File opened successfully');
        } catch (error) {
            toast.error(`Failed to open file: ${error}`);
            console.error(`Failed to open file: ${error}`);
        }
    };

    const handleSave = async () => {
        if (typeof invoke !== 'function') {
            toast.error('Tauri API not available. Run with `npm run tauri dev`.');
            return;
        }
        try {
            const { width, height, pixels: pixels1D } = useCanvasStore.getState();
            const pixels2D: string[][] = [];
            for (let y = 0; y < height; y++) {
                const row: string[] = [];
                for (let x = 0; x < width; x++) {
                    row.push(pixels1D[y * width + x]);
                }
                pixels2D.push(row);
            }
            const data = { version: '1.0', width, height, pixels: pixels2D };
            const jsonContent = JSON.stringify(data, null, 2);
            const savedPath = await invoke<string>('save_file', {
                content: jsonContent,
                defaultPath: 'untitled.json',
            });
            toast.success(`Saved to ${savedPath}`);
        } catch (error) {
            toast.error(`Failed to save file: ${error}`);
            console.error(`Failed to save file: ${error}`);
        }
    };

    return (
        <nav className={`flex items-stretch h-12 ${className}`}>
            <div className="flex items-center px-2 sm:px-4 border-r border-[#2a2a2a] shrink-0">
                <span className="text-xs font-bold tracking-widest text-blue-500 uppercase whitespace-nowrap">
                    PixiForge
                </span>
            </div>

            <div className="flex items-stretch overflow-x-auto px-2 gap-1">
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-2.5 sm:px-4 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors duration-100 whitespace-nowrap my-auto h-9 shrink-0"
                    title="New (Ctrl+N)"
                >
                    <NewFileIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">New</span>
                </button>
                
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 px-2.5 sm:px-4 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors duration-100 whitespace-nowrap my-auto h-9 shrink-0"
                    title="Open (Ctrl+O)"
                >
                    <OpenFileIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Open</span>
                </button>
                
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-2.5 sm:px-4 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors duration-100 whitespace-nowrap my-auto h-9 shrink-0"
                    title="Save (Ctrl+S)"
                >
                    <SaveFileIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                </button>
            </div>
        </nav>
    );
};

export default MenuBar;