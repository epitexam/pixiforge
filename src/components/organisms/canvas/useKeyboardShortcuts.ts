import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  copySelection: () => void;
  pasteAtMouse: () => void;
  undo: () => void;
  redo: () => void;
}

export const useKeyboardShortcuts = ({
  copySelection,
  pasteAtMouse,
  undo,
  redo,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable]')) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c") {
          e.preventDefault();
          copySelection();
        } else if (e.key === "v") {
          e.preventDefault();
          pasteAtMouse();
        } else if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelection, pasteAtMouse, undo, redo]);
};