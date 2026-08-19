// src-tauri/src/state.rs
// Application state management

use std::sync::Mutex;

pub struct AppState {
    pub project_count: Mutex<u32>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            project_count: Mutex::new(0),
        }
    }
}
