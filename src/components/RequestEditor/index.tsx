import { useEffect, useState } from "react";
import { RequestTab } from "../../types";
import { useVartaStore } from "../../store";
import TabStrip from "./TabStrip";
import RequestBar from "./RequestBar";
import KeyValueTable from "./KeyValueTable";
import CookiesTab from "./CookiesTab";
import AuthTab from "./AuthTab";
import BodyTab from "./BodyTab";
import EmptyState from "../EmptyState";

type SubTab = "params" | "headers" | "cookies" | "auth" | "body";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "params", label: "Params" },
  { id: "headers", label: "Headers" },
  { id: "cookies", label: "Cookies" },
  { id: "auth", label: "Authorization" },
  { id: "body", label: "Body" },
];

function RequestPanel({
  tab,
  isMobile,
}: {
  tab: RequestTab;
  isMobile: boolean;
}) {
  const [subTab, setSubTab] = useState<SubTab>("params");
  const updateActiveRequest = useVartaStore((s) => s.updateActiveRequest);
  const saveActiveRequest = useVartaStore((s) => s.saveActiveRequest);

    // Global Keydown Listener for Save
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault(); // Block browser "Save Page" dialog
          saveActiveRequest();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [saveActiveRequest]);

  return (
    <div className="flex h-full flex-col">
      <RequestBar tab={tab} isMobile={isMobile} />

      {/* Sub-tabs — scrollable on mobile */}
      <div
        className={`flex gap-1 border-b border-border ${
          isMobile
            ? "overflow-x-auto scrollbar-hide px-2"
            : "px-4"
        }`}
      >
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`tab-trigger shrink-0 ${subTab === t.id ? "tab-trigger-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {subTab === "params" && (
          <KeyValueTable
            rows={tab.request.params}
            onChange={(rows) => updateActiveRequest({ params: rows })}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
            isMobile={isMobile}
          />
        )}
        {subTab === "headers" && (
          <KeyValueTable
            rows={tab.request.headers}
            onChange={(rows) => updateActiveRequest({ headers: rows })}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
            suggestKeys
            isMobile={isMobile}
          />
        )}
        {subTab === "cookies" && (
          <CookiesTab
            rows={tab.request.cookies}
            onChange={(rows) => updateActiveRequest({ cookies: rows })}
            isMobile={isMobile}
          />
        )}
        {subTab === "auth" && (
          <AuthTab
            auth={tab.request.auth}
            onChange={(auth) => updateActiveRequest({ auth })}
            isMobile={isMobile}
          />
        )}
        {subTab === "body" && (
          <BodyTab
            body={{
              ...tab.request.body,
              mode: tab.request.body?.mode || "raw",
              // Safely map the files if they exist to include id and sizeBytes
              files: tab.request.body?.files?.map((file) => ({
                ...file,
                id: file.id || crypto.randomUUID(), // Fallback ID if missing
                sizeBytes: file.sizeBytes || 0, // Fallback size if missing
              })),
            }}
            onChange={(body) => updateActiveRequest({ body })}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

interface RequestEditorProps {
  isMobile?: boolean;
}

export default function RequestEditor({ isMobile = false }: RequestEditorProps) {
  const tabs = useVartaStore((s) => s.tabs);
  const activeTabId = useVartaStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex h-full flex-1 flex-col bg-bg">
      <TabStrip />
      {activeTab ? (
        <RequestPanel tab={activeTab} isMobile={isMobile} />
      ) : (
        <EmptyState isMobile={isMobile} />
      )}
    </div>
  );
}
