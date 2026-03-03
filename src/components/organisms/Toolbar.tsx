import React from 'react';
import { useToolStore, Tool } from '../../stores/toolStore';

export interface ToolbarProps {
    /**
     * Optional CSS class name for additional styling.
     */
    className?: string;
}

/**
 * Organism component that displays the tool selection buttons.
 * It reads and updates the active tool from the tool store.
 */
export const Toolbar: React.FC<ToolbarProps> = ({ className = '' }) => {
    const { activeTool, setActiveTool } = useToolStore();

    const tools: { id: Tool; label: string; icon?: string }[] = [
        { id: 'pencil', label: 'Pencil' },
        { id: 'eraser', label: 'Eraser' },
        { id: 'picker', label: 'Picker' },
    ];

    return (
        <div
            className={`toolbar ${className}`}
            style={{
                display: 'flex',
                gap: '8px',
                padding: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '8px',
            }}
        >
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: activeTool === tool.id ? '#007acc' : '#ffffff',
                        color: activeTool === tool.id ? '#ffffff' : '#000000',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: activeTool === tool.id ? 'bold' : 'normal',
                    }}
                    aria-label={`Select ${tool.label} tool`}
                    title={tool.label}
                >
                    {tool.label}
                </button>
            ))}
        </div>
    );
};

export default Toolbar;