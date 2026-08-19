// src-tauri/src/main.rs
// Tauri v2 main entry point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

fn main() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .manage(state::AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::get_system_info,
            commands::open_project,
            commands::save_project,
            commands::list_projects,
            commands::delete_project,
            commands::generate_code,
            commands::deploy_project,
            commands::run_command,
            commands::get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
