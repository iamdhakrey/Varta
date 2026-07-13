import React from "react";
import { ApiRequest, HttpMethod } from "../../types";
import { Trash2 } from "lucide-react";
import { useWorkspaceStore, useVartaStore } from "../../store"; // Import the store managing tabs

const methodColors: Record<HttpMethod, string> = {
  GET: "text-method-get",
  POST: "text-method-post",
  PUT: "text-method-put",
  PATCH: "text-method-patch",
  DELETE: "text-method-delete",
  OPTIONS: "text-text-muted",
  HEAD: "text-text-muted",
};

export const RequestItem: React.FC<{ request: ApiRequest }> = ({ request }) => {
  const { deleteRequest } = useWorkspaceStore();

  // Bring in the action to open a tab from your UI/Tabs store
  const openRequestTab = useVartaStore((s) => s.openRequest);

  return (
    <div
      // Trigger the open action when the row is clicked
      onClick={() => openRequestTab(request)}
      className="group flex items-center justify-between px-2 py-1.5 mx-1 my-0.5 rounded-md text-sm cursor-pointer hover:bg-panel hover:text-text-primary text-text-secondary transition-colors"
    >
      <div className="flex items-center gap-2.5 truncate">
        <span className={`text-[10px] font-bold w-10 text-right ${methodColors[request.method as HttpMethod] || "text-text-muted"}`}>
          {request.method}
        </span>
        <span className="truncate">{request.name}</span>
      </div>

      {/* Hover Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity pr-1">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the row click (open tab) from firing when deleting
            deleteRequest(request.id);
          }}
          className="p-1 hover:text-error hover:bg-error/10 rounded transition-colors"
          title="Delete Request"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
