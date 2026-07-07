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

            let data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("resolve app data dir");
            std::fs::create_dir_all(&data_dir).expect("create app data dir");

            let data_dir =
                db::init_data_dir(&data_dir).expect("initialize data directory");

            app_handle.manage(AppState { data_dir });

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
