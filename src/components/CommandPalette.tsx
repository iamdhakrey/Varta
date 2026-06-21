import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useVartaStore } from "../store";
import { collections } from "../data/mock";

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  action: () => void;
}

export default function CommandPalette() {
  const isOpen = useVartaStore((s) => s.isCommandPaletteOpen);
  const toggle = useVartaStore((s) => s.toggleCommandPalette);
  const openRequest = useVartaStore((s) => s.openRequest);
  const newTab = useVartaStore((s) => s.newTab);
  const [query, setQuery] = useState("");

  const items: PaletteItem[] = useMemo(() => {
    const requestItems = collections.flatMap((c) =>
      c.folders.flatMap((f) =>
        f.requests.map((r) => ({
          id: r.id,
          label: r.name,
          hint: `${r.method} · ${c.name}`,
          action: () => openRequest(r),
        })),
      ),
    );
    return [
      { id: "new-tab", label: "New request", hint: "Ctrl+T", action: newTab },
      ...requestItems,
    ];
  }, [openRequest, newTab]);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[14vh]"
      onClick={() => toggle(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[520px] overflow-hidden rounded-lg border border-border bg-panel shadow-elevated"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search size={14} className="text-text-secondary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search requests…"
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.action();
                toggle(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-primary hover:bg-panel-raised"
            >
              <span>{item.label}</span>
              <span className="text-xs text-text-muted">{item.hint}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-3 text-sm text-text-muted">No matches.</p>
          )}
        </div>
      </div>
    </div>
  );
}
