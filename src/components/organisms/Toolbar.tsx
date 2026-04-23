import React, { useEffect } from 'react';
import { useToolStore, Tool } from '../../stores/toolStore';
import { PencilIcon, EraserIcon, PickerIcon, SelectIcon } from '../atoms/ToolIcons';

export interface ToolbarProps {
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const TOOLS: { id: Tool; label: string; icon: React.FC<{ className?: string }>; shortcut: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: PencilIcon, shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', icon: EraserIcon, shortcut: 'E' },
    { id: 'picker', label: 'Picker', icon: PickerIcon, shortcut: 'I' },
    { id: 'select', label: 'Select', icon: SelectIcon, shortcut: 'S' },
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
                case 'b':
                    e.preventDefault();
                    setActiveTool('pencil');
                    break;
                case 'e':
                    e.preventDefault();
                    setActiveTool('eraser');
                    break;
                case 'i':
                    e.preventDefault();
                    setActiveTool('picker');
                    break;
                case 's':
                    e.preventDefault();
                    setActiveTool('select');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveTool]);

    return (
        <div
            className={`flex ${isVertical ? 'flex-col' : 'flex-row flex-wrap'} gap-1 ${className}`}
        >
            {isVertical && (
                <span className="text-[8px] tracking-[0.2em] text-[#333] uppercase text-center mb-1">
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
                            ${isVertical ? 'w-10 h-10' : 'w-10 h-10'}
                            rounded-sm transition-all duration-100 cursor-pointer
                            ${isActive
                                ? 'bg-[#4a9eff]/15 text-[#4a9eff] ring-1 ring-[#4a9eff]/50'
                                : 'text-[#555] hover:text-[#bbb] hover:bg-[#1e1e1e]'
                            }
                        `}
                    >
                        <Icon className="w-5 h-5" />

                        {isVertical && (
                            <span className="
                                absolute left-full ml-2 px-2 py-1
                                text-[10px] text-[#ccc] bg-[#1a1a1a] border border-[#333]
                                rounded-sm whitespace-nowrap pointer-events-none
                                opacity-0 group-hover:opacity-100 transition-opacity duration-100
                                z-50 font-mono tracking-wider
                            ">
                                {label}
                                <span className="ml-2 text-[#444]">{shortcut}</span>
                            </span>
                        )}
                    </button>
                );
            })}

            {isVertical && <div className="w-6 h-px bg-[#252525] mx-auto my-1" />}
        </div>
    );
};

export default Toolbar;