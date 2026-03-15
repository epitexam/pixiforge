import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { NewFileIcon, OpenFileIcon, SaveFileIcon } from '../atoms/MenuIcons';
import { useCanvasStore } from '../../stores/canvaStore';

export interface MenuBarProps {
    className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ className = '' }) => {
    const { clearCanvas, setAllPixels } = useCanvasStore();

    const handleNew = () => clearCanvas();

    const handleOpen = async () => {
        try {
            const result = await invoke<{ path?: string; content: string }>('open_file');
            const data = JSON.parse(result.content);
            if (data.pixels && Array.isArray(data.pixels)) {
                setAllPixels(data.pixels);
            } else {
                alert('Invalid file format');
            }
        } catch (error) {
            console.error('Open failed:', error);
            alert(`Failed to open file: ${error}`);
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
            console.log('Saved to:', savedPath);
        } catch (error) {
            console.error('Save failed:', error);
            alert(`Failed to save file: ${error}`);
        }
    };

    const menuItems = [
        { label: 'New', icon: NewFileIcon, action: handleNew, shortcut: 'Ctrl+N' },
        { label: 'Open', icon: OpenFileIcon, action: handleOpen, shortcut: 'Ctrl+O' },
        { label: 'Save', icon: SaveFileIcon, action: handleSave, shortcut: 'Ctrl+S' },
    ];

    return (
        <nav className={`flex items-stretch h-full ${className}`}>
            <div className="flex items-center px-4 border-r border-[#2a2a2a]">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#4a9eff] uppercase">
                    PixiForge
                </span>
            </div>

            <div className="flex items-stretch">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center gap-2 px-4 text-[12px] text-[#888] 
                                       hover:text-[#ddd] hover:bg-[#1f1f1f] transition-colors duration-100
                                       border-r border-[#1a1a1a] last:border-r-0 cursor-pointer"
                            title={`${item.label} (${item.shortcut})`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MenuBar;