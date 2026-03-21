export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasHandle {
  copySelection: () => void;
  pasteSelection: (x?: number, y?: number) => void;
  pasteAtMouse: () => void;
  hasSelection: () => boolean;
}
