import React from "react";
import { ApiRequest, HttpMethod } from "../../types";

const methodColors: Record<HttpMethod, string> = {
  GET: "text-method-get",
  POST: "text-method-post",
  PUT: "text-method-put",
  PATCH: "text-method-patch",
  DELETE: "text-method-delete",
  OPTIONS: "text-text-muted",
  HEAD: "text-text-muted",
  QUERY: "text-text-muted",
};

export const RequestItem: React.FC<{ request: ApiRequest }> = ({ request }) => {
  return (
    <div className="group flex items-center gap-2.5 px-2 py-1.5 mx-1 my-0.5 rounded-md text-sm cursor-pointer hover:bg-panel hover:text-text-primary text-text-secondary transition-colors">
      <span className={`text-[10px] font-bold w-10 text-right ${methodColors[request.method as HttpMethod]}`}>
        {request.method}
      </span>
      <span className="truncate flex-1">{request.name}</span>
    </div>
  );
};
