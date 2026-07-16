import React, { useEffect } from "react";
import { useVartaStore, useWorkspaceStore } from "../store"; // Adjust imports to match your store locations
import { EnvironmentEditor } from "./EnvironmentEditor";

export const EnvironmentModal: React.FC = () => {
  const isEnvEditorOpen = useVartaStore((s) => s.isEnvEditorOpen);
  const closeEnvEditor = useVartaStore((s) => s.closeEnvEditor);

  // Pull the active workspace ID required by the editor
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEnvEditorOpen) {
        closeEnvEditor();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnvEditorOpen, closeEnvEditor]);

  if (!isEnvEditorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={closeEnvEditor}
    >
      <div
        className="relative flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-elevated animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {activeWorkspaceId ? (
          <EnvironmentEditor activeWorkspaceId={activeWorkspaceId} />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            No active workspace selected.
          </div>
        )}
      </div>
    </div>
  );
};
