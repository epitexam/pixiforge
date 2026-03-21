import { useEffect, RefObject } from "react";

export const usePreventContextMenu = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handler = (e: Event) => e.preventDefault();
    element.addEventListener("contextmenu", handler);
    return () => element.removeEventListener("contextmenu", handler);
  }, [ref]);
};
