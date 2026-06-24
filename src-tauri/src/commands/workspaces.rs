use crate::{db, error::AppResult, models::Workspace, state::AppState};
use tauri::State;

#[tauri::command]
pub async fn list_workspaces(state: State<'_, AppState>) -> AppResult<Vec<Workspace>> {
    db::workspaces::list_workspaces(&state.pool).await
}

#[tauri::command]
pub async fn create_workspace(state: State<'_, AppState>, name: String) -> AppResult<Workspace> {
    db::workspaces::create_workspace(&state.pool, &name).await
}

#[tauri::command]
pub async fn rename_workspace(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> AppResult<()> {
    db::workspaces::rename_workspace(&state.pool, &id, &name).await
}

#[tauri::command]
pub async fn delete_workspace(state: State<'_, AppState>, id: String) -> AppResult<()> {
    db::workspaces::delete_workspace(&state.pool, &id).await
}

#[tauri::command]
pub async fn set_active_workspace(state: State<'_, AppState>, id: String) -> AppResult<()> {
    db::app_state::set_active_workspace(&state.pool, &id).await
}
