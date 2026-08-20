// src-tauri/src/main.rs
// Tauri v2 main entry point for WebBuilder Desktop

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

fn main() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state::AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::get_system_info,
            commands::get_app_version,
            commands::open_project,
            commands::save_project,
            commands::list_projects,
            commands::delete_project,
            commands::generate_code,
            commands::deploy_project,
            commands::run_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
