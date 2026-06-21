import { useEffect } from "react";
import { useVartaStore } from "../store";

export function useKeyboardShortcuts() {
  const newTab = useVartaStore((s) => s.newTab);
  const sendActiveRequest = useVartaStore((s) => s.sendActiveRequest);
  const toggleCommandPalette = useVartaStore((s) => s.toggleCommandPalette);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault();
          newTab();
          break;
        case "p":
          e.preventDefault();
          toggleCommandPalette(true);
          break;
        case "enter":
          e.preventDefault();
          sendActiveRequest();
          break;
        case "s":
          e.preventDefault();
          // Hook up to a real save-to-collection action.
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [newTab, sendActiveRequest, toggleCommandPalette]);
}
