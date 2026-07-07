use crate::{db, error::AppResult, models::Workspace, state::AppState};
use tauri::State;

#[tauri::command]
pub async fn list_workspaces(state: State<'_, AppState>) -> AppResult<Vec<Workspace>> {
    db::workspaces::list_workspaces(&state.data_dir)
}

#[tauri::command]
pub async fn create_workspace(state: State<'_, AppState>, name: String) -> AppResult<Workspace> {
    db::workspaces::create_workspace(&state.data_dir, &name)
}

#[tauri::command]
pub async fn rename_workspace(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> AppResult<()> {
    db::workspaces::rename_workspace(&state.data_dir, &id, &name)
}

#[tauri::command]
pub async fn delete_workspace(state: State<'_, AppState>, id: String) -> AppResult<()> {
    db::workspaces::delete_workspace(&state.data_dir, &id)
}

#[tauri::command]
pub async fn set_active_workspace(state: State<'_, AppState>, id: String) -> AppResult<()> {
    db::app_state::set_active_workspace(&state.data_dir, &id)
}
