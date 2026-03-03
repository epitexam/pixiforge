export type Color = string;

export interface PixelData {
    x: number;
    y: number;
    color: Color;
}

export interface CanvasState {
    width: number;
    height: number;
    pixels: Color[][];
}

export type Tool = 'pencil' | 'eraser' | 'picker';

export interface ToolState {
    activeTool: Tool;
    currentColor: Color;
}