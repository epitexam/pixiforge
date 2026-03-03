import React from 'react';
import { invoke } from '@tauri-apps/api/core';
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
        { label: 'File', children: [
            { label: 'New', action: handleNew, shortcut: 'Ctrl+N' },
            { label: 'Open', action: handleOpen, shortcut: 'Ctrl+O' },
            { label: 'Save', action: handleSave, shortcut: 'Ctrl+S' },
        ]},
    ];

    return (
        <nav className={`flex items-stretch h-full ${className}`}>
            <div className="flex items-center px-4 border-r border-[#2a2a2a]">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#4a9eff] uppercase">
                    Pixi
                </span>
            </div>

            <div className="flex items-stretch">
                {menuItems[0].children.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className="px-4 text-[12px] text-[#888] hover:text-[#ddd] hover:bg-[#1f1f1f]
                                   border-r border-[#1a1a1a] transition-colors duration-100
                                   tracking-wider cursor-pointer"
                        title={item.shortcut}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MenuBar;