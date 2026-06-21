import { Plus, Trash2 } from "lucide-react";
import { KeyValueRow } from "../../types";

const COMMON_HEADERS = [
  "Authorization",
  "Content-Type",
  "Accept",
  "User-Agent",
  "Cache-Control",
];

interface Props {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  suggestKeys?: boolean;
}

export default function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  suggestKeys = false,
}: Props) {
  function update(id: string, patch: Partial<KeyValueRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([
      ...rows,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-[24px_1fr_1fr_28px] gap-2 border-b border-border pb-2 text-[11px] font-medium tracking-wide text-text-muted">
        <span />
        <span>{keyPlaceholder.toUpperCase()}</span>
        <span>{valuePlaceholder.toUpperCase()}</span>
        <span />
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[24px_1fr_1fr_28px] items-center gap-2 border-b border-borderMuted py-1.5"
        >
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => update(row.id, { enabled: e.target.checked })}
            className="h-3.5 w-3.5 accent-primary"
          />
          <input
            value={row.key}
            onChange={(e) => update(row.id, { key: e.target.value })}
            list={suggestKeys ? "common-headers" : undefined}
            placeholder={keyPlaceholder}
            className="bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <input
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className="bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={() => removeRow(row.id)}
            aria-label="Remove row"
            className="text-text-muted hover:text-error"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {suggestKeys && (
        <datalist id="common-headers">
          {COMMON_HEADERS.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      )}

      <button
        onClick={addRow}
        className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <Plus size={13} />
        Add row
      </button>
    </div>
  );
}
