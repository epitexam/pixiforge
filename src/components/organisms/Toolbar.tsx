import React, { useEffect } from 'react';
import { useToolStore, Tool } from '../../stores/toolStore';
import { PencilIcon, EraserIcon, PickerIcon, SelectIcon, GridIcon } from '../atoms/ToolIcons';

export interface ToolbarProps {
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const TOOLS: { id: Tool; label: string; icon: React.FC<{ className?: string }>; shortcut: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: PencilIcon, shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', icon: EraserIcon, shortcut: 'E' },
    { id: 'picker', label: 'Picker', icon: PickerIcon, shortcut: 'I' },
    { id: 'select', label: 'Select', icon: SelectIcon, shortcut: 'S' },
    { id: 'tileSelect', label: 'Tile Select', icon: GridIcon, shortcut: 'T' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
    className = '',
    orientation = 'vertical',
}) => {
    const { activeTool, setActiveTool } = useToolStore();
    const isVertical = orientation === 'vertical';

    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.ctrlKey || e.metaKey) return;

            const key = e.key.toLowerCase();
            switch (key) {
                case 'b': e.preventDefault(); setActiveTool('pencil'); break;
                case 'e': e.preventDefault(); setActiveTool('eraser'); break;
                case 'i': e.preventDefault(); setActiveTool('picker'); break;
                case 's': e.preventDefault(); setActiveTool('select'); break;
                case 't': e.preventDefault(); setActiveTool('tileSelect'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveTool]);

    return (
        <div className={`flex ${isVertical ? 'flex-col' : 'flex-row flex-wrap'} gap-2 ${className}`}>
            {isVertical && (
                <span className="text-[10px] tracking-widest text-gray-600 uppercase text-center mb-1 font-medium">
                    Tools
                </span>
            )}

            {TOOLS.map(({ id, label, icon: Icon, shortcut }) => {
                const isActive = activeTool === id;
                return (
                    <button
                        key={id}
                        onClick={() => setActiveTool(id)}
                        title={`${label} (${shortcut})`}
                        aria-label={label}
                        aria-pressed={isActive}
                        className={`
                            group relative flex items-center justify-center
                            w-11 h-11
                            rounded-xl transition-all duration-150 cursor-pointer
                            ${isActive
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50'
                                : 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a] border border-transparent'
                            }
                        `}
                    >
                        <Icon className="w-5 h-5" />

                        {isVertical && (
                            <span className="
                                absolute left-full ml-3 px-2.5 py-1.5
                                text-xs text-gray-200 bg-[#111] border border-[#2a2a2a]
                                rounded-lg whitespace-nowrap pointer-events-none
                                opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                z-50 font-mono tracking-wider shadow-xl
                            ">
                                {label}
                                <span className="ml-2 text-gray-500">{shortcut}</span>
                            </span>
                        )}
                    </button>
                );
            })}

            {isVertical && <div className="w-8 h-px bg-[#2a2a2a] mx-auto my-3" />}
        </div>
    );
};

export default Toolbar;