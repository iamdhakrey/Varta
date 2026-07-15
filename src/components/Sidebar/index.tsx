import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Cloud,
  Settings,
  Globe, // <-- Added Globe icon
} from "lucide-react";
// import { environments } from "../../data/mock";
import { useVartaStore, useSettingsStore, useWorkspaceStore } from "../../store";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { CollectionsTree } from "./CollectionTree";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const newTab = useVartaStore((s) => s.newTab);

  const {
    environments,
    activeEnvironmentId,
    fetchEnvironments,
    setActiveEnvironment,
  } = useWorkspaceStore();


  useEffect(() => {
    if (activeWorkspaceId) {
      fetchEnvironments(activeWorkspaceId);
    }
  }, [activeWorkspaceId, fetchEnvironments]);


  // <-- Pull the trigger function from your store
  const openEnvEditor = useVartaStore((s) => s.openEnvEditor);

  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-bg">
      {/* Workspace switcher */}
      <WorkspaceSelector />

      {/* Divider */}
      <div className="h-[1px] bg-borderMuted w-full" />

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5">
          <Search size={13} className="text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <kbd className="kbd">⌘P</kbd>
        </div>
      </div>

      {/* Collections tree */}
      <CollectionsTree />

      {/* Environment + actions */}
      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5">
          <Cloud size={13} className="text-text-secondary" />
          <select
            value={activeEnvironmentId ?? ""}
            onChange={(e) => setActiveEnvironment(e.target.value || null)}
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          >
            <option value="" className="bg-panel">No Environment</option>
            {environments.map((env) => (
              <option key={env.environment.id} value={env.environment.id} className="bg-panel">
                {env.environment.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={newTab}
          className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus size={14} />
          New request
        </button>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-sm text-text-secondary hover:bg-panel-raised transition-colors cursor-pointer">
          <Upload size={14} />
          Import collection
        </button>
      </div>

      {/* FOOTER - Stacked Buttons */}
      <div className="flex flex-col gap-1 border-t border-border p-2">

        {/* NEW: Environments Trigger */}
        <button
          onClick={openEnvEditor}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-borderMuted hover:text-text-primary"
        >
          <Globe size={16} />
          Environments
        </button>

        {/* EXISTING: Settings Trigger */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-borderMuted hover:text-text-primary"
        >
          <Settings size={16} />
          Settings
        </button>

      </div>
    </aside>
  );
}
