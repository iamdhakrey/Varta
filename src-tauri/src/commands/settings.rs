use tauri::State;

use crate::{models::AppSettings, state::AppState};

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> crate::error::AppResult<AppSettings> {
    crate::db::settings::get_settings(&state.data_dir)
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    settings: AppSettings,
) -> crate::error::AppResult<()> {
    crate::db::settings::update_settings(&state.data_dir, &settings)
}
