use tauri::State;

use crate::{
    models::{Collection, CollectionTree},
    state::AppState,
};

#[tauri::command]
pub async fn get_collection_trees(
    state: State<'_, AppState>,
    workspaceid: String,
) -> crate::error::AppResult<Vec<CollectionTree>> {
    crate::db::collections::get_collection_trees(&state.data_dir, &workspaceid)
}

#[tauri::command]
pub async fn create_collection(
    state: State<'_, AppState>,
    workspaceid: String,
    name: String,
) -> crate::error::AppResult<Collection> {
    println!(
        "Creating collection '{}' in workspace '{}'",
        name, workspaceid
    );
    crate::db::collections::create_collection(&state.data_dir, &workspaceid, &name)
}

#[tauri::command]
pub async fn rename_collection(
    state: State<'_, AppState>,
    collectionid: String,
    name: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::rename_collection(&state.data_dir, &collectionid, &name)
}

#[tauri::command]
pub async fn delete_collection(
    state: State<'_, AppState>,
    collectionid: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::delete_collection(&state.data_dir, &collectionid)
}
