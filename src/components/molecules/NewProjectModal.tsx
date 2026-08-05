import React, { useEffect, useState } from 'react';

export interface NewProjectOptions {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    backgroundColor: string;
}

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (options: NewProjectOptions) => void;
    initialWidth: number;
    initialHeight: number;
    initialTileWidth: number;
    initialTileHeight: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const NewProjectModal: React.FC<NewProjectModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    initialWidth,
    initialHeight,
    initialTileWidth,
    initialTileHeight,
}) => {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
    const [tileWidth, setTileWidth] = useState(initialTileWidth);
    const [tileHeight, setTileHeight] = useState(initialTileHeight);
    const [backgroundColor, setBackgroundColor] = useState('#F0F0F0');

    useEffect(() => {
        if (!isOpen) return;
        setWidth(initialWidth);
        setHeight(initialHeight);
        setTileWidth(initialTileWidth);
        setTileHeight(initialTileHeight);
        setBackgroundColor('#F0F0F0');
    }, [isOpen, initialWidth, initialHeight, initialTileWidth, initialTileHeight]);

    if (!isOpen) return null;

    const handleCreate = () => {
        const nextWidth = clamp(Math.round(Number(width) || initialWidth), 1, 512);
        const nextHeight = clamp(Math.round(Number(height) || initialHeight), 1, 512);
        const nextTileWidth = clamp(Math.round(Number(tileWidth) || initialTileWidth), 1, nextWidth);
        const nextTileHeight = clamp(Math.round(Number(tileHeight) || initialTileHeight), 1, nextHeight);

        onCreate({
            width: nextWidth,
            height: nextHeight,
            tileWidth: nextTileWidth,
            tileHeight: nextTileHeight,
            backgroundColor,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#111] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] bg-[#181818]">
                    <div>
                        <h2 className="text-sm font-semibold text-white">New project</h2>
                        <p className="text-xs text-gray-500">Set the canvas size and base settings before creating it.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#333] hover:text-white"
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-5 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            Width
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={width}
                                onChange={(event) => setWidth(Number(event.target.value))}
                                className="mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                            />
                        </label>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            Height
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={height}
                                onChange={(event) => setHeight(Number(event.target.value))}
                                className="mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            Tile width
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={tileWidth}
                                onChange={(event) => setTileWidth(Number(event.target.value))}
                                className="mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                            />
                        </label>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            Tile height
                            <input
                                type="number"
                                min="1"
                                max="512"
                                value={tileHeight}
                                onChange={(event) => setTileHeight(Number(event.target.value))}
                                className="mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                            />
                        </label>
                    </div>

                    <label className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-gray-300">
                        <span>Background color</span>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            className="h-9 w-16 cursor-pointer rounded border border-[#2a2a2a] bg-transparent p-1"
                        />
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#2a2a2a] bg-[#181818] px-5 py-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-sm text-gray-400 transition hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        type="button"
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                        Create project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;
