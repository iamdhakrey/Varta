import { useCallback, useRef, useState } from "react";

/**
 * Drag-to-resize for a bottom panel within a vertical flex container.
 * Returns the panel height in pixels and a mouse-down handler for the
 * drag handle. Clamped between min/max so the panel can't be dragged
 * off-screen or collapsed to nothing.
 */
export function useResizablePanel(initial = 320, min = 160, max = 720) {
  const [height, setHeight] = useState(initial);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startY = e.clientY;
      const startHeight = height;

      function onMove(ev: MouseEvent) {
        if (!dragging.current) return;
        const delta = startY - ev.clientY;
        const next = Math.min(max, Math.max(min, startHeight + delta));
        setHeight(next);
      }

      function onUp() {
        dragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [height, min, max]
  );

  return { height, onMouseDown };
}
