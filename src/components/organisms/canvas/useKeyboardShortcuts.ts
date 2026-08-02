import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  copySelection: () => void;
  pasteAtMouse: () => void;
}

export const useKeyboardShortcuts = ({
  copySelection,
  pasteAtMouse,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c") {
          e.preventDefault();
          copySelection();
        } else if (e.key === "v") {
          e.preventDefault();
          pasteAtMouse();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelection, pasteAtMouse]);
};