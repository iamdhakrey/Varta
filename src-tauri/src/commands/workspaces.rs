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

#[tauri::command]
pub async fn get_active_state(state: State<'_, AppState>) -> AppResult<Option<Workspace>> {
    db::app_state::get_active_state(&state.data_dir).and_then(|active_state| {
        if let Some(workspace_id) = active_state.active_workspace_id {
            println!("Active workspace ID: {}", workspace_id);
            db::workspaces::list_workspaces(&state.data_dir)
                .map(|workspaces| workspaces.into_iter().find(|ws| ws.id == workspace_id))
        } else {
            Ok(None)
        }
    })
}
