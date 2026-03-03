import React from 'react';
import { useToolStore, Tool } from '../../stores/toolStore';

export interface ToolbarProps {
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const TOOLS: { id: Tool; label: string; icon: string; shortcut: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: '✏', shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', icon: '◻', shortcut: 'E' },
    { id: 'picker', label: 'Picker', icon: '✦', shortcut: 'I' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
    className = '',
    orientation = 'vertical',
}) => {
    const { activeTool, setActiveTool } = useToolStore();
    const isVertical = orientation === 'vertical';

    return (
        <div
            className={`flex ${isVertical ? 'flex-col' : 'flex-row flex-wrap'} gap-1 ${className}`}
        >
            {isVertical && (
                <span className="text-[8px] tracking-[0.2em] text-[#333] uppercase text-center mb-1">
                    Tools
                </span>
            )}

            {TOOLS.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        title={`${tool.label} (${tool.shortcut})`}
                        aria-label={tool.label}
                        aria-pressed={isActive}
                        className={`
                            group relative flex items-center justify-center
                            ${isVertical ? 'w-10 h-10' : 'w-10 h-10'}
                            rounded-sm text-base transition-all duration-100 cursor-pointer
                            ${isActive
                                ? 'bg-[#4a9eff]/15 text-[#4a9eff] ring-1 ring-[#4a9eff]/50'
                                : 'text-[#555] hover:text-[#bbb] hover:bg-[#1e1e1e]'
                            }
                        `}
                    >
                        <span className="leading-none">{tool.icon}</span>

                        {isVertical && (
                            <span className="
                                absolute left-full ml-2 px-2 py-1
                                text-[10px] text-[#ccc] bg-[#1a1a1a] border border-[#333]
                                rounded-sm whitespace-nowrap pointer-events-none
                                opacity-0 group-hover:opacity-100 transition-opacity duration-100
                                z-50 font-mono tracking-wider
                            ">
                                {tool.label}
                                <span className="ml-2 text-[#444]">{tool.shortcut}</span>
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