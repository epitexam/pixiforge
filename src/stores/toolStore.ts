import { create } from 'zustand';
import { Color } from '../types';

export type Tool = 'pencil' | 'eraser' | 'picker' | 'select';

interface ToolStore {
    activeTool: Tool;
    currentColor: Color;
    setActiveTool: (tool: Tool) => void;
    setCurrentColor: (color: Color) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
    activeTool: 'pencil',
    currentColor: '#FF0000',
    setActiveTool: (tool) => set({ activeTool: tool }),
    setCurrentColor: (color) => set({ currentColor: color }),
}));