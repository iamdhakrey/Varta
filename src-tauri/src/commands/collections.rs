use tauri::State;

use crate::{
    models::{Collection, CollectionTree, Folder},
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

#[tauri::command]
pub async fn clone_collection(
    state: State<'_, AppState>,
    collectionid: String,
) -> crate::error::AppResult<Collection> {
    crate::db::collections::clone_collection(&state.data_dir, &collectionid)
}

#[tauri::command]
pub async fn create_folder(
    state: State<'_, AppState>,
    collectionid: String,
    parentfolderid: Option<String>,
    name: String,
) -> crate::error::AppResult<Folder> {
    println!("Creating folder '{}' in workspace '{}'", name, collectionid);
    // parentfolderid: Option<&str>
    crate::db::collections::create_folder(
        &state.data_dir,
        &collectionid,
        parentfolderid.as_deref(),
        &name,
    )
}

#[tauri::command]
pub async fn delete_folder(
    state: State<'_, AppState>,
    folderid: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::delete_folder(&state.data_dir, &folderid)
}

#[tauri::command]
pub async fn rename_folder(
    state: State<'_, AppState>,
    collectionid: String,
    folderid: String,
    name: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::rename_folder(&state.data_dir, &collectionid, &folderid, &name)
}

#[tauri::command]
pub async fn get_request(
    state: State<'_, AppState>,
    requestid: String,
) -> crate::error::AppResult<crate::models::ApiRequest> {
    crate::db::collections::get_request(&state.data_dir, &requestid)
}

#[tauri::command]
pub async fn create_request(
    state: State<'_, AppState>,
    collectionid: String,
    folderid: Option<String>,
    name: String,
) -> crate::error::AppResult<crate::models::ApiRequest> {
    crate::db::collections::create_request(
        &state.data_dir,
        &collectionid,
        folderid.as_deref(),
        &name,
    )
}

#[tauri::command]
pub async fn delete_request(
    state: State<'_, AppState>,
    requestid: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::delete_request(&state.data_dir, &requestid)
}

#[tauri::command]
pub async fn rename_request(
    state: State<'_, AppState>,
    requestid: String,
    name: String,
) -> crate::error::AppResult<()> {
    crate::db::collections::rename_request(&state.data_dir, &requestid, &name)
}

#[tauri::command]
pub async fn duplicate_request(
    state: State<'_, AppState>,
    requestid: String,
) -> crate::error::AppResult<crate::models::ApiRequest> {
    crate::db::collections::duplicate_request(&state.data_dir, &requestid)
}

#[tauri::command]
pub async fn save_request(
    state: State<'_, AppState>,
    request: crate::models::ApiRequest,
) -> crate::error::AppResult<()> {
    crate::db::collections::save_request(&state.data_dir, &request)
}
