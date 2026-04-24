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
        try {
            const result = await invoke<{ path?: string; content: string }>('open_file');
            const data = JSON.parse(result.content);
            if (data.pixels && Array.isArray(data.pixels)) {
                setAllPixels(data.pixels);
                toast.success('File opened successfully');
            } else {
                toast.error('Invalid file format');
            }
        } catch (error) {
            toast.error(`Failed to open file: ${error}`);
        }
    };

    const handleSave = async () => {
        try {
            const { width, height, pixels } = useCanvasStore.getState();
            const data = { version: '1.0', width, height, pixels };
            const jsonContent = JSON.stringify(data, null, 2);
            const savedPath = await invoke<string>('save_file', {
                content: jsonContent,
                defaultPath: 'untitled.pixi',
            });
            toast.success(`Saved to ${savedPath}`);
        } catch (error) {
            toast.error(`Failed to save file: ${error}`);
        }
    };

    return (
        <nav className={`flex items-stretch h-full ${className}`}>
            <div className="flex items-center px-4 border-r border-[#2a2a2a]">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#4a9eff] uppercase">
                    PixiForge
                </span>
            </div>

            <div className="flex items-stretch">
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 text-[12px] text-[#888] 
                               hover:text-[#ddd] hover:bg-[#1f1f1f] transition-colors duration-100
                               border-r border-[#1a1a1a] cursor-pointer"
                    title="New (Ctrl+N)"
                >
                    <NewFileIcon className="w-3.5 h-3.5" />
                    <span className="tracking-wider">New</span>
                </button>
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 px-4 text-[12px] text-[#888] 
                               hover:text-[#ddd] hover:bg-[#1f1f1f] transition-colors duration-100
                               border-r border-[#1a1a1a] cursor-pointer"
                    title="Open (Ctrl+O)"
                >
                    <OpenFileIcon className="w-3.5 h-3.5" />
                    <span className="tracking-wider">Open</span>
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 text-[12px] text-[#888] 
                               hover:text-[#ddd] hover:bg-[#1f1f1f] transition-colors duration-100
                               border-r border-[#1a1a1a] last:border-r-0 cursor-pointer"
                    title="Save (Ctrl+S)"
                >
                    <SaveFileIcon className="w-3.5 h-3.5" />
                    <span className="tracking-wider">Save</span>
                </button>
            </div>
        </nav>
    );
};

export default MenuBar;