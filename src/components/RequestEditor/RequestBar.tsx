import { ChevronDown } from "lucide-react";
import { MethodStyles, useVartaStore } from "../../store";
import { HttpMethod, RequestTab } from "../../types";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];


export default function RequestBar({ tab }: { tab: RequestTab }) {
  const updateActiveRequest = useVartaStore((s) => s.updateActiveRequest);
  const sendActiveRequest = useVartaStore((s) => s.sendActiveRequest);

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="relative">
        <select
          value={tab.request.method}
          onChange={(e) =>
            updateActiveRequest({ method: e.target.value as HttpMethod })
          }
          className={`input-shell appearance-none pr-7 font-semibold ${MethodStyles[tab.request.method as HttpMethod]}`}
        >
          {methods.map((m) => (
            <option key={m} value={m} className="bg-panel text-text-primary">
              {m}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>

      <input
        value={tab.request.url}
        onChange={(e) => updateActiveRequest({ url: e.target.value })}
        placeholder="https://api.example.com/users"
        className="input-shell flex-1 font-mono"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendActiveRequest();
        }}
      />

      <button
        onClick={sendActiveRequest}
        disabled={tab.isSending}
        className="rounded-md bg-brand-gradient px-5 py-1.5 text-sm font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {tab.isSending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
