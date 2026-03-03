import { create } from 'zustand';
import { Tool, Color } from '../types';

const DEFAULT_COLOR: Color = '#000000';
const DEFAULT_TOOL: Tool = 'pencil';

interface ToolStore {
    activeTool: Tool;
    currentColor: Color;
    setTool: (tool: Tool) => void;
    setColor: (color: Color) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
    activeTool: DEFAULT_TOOL,
    currentColor: DEFAULT_COLOR,
    setTool: (tool) => set({ activeTool: tool }),
    setColor: (color) => set({ currentColor: color }),
}));