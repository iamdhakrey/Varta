import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../store";
// import { FolderNodeItem } from "./FolderNodeItem";
import { RequestItem } from "./RequestItem";
import { Plus, Trash2, Library, Edit2, Check, X } from "lucide-react";

export const CollectionsTree: React.FC = () => {
  const { activeWorkspaceId, collectionTrees, fetchCollections, createCollection, renameCollection,deleteCollection } = useWorkspaceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");



  useEffect(() => {
    if (activeWorkspaceId) {
      fetchCollections();
    }
  }, [activeWorkspaceId, fetchCollections]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCollection(newCollectionName);
    setNewCollectionName("");
    setIsAdding(false);
  };

  const handleRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await renameCollection(id, inputValue);
      setInputValue("");
      setEditingId(null);
    }
  };

  return (
    <div className="mt-2 flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-2 group">
        <div className="text-[11px] font-semibold tracking-wider text-text-muted">
          COLLECTIONS
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-text-primary hover:bg-panel transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline Create Form */}
      {isAdding && (
        <form onSubmit={handleCreateCollection} className="px-3 mb-2 flex gap-1">
          <input
            autoFocus
            type="text"
            placeholder="Collection name..."
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onBlur={() => setIsAdding(false)}
            className="input-shell w-full py-1 text-xs"
          />
        </form>
      )}

      {/* Tree Data */}
      <div className="flex flex-col gap-3 pb-4">
        {collectionTrees.length === 0 && !isAdding ? (
          <div className="px-3 text-xs text-text-muted italic">No collections found.</div>
        ) : (
          collectionTrees.map((tree) => (
            <div key={tree.collection.id}>

              {editingId === tree.collection.id ? (
                // Inline Edit Form
                <form
                  onSubmit={(e) => handleRename(e, tree.collection.id)}
                  className="flex items-center gap-1 w-full"
                >
                  <input
                    type="text"
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="input-shell w-full py-0.5 px-2 text-xs"
                  />
                  <button type="submit" className="p-1 hover:text-success cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 hover:text-error cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                // Selection view Mode
                  <>
                    <div className="group flex items-center justify-between px-2 py-1 mx-1 rounded-md text-sm font-semibold text-text-primary hover:bg-panel transition-colors">

                    <div className="flex items-center gap-1.5 truncate">
                      <Library className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{tree.collection.name}</span>
                    </div>

                  {/* Action buttons revealed on item hover */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(tree.collection.id);
                        setInputValue(tree.collection.name);
                      }}
                      className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-borderMuted cursor-pointer"
                      title="Rename Workspace"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCollection(tree.collection.id)}
                      className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 cursor-pointer"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                      </div>
                    </div>

                </>
              )}

              {/* Folders in Root */}
              {/*<div className="flex flex-col gap-0.5 mt-0.5">
                {tree.folders.map((folderNode) => (
                  <FolderNodeItem key={folderNode.folder.id} node={folderNode} />
                ))}*/}

                {/* Requests in Root */}
                {/*{tree.requests.map((req) => (
                  <div key={req.id} className="pl-4">
                    <RequestItem request={req} />
                  </div>
                ))}
              </div>*/}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
