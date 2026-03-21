import { useEffect, useRef } from "react";

export const useGlobalMousePosition = () => {
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(
    null,
  );

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return lastMousePosRef;
};
