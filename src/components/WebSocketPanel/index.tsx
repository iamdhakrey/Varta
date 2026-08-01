import { useState, useRef, useEffect } from "react";
import {
  Send,
  Unplug,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { useVartaStore } from "../../store";
import { RequestTab, WsSavedMessage } from "../../types";

interface WebSocketPanelProps {
  tab: RequestTab;
  isMobile?: boolean;
}

export default function WebSocketPanel({
  tab,
  isMobile = false,
}: WebSocketPanelProps) {
  const [input, setInput] = useState("");
  const [subTab, setSubTab] = useState<"messages" | "saved">("messages");
  const [newMsgName, setNewMsgName] = useState("");
  const [newMsgData, setNewMsgData] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  const sendWsMessage = useVartaStore((s) => s.sendWsMessage);
  const loadSavedMessages = useVartaStore((s) => s.loadSavedMessages);
  const addSavedMessage = useVartaStore((s) => s.addSavedMessage);
  const deleteSavedMessage = useVartaStore((s) => s.deleteSavedMessage);

  // Auto-scroll the log when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab.wsMessages.length]);

  // Load saved messages when we first render or change request
  useEffect(() => {
    if (tab.request.id && !tab.request.id.startsWith("new-")) {
      loadSavedMessages(tab.request.id);
    }
  }, [tab.request.id, loadSavedMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || tab.wsStatus !== "connected") return;
    sendWsMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveMessage = async () => {
    if (!newMsgName.trim() || !newMsgData.trim()) return;
    await addSavedMessage(tab.request.id, newMsgName.trim(), newMsgData.trim());
    setNewMsgName("");
    setNewMsgData("");
    setShowSaveForm(false);
  };

  const handleSendSaved = (msg: WsSavedMessage) => {
    if (tab.wsStatus !== "connected") return;
    sendWsMessage(msg.data);
  };

  const isConnected = tab.wsStatus === "connected";
  const isConnecting = tab.wsStatus === "connecting";

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div
        className={`flex items-center gap-3 border-b border-border bg-panel text-sm ${isMobile ? "px-3 py-2" : "px-4 py-2"
          }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isConnected
              ? "bg-success animate-pulse"
              : isConnecting
                ? "bg-warning animate-pulse"
                : "bg-text-muted"
              }`}
          />
          <span
            className={`font-medium ${isConnected
              ? "text-success"
              : isConnecting
                ? "text-warning"
                : "text-text-muted"
              }`}
          >
            {isConnected
              ? "Connected"
              : isConnecting
                ? "Connecting…"
                : "Disconnected"}
          </span>
        </div>

        {tab.wsMessages.length > 0 && (
          <span className="text-text-muted text-xs">
            {tab.wsMessages.filter((m) => m.direction !== "closed").length}{" "}
            messages
          </span>
        )}
      </div>

      {/* Sub tabs */}
      <div
        className={`flex gap-1 border-b border-border ${isMobile ? "overflow-x-auto scrollbar-hide px-2" : "px-4"
          }`}
      >
        <button
          onClick={() => setSubTab("messages")}
          className={`tab-trigger shrink-0 ${subTab === "messages" ? "tab-trigger-active" : ""}`}
        >
          Messages
          {tab.wsMessages.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
              {tab.wsMessages.filter((m) => m.direction !== "closed").length}
            </span>
          )}
        </button>
        {/*<button
          onClick={() => setSubTab("saved")}
          className={`tab-trigger shrink-0 ${subTab === "saved" ? "tab-trigger-active" : ""}`}
        >
          <Bookmark size={12} className="inline mr-1" />
          Saved
          {tab.wsSavedMessages.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
              {tab.wsSavedMessages.length}
            </span>
          )}
        </button>*/}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {subTab === "messages" && (
          <>
            {/* Message log */}
            <div
              className={`flex-1 overflow-y-auto ${isMobile ? "px-3 py-2" : "px-4 py-3"}`}
            >
              {tab.wsMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-text-muted">
                  {isConnected
                    ? "Connected — send a message to begin."
                    : "Connect to a WebSocket server to see messages here."}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {tab.wsMessages.map((msg, i) => {
                    if (msg.direction === "closed") {
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1 text-xs text-text-muted italic"
                        >
                          <Unplug size={11} />
                          Connection closed
                          <span className="ml-auto font-mono text-[10px] opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      );
                    }

                    const isSent = msg.direction === "sent";
                    return (
                      <div
                        key={i}
                        className={`group flex gap-2 rounded-md border px-3 py-2 text-sm font-mono transition-colors ${isSent
                          ? "border-primary/20 bg-primary/5"
                          : "border-secondary/20 bg-secondary/5"
                          }`}
                      >
                        <div className="shrink-0 pt-0.5">
                          {isSent ? (
                            <ArrowUp size={13} className="text-primary" />
                          ) : (
                            <ArrowDown size={13} className="text-secondary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <pre className="whitespace-pre-wrap break-all text-text-primary text-xs">
                            {msg.data}
                          </pre>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="font-mono text-[10px] text-text-muted">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>

            {/* Message composer */}
            <div
              className={`border-t border-border bg-panel ${isMobile ? "p-2" : "p-3"}`}
            >
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected}
                  placeholder={
                    isConnected
                      ? "Type a message… (Enter to send, Shift+Enter for newline)"
                      : "Connect first to send messages"
                  }
                  className="input-shell flex-1 resize-none font-mono text-xs min-h-[60px] max-h-[120px] disabled:opacity-50"
                  rows={2}
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={handleSend}
                    disabled={!isConnected || !input.trim()}
                    className="rounded-md bg-brand-gradient px-3 py-1.5 text-xs font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    Send
                  </button>
                  {input.trim() && (
                    <button
                      onClick={() => {
                        setNewMsgData(input.trim());
                        setNewMsgName("");
                        setShowSaveForm(true);
                        setSubTab("saved");
                      }}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors flex items-center gap-1.5"
                    >
                      <Save size={12} />
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {subTab === "saved" && (
          <div
            className={`flex-1 overflow-y-auto ${isMobile ? "px-3 py-2" : "px-4 py-3"}`}
          >
            {/* Add new saved message form */}
            {showSaveForm && (
              <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    Save Message Template
                  </span>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="p-1 text-text-muted hover:text-text-primary rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  value={newMsgName}
                  onChange={(e) => setNewMsgName(e.target.value)}
                  placeholder="Template name (e.g. 'Subscribe to ticker')"
                  className="input-shell w-full text-xs"
                  autoFocus
                />
                <textarea
                  value={newMsgData}
                  onChange={(e) => setNewMsgData(e.target.value)}
                  placeholder="Message payload"
                  className="input-shell w-full resize-none font-mono text-xs min-h-[60px]"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="rounded-md border border-border px-3 py-1 text-xs text-text-secondary hover:bg-panel-raised"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMessage}
                    disabled={!newMsgName.trim() || !newMsgData.trim()}
                    className="rounded-md bg-brand-gradient px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {!showSaveForm && (
              <button
                onClick={() => {
                  setNewMsgName("");
                  setNewMsgData("");
                  setShowSaveForm(true);
                }}
                className="mb-3 flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs text-text-secondary hover:border-primary/50 hover:text-text-primary transition-colors w-full justify-center"
              >
                <Save size={12} />
                New saved message
              </button>
            )}

            {/* Saved messages list */}
            {tab.wsSavedMessages.length === 0 && !showSaveForm ? (
              <div className="flex h-32 items-center justify-center text-sm text-text-muted">
                No saved messages yet. Create one to quickly re-send common
                payloads.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tab.wsSavedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="group rounded-md border border-border bg-panel p-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-text-primary">
                        {msg.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSendSaved(msg)}
                          disabled={!isConnected}
                          className="rounded p-1 text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          title={
                            isConnected ? "Send this message" : "Connect first"
                          }
                        >
                          <Send size={13} />
                        </button>
                        <button
                          onClick={() =>
                            deleteSavedMessage(tab.request.id, msg.id)
                          }
                          className="rounded p-1 text-text-muted hover:text-error hover:bg-error/10"
                          title="Delete saved message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap break-all font-mono text-xs text-text-secondary bg-bg rounded p-2">
                      {msg.data}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
