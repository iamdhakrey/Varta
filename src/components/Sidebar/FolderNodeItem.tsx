// import React, { useState } from "react";
// import { FolderNode as FolderNodeType } from "../../types";
// import { RequestItem } from "./RequestItem";
// import { useWorkspaceStore } from "../../store";
// import { ChevronRight, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";

// export const FolderNodeItem: React.FC<{ node: FolderNodeType; level?: number }> = ({
//   node,
//   level = 0
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isAdding, setIsAdding] = useState(false);
//   const [newFolderName, setNewFolderName] = useState("");

//   const { createFolder, deleteFolder } = useWorkspaceStore();

//   const handleCreateFolder = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await createFolder(node.folder.collection_id, node.folder.id, newFolderName);
//     setNewFolderName("");
//     setIsAdding(false);
//     setIsOpen(true);
//   };

//   return (
//     <div className="flex flex-col">
//       {/* Folder Row */}
//       <div
//         className="group flex items-center justify-between px-1.5 py-1.5 mx-1 rounded-md text-sm text-text-secondary hover:bg-panel hover:text-text-primary cursor-pointer transition-colors"
//         style={{ paddingLeft: `${(level * 12) + 6}px` }}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <div className="flex items-center gap-1.5 truncate">
//           <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
//           {isOpen ? (
//             <FolderOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
//           ) : (
//             <Folder className="w-3.5 h-3.5 text-text-muted shrink-0" />
//           )}
//           <span className="truncate">{node.folder.name}</span>
//         </div>

//         {/* Hover Actions */}
//         <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity pr-1">
//           <button
//             onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
//             className="p-1 hover:text-text-primary rounded"
//             title="Add Subfolder"
//           >
//             <Plus className="w-3.5 h-3.5" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); deleteFolder(node.folder.id); }}
//             className="p-1 hover:text-error rounded"
//             title="Delete Folder"
//           >
//             <Trash2 className="w-3.5 h-3.5" />
//           </button>
//         </div>
//       </div>

//       {/* Children & Requests rendering */}
//       {isOpen && (
//         <div className="flex flex-col relative before:content-[''] before:absolute before:left-[14px] before:top-0 before:bottom-0 before:w-[1px] before:bg-borderMuted ml-[10px]">

//           {/* Inline Add Folder Input */}
//           {isAdding && (
//             <form onSubmit={handleCreateFolder} className="pl-6 pr-2 py-1 flex gap-1">
//               <input
//                 autoFocus
//                 type="text"
//                 placeholder="Folder name..."
//                 value={newFolderName}
//                 onChange={(e) => setNewFolderName(e.target.value)}
//                 onBlur={() => setIsAdding(false)}
//                 className="input-shell w-full py-0.5 px-2 text-xs"
//               />
//             </form>
//           )}

//           {/* Render Subfolders */}
//           {node.children.map((child) => (
//             <FolderNodeItem key={child.folder.id} node={child} level={level + 1} />
//           ))}

//           {/* Render Requests inside this folder */}
//           {node.requests.map((req) => (
//             <div key={req.id} style={{ paddingLeft: `${(level + 1) * 12}px` }}>
//               <RequestItem request={req} />
//             </div>
//           ))}

//           {node.children.length === 0 && node.requests.length === 0 && !isAdding && (
//             <div className="pl-8 py-1.5 text-xs text-text-muted italic">Empty</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };
