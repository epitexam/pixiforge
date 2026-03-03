import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useCanvasStore } from '../../stores/canvaStore';

export interface MenuBarProps {
    className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ className = '' }) => {
    const { clearCanvas, setAllPixels } = useCanvasStore();

    const handleNew = () => {
        clearCanvas();
    };

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
            const data = {
                version: '1.0',
                width,
                height,
                pixels,
            };

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

    return (
        <div
            className={`menubar ${className}`}
            style={{
                display: 'flex',
                gap: '8px',
                padding: '8px',
                backgroundColor: '#2d2d2d',
                borderRadius: '4px',
                marginBottom: '10px',
            }}
        >
            <button
                onClick={handleNew}
                style={buttonStyle}
            >
                New
            </button>
            <button
                onClick={handleOpen}
                style={buttonStyle}
            >
                Open
            </button>
            <button
                onClick={handleSave}
                style={buttonStyle}
            >
                Save
            </button>
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#4a4a4a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
};

export default MenuBar;