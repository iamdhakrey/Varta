import { Plus, Trash2 } from "lucide-react";
import { CookieRow } from "../../types";

interface Props {
  rows: CookieRow[];
  onChange: (rows: CookieRow[]) => void;
}

export default function CookiesTab({ rows, onChange }: Props) {
  function update(id: string, patch: Partial<CookieRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRow() {
    onChange([
      ...rows,
      { id: crypto.randomUUID(), name: "", value: "", domain: "" },
    ]);
  }
  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 border-b border-border pb-2 text-[11px] font-medium tracking-wide text-text-muted">
        <span>NAME</span>
        <span>VALUE</span>
        <span>DOMAIN</span>
        <span />
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_1fr_1fr_28px] items-center gap-2 border-b border-borderMuted py-1.5"
        >
          <input
            value={row.name}
            onChange={(e) => update(row.id, { name: e.target.value })}
            className="bg-transparent font-mono text-sm text-text-primary outline-none"
          />
          <input
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            className="bg-transparent font-mono text-sm text-text-primary outline-none"
          />
          <input
            value={row.domain}
            onChange={(e) => update(row.id, { domain: e.target.value })}
            className="bg-transparent font-mono text-sm text-text-primary outline-none"
          />
          <button
            onClick={() => removeRow(row.id)}
            aria-label="Remove cookie"
            className="text-text-muted hover:text-error"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {rows.length === 0 && (
        <p className="py-4 text-sm text-text-muted">
          No cookies for this request yet.
        </p>
      )}

      <button
        onClick={addRow}
        className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <Plus size={13} />
        Add cookie
      </button>
    </div>
  );
}
