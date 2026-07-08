import { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Cloud,
} from "lucide-react";
import { environments } from "../../data/mock";
import { useVartaStore } from "../../store";
// import { CollectionFolder, HttpMethod } from "../../types";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { CollectionsTree } from "./CollectionTree";


export default function Sidebar() {
  const [query, setQuery] = useState("");
  const activeEnvId = useVartaStore((s) => s.activeEnvId);
  const setEnv = useVartaStore((s) => s.setEnv);
  const newTab = useVartaStore((s) => s.newTab);

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-bg">
      {/* Workspace switcher */}
      {/* Top Section - Workspace Picker */}
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
            value={activeEnvId}
            onChange={(e) => setEnv(e.target.value)}
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id} className="bg-panel">
                {env.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={newTab}
          className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus size={14} />
          New request
        </button>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-sm text-text-secondary hover:bg-panel-raised transition-colors">
          <Upload size={14} />
          Import collection
        </button>
      </div>
    </aside>
  );
}
