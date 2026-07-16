import { ChevronDown } from "lucide-react";
import { MethodStyles, useVartaStore, useWorkspaceStore } from "../../store";
import { HttpMethod, RequestTab } from "../../types";
import { useRef, useState } from "react";

const methods: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

interface UrlInputProps {
  url: string;
  onChange: (url: string) => void;
  onEnter: () => void;
  disabled?: boolean;
}

const UrlAutocompleteInput: React.FC<UrlInputProps> = ({
  url,
  onChange,
  onEnter,
  disabled,
}) => {
  const { environments, activeEnvironmentId } = useWorkspaceStore();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 1. Get Active Variables
  const activeEnv = environments.find(
    (e) => e.environment.id === activeEnvironmentId,
  );
  const envVars = activeEnv?.variables.filter((v) => v.enabled) || [];

  // Filter variables based on what is typed after {{
  const filteredVars = envVars.filter((v) =>
    v.key.toLowerCase().includes(filterText.toLowerCase()),
  );

  // 2. Sync Scrolling between transparent input and colored overlay
  const handleScroll = (e: React.UIEvent<HTMLInputElement>) => {
    if (overlayRef.current) {
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // 3. Track cursor to detect if we are inside a {{...}} block
  const updateAutocompleteState = (
    currentCursor: number,
    currentUrl: string,
  ) => {
    const textBeforeCursor = currentUrl.slice(0, currentCursor);
    const lastOpen = textBeforeCursor.lastIndexOf("{{");
    const lastClose = textBeforeCursor.lastIndexOf("}}");

    // If the last open bracket is after the last close bracket, we are typing a variable
    if (lastOpen > lastClose) {
      setFilterText(textBeforeCursor.slice(lastOpen + 2));
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    const newCursor = e.target.selectionStart || 0;

    onChange(newUrl);
    setCursorPosition(newCursor);
    updateAutocompleteState(newCursor, newUrl);
  };

  const insertSuggestion = (envKey: string) => {
    const textBeforeCursor = url.slice(0, cursorPosition);
    const lastOpen = textBeforeCursor.lastIndexOf("{{");

    if (lastOpen !== -1) {
      const newUrl =
        url.slice(0, lastOpen) +
        "{{" +
        envKey +
        "}}" +
        url.slice(cursorPosition);
      onChange(newUrl);
      setShowSuggestions(false);

      // Restore focus and push cursor past the inserted variable
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPos = lastOpen + envKey.length + 4; // +4 accounts for {{ and }}
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredVars.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredVars.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredVars.length - 1 : prev - 1,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSuggestion(filteredVars[selectedIndex].key);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter") {
      onEnter();
    }
  };

  // 4. Render Highlighted Text
  const renderUrl = () => {
    // Split by complete {{...}} blocks to colorize them
    const parts = url.split(/(\{\{[^}]*\}\})/g);

    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const key = part.slice(2, -2);
        const exists = envVars.some((v) => v.key === key);
        // Green if valid, Red if invalid
        return (
          <span key={i} className={exists ? "text-success" : "text-error"}>
            {part}
          </span>
        );
      }
      return (
        <span key={i} className="text-text-primary">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="relative flex-1 h-full">
      <div className="relative w-full h-[34px] rounded-md border border-border bg-panel overflow-hidden">
        {/* UNDERLAY: Colored Text */}
        <div
          ref={overlayRef}
          className="absolute inset-0 px-3 py-1.5 font-mono text-sm whitespace-pre overflow-x-hidden pointer-events-none"
        >
          {renderUrl()}
          {/* Invisible spacer to match input padding/scrolling bounds exactly */}
          <span className="inline-block w-8"></span>
        </div>

        {/* OVERLAY: Actual Input */}
        <input
          ref={inputRef}
          value={url}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onClick={(e) => {
            const pos = e.currentTarget.selectionStart || 0;
            setCursorPosition(pos);
            updateAutocompleteState(pos, url);
          }}
          disabled={disabled}
          placeholder="https://api.example.com/users"
          // text-transparent makes text invisible, caret-text-primary keeps cursor visible
          className="absolute inset-0 w-full h-full px-3 py-1.5 font-mono text-sm bg-transparent outline-none text-transparent caret-text-primary"
          spellCheck="false"
        />
      </div>

      {/* Suggestion Dropdown */}
      {showSuggestions && activeEnv && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto z-50 rounded-md border border-border bg-panel-raised shadow-elevated p-1">
          {filteredVars.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted">
              No matching variables
            </div>
          ) : (
            filteredVars.map((v, index) => (
              <button
                key={v.id}
                onClick={() => insertSuggestion(v.key)}
                className={`flex w-full flex-col px-3 py-1.5 text-left rounded-sm cursor-pointer transition-colors ${
                  index === selectedIndex ? "bg-primary/20" : "hover:bg-panel"
                }`}
              >
                <span className="text-sm font-mono text-success">{v.key}</span>
                <span className="text-xs text-text-muted truncate">
                  {v.isSecret ? "••••••••" : v.value}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

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

      {/*<input
        value={tab.request.url}
        onChange={(e) => updateActiveRequest({ url: e.target.value })}
        placeholder="https://api.example.com/users"
        className="input-shell flex-1 font-mono"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendActiveRequest();
        }}
      />*/}

      <UrlAutocompleteInput
        url={tab.request.url}
        onChange={(url) => updateActiveRequest({ url })}
        onEnter={sendActiveRequest}
        disabled={tab.isSending}
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
