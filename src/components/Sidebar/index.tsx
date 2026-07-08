import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Search,
  Plus,
  Upload,
  Cloud,
} from "lucide-react";
import { collections, environments } from "../../data/mock";
import { useVartaStore } from "../../store";
import { CollectionFolder, HttpMethod } from "../../types";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { CollectionsTree } from "./CollectionTree";

const methodColor: Record<HttpMethod, string> = {
  GET: "text-method-get",
  POST: "text-secondary",
  PUT: "text-warning",
  PATCH: "text-primary",
  DELETE: "text-error",
  OPTIONS: "text-text-muted",
  HEAD: "text-text-muted",
  QUERY: "text-text-muted",
};

function FolderNode({ folder }: { folder: CollectionFolder }) {
  const [open, setOpen] = useState(true);
  const openRequest = useVartaStore((s) => s.openRequest);
  const activeTabId = useVartaStore((s) => s.activeTabId);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium text-text-primary hover:bg-panel-raised"
      >
        {open ? (
          <ChevronDown size={13} className="text-text-secondary" />
        ) : (
          <ChevronRight size={13} className="text-text-secondary" />
        )}
        <Folder size={13} className="text-secondary" />
        {folder.name}
      </button>
      {open && (
        <div className="ml-5 flex flex-col gap-0.5 border-l border-borderMuted pl-2">
          {folder.requests.map((req) => (
            <button
              key={req.id}
              onClick={() => openRequest(req)}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
                activeTabId === req.id
                  ? "bg-panel-raised text-text-primary"
                  : "text-text-secondary hover:bg-panel-raised hover:text-text-primary"
              }`}
            >
              <span
                className={`w-9 shrink-0 text-[10px] font-semibold ${methodColor[req.method as HttpMethod]}`}
              >
                {req.method}
              </span>
              <span className="truncate">{req.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
