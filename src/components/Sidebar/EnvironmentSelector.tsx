import React, { useState, useEffect, useRef } from "react";
import { useWorkspaceStore } from "../../store";
import { Cloud, ChevronDown, Check } from "lucide-react";

export const EnvironmentSelector: React.FC = () => {
  const { environments, activeEnvironmentId, setActiveEnvironment } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeEnv = environments.find((e) => e.environment.id === activeEnvironmentId);

  return (
    <div className="relative w-full mb-2" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full rounded-md border border-border bg-panel px-2.5 py-1.5 text-sm font-medium text-text-primary hover:border-primary/60 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Cloud size={14} className="text-text-secondary shrink-0" />
          <span className="truncate">
            {activeEnv ? activeEnv.environment.name : "No Environment"}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-lg bg-panel-raised border border-border shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto py-1">

            {/* "No Environment" Option */}
            <button
              onClick={() => {
                setActiveEnvironment(null);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm hover:bg-panel hover:text-text-primary transition-colors cursor-pointer ${
                !activeEnvironmentId ? "text-text-primary bg-panel/40" : "text-text-secondary"
              }`}
            >
              <div className="w-4 flex justify-center shrink-0">
                {!activeEnvironmentId && <Check size={14} className="text-primary" />}
              </div>
              <span className="truncate">No Environment</span>
            </button>

            {/* Environment List */}
            {environments.map((env) => (
              <button
                key={env.environment.id}
                onClick={() => {
                  setActiveEnvironment(env.environment.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm hover:bg-panel hover:text-text-primary transition-colors cursor-pointer ${
                  activeEnvironmentId === env.environment.id ? "text-text-primary bg-panel/40" : "text-text-secondary"
                }`}
              >
                <div className="w-4 flex justify-center shrink-0">
                  {activeEnvironmentId === env.environment.id && <Check size={14} className="text-primary" />}
                </div>
                <span className="truncate">{env.environment.name}</span>
              </button>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};
