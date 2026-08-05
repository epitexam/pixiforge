import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { NewFileIcon, OpenFileIcon, SaveFileIcon } from '../atoms/MenuIcons';
import { ImageIcon } from '../atoms/EditorIcons';
import { useCanvasStore } from '../../stores/canvaStore';
import NewProjectModal, { NewProjectOptions } from '../molecules/NewProjectModal';

export interface MenuBarProps {
    className?: string;
    onExport?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ className = '', onExport }) => {
    const { width, height, tileWidth, tileHeight, setAllPixels, loadTileProject, createNewProject } = useCanvasStore();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    const handleNew = () => {
        setShowNewProjectModal(true);
    };

    const handleCreateNewProject = (options: NewProjectOptions) => {
        createNewProject(options);
        toast.success('New project created');
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
            loadTileProject(data.tileWidth, data.tileHeight, data.tiles);
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
            const { width, height, pixels: pixels1D, tileWidth, tileHeight, tiles } = useCanvasStore.getState();
            const pixels2D: string[][] = [];
            for (let y = 0; y < height; y++) {
                const row: string[] = [];
                for (let x = 0; x < width; x++) {
                    row.push(pixels1D[y * width + x]);
                }
                pixels2D.push(row);
            }
            const data = { version: '1.1', width, height, pixels: pixels2D, tileWidth, tileHeight, tiles };
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


    const btnClass = "flex items-center gap-2 px-3 sm:px-4 text-sm text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors duration-100 whitespace-nowrap h-9 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50";

    return (
        <>
            <NewProjectModal
                isOpen={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
                onCreate={handleCreateNewProject}
                initialWidth={width}
                initialHeight={height}
                initialTileWidth={tileWidth}
                initialTileHeight={tileHeight}
            />

            <nav className={`flex items-center px-2 gap-1 ${className}`}>
            <button onClick={handleNew} className={btnClass} title="New (Ctrl+N)">
                <NewFileIcon className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
            </button>

            <button onClick={handleOpen} className={btnClass} title="Open (Ctrl+O)">
                <OpenFileIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
            </button>

            <button onClick={handleSave} className={btnClass} title="Save (Ctrl+S)">
                <SaveFileIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
            </button>

            {onExport && (
                <>

                    <div className="w-px h-6 bg-[#2a2a2a] mx-1 sm:mx-2 shrink-0" />
                    <button
                        onClick={onExport}
                        className={`${btnClass} text-blue-400 hover:text-blue-300 hover:bg-blue-500/10`}
                        title="Export canvas"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </>
            )}
        </nav>
        </>
    );
};

export default MenuBar;
