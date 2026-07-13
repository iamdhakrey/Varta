import Sidebar from "./components/Sidebar";
import RequestEditor from "./components/RequestEditor";
import ResponsePanel from "./components/ResponsePanel";
import CommandPalette from "./components/CommandPalette";
import HistoryDrawer from "./components/HistoryDrawer";
import { useVartaStore } from "./store";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { SettingsPanel } from "./components/SettingsPanel";

export default function App() {
  useKeyboardShortcuts();

  const tabs = useVartaStore((s) => s.tabs);
  const activeTabId = useVartaStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const { height, onMouseDown } = useResizablePanel(300, 160, 640);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <RequestEditor />
        </div>

        {activeTab && (
          <>
            <div
              onMouseDown={onMouseDown}
              className="h-1 shrink-0 cursor-row-resize bg-border hover:bg-primary/60"
            />
            <div
              style={{ height }}
              className="shrink-0 border-t border-border bg-bg"
            >
              <ResponsePanel
                response={activeTab.response}
                isSending={activeTab.isSending}
                error={activeTab.error}
              />
            </div>
          </>
        )}
      </div>

      <HistoryDrawer />
      <CommandPalette />
      <SettingsPanel />
    </div>
  );
}
