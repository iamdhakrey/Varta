use tauri::State;

use crate::{
    models::{Collection, CollectionTree},
    state::AppState,
};

#[tauri::command]
pub async fn get_collections_trees(
    state: State<'_, AppState>,
    workspace_id: String,
) -> crate::error::AppResult<Vec<CollectionTree>> {
    crate::db::collections::get_collection_trees(&state.data_dir, &workspace_id)
}

#[tauri::command]
pub async fn create_collection(
    state: State<'_, AppState>,
    workspace_id: String,
    name: String,
) -> crate::error::AppResult<Collection> {
    crate::db::collections::create_collection(&state.data_dir, &workspace_id, &name)
}

#[tauri::command]
pub async fn rename_collection(
    state: State<'_, AppState>,
    collection_id: String,
    name: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::rename_collection(&state.data_dir, &collection_id, &name)
}

pub async fn delete_collection(
    state: State<'_, AppState>,
    collection_id: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::delete_collection(&state.data_dir, &collection_id)
}
