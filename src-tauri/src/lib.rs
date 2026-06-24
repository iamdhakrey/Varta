use tauri::Manager;

use crate::commands::workspaces::{
    create_workspace, delete_workspace, list_workspaces, rename_workspace, set_active_workspace,
};
use crate::http::send_request;
use crate::state::AppState;

mod commands;
pub mod db;
mod error;
mod http;
mod models;
mod state;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                let data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("resolve app data dir");
                std::fs::create_dir_all(&data_dir).expect("create app data dir");
                let db_path = data_dir.join("varta.db");

                let pool = db::init_pool(&db_path).await.expect("initialize database");

                app_handle.manage(AppState { pool });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            send_request,
            list_workspaces,
            create_workspace,
            rename_workspace,
            delete_workspace,
            set_active_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
