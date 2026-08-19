// src-tauri/src/commands.rs
// Tauri command handlers

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn open_project(path: String) -> Result<String, String> {
    if std::path::Path::new(&path).exists() {
        Ok(format!("Opened project at: {}", path))
    } else {
        Err(format!("Project not found at: {}", path))
    }
}

#[tauri::command]
pub fn save_project(path: String, _content: String) -> Result<String, String> {
    Ok(format!("Saved project to: {}", path))
}

#[tauri::command]
pub fn list_projects() -> Result<Vec<String>, String> {
    Ok(vec![])
}

#[tauri::command]
pub fn delete_project(path: String) -> Result<String, String> {
    Ok(format!("Deleted project at: {}", path))
}

#[tauri::command]
pub fn generate_code(project_id: String) -> Result<String, String> {
    Ok(format!("Generated code for project: {}", project_id))
}

#[tauri::command]
pub fn deploy_project(project_id: String, target: String) -> Result<String, String> {
    Ok(format!("Deploying project {} to {}", project_id, target))
}

#[tauri::command]
pub fn run_command(cmd: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&cmd)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if output.status.success() {
        Ok(stdout)
    } else {
        Err(stderr)
    }
}
