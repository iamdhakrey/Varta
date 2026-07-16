import { Plus, X, Save, Copy, History, Settings } from "lucide-react";
import { MethodStyles, useSettingsStore, useVartaStore } from "../../store";
import { HttpMethod } from "../../types";

// const methodColor: Record<HttpMethod, string> = {
//   GET: "text-method-get",
//   POST: "text-secondary",
//   PUT: "text-warning",
//   PATCH: "text-primary",
//   DELETE: "text-error",
// };

export default function TabStrip() {
  const tabs = useVartaStore((s) => s.tabs);
  const activeTabId = useVartaStore((s) => s.activeTabId);
  const setActiveTab = useVartaStore((s) => s.setActiveTab);
  const closeTab = useVartaStore((s) => s.closeTab);
  const newTab = useVartaStore((s) => s.newTab);
  const toggleHistory = useVartaStore((s) => s.toggleHistory);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  return (
    <div className="flex items-center justify-between border-b border-border bg-panel pr-2">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex max-w-[180px] cursor-pointer items-center gap-2 border-r border-border px-3 py-2.5 text-sm ${
                active
                  ? "bg-bg text-text-primary border-t-2 border-t-primary"
                  : "text-text-secondary border-t-2 border-t-transparent hover:bg-panel-raised"
              }`}
            >
              <span
                className={`text-[10px] font-semibold ${MethodStyles[tab.request.method as HttpMethod]}`}
              >
                {tab.request.method}
              </span>
              <span className="truncate">
                {tab.request.name}
                {tab.isDirty ? " •" : ""}
              </span>
              <X
                size={12}
                className="ml-auto shrink-0 text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            </div>
          );
        })}
        <button
          onClick={newTab}
          className="flex shrink-0 items-center justify-center px-3 py-2.5 text-text-secondary hover:text-text-primary"
          aria-label="New tab"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-2">
        <button
          className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
          aria-label="Save"
        >
          <Save size={15} />
        </button>
        <button
          className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
          aria-label="Duplicate"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={() => toggleHistory()}
          className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
          aria-label="History"
        >
          <History size={15} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
          aria-label="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
