use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{command, AppHandle};
use tauri_plugin_dialog::{DialogExt, FilePath};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileData {
    pub path: Option<String>,
    pub content: String,
}

#[command]
pub fn open_file(app: AppHandle) -> Result<FileData, String> {
    let result: Arc<Mutex<Option<FilePath>>> = Arc::new(Mutex::new(None));
    let result_clone = result.clone();

    app.dialog().file().pick_file(Box::new(move |fp| {
        *result_clone.lock().unwrap() = fp;
    }));

    while result.lock().unwrap().is_none() {
        thread::sleep(std::time::Duration::from_millis(10));
    }

    let file_path = result.lock().unwrap().take().unwrap();

    let content = match &file_path {
        FilePath::Path(path) => fs::read_to_string(path).map_err(|e| e.to_string())?,
        FilePath::Url(_) => return Err("URL file not supported".into()),
    };

    let path_str = match file_path {
        FilePath::Path(path) => path.display().to_string(),
        FilePath::Url(url) => url.to_string(),
    };

    Ok(FileData {
        path: Some(path_str),
        content,
    })
}

#[command]
pub fn save_file(
    app: AppHandle,
    content: String,
    default_path: Option<String>,
) -> Result<String, String> {
    let result: Arc<Mutex<Option<FilePath>>> = Arc::new(Mutex::new(None));
    let result_clone = result.clone();

    let mut dialog = app.dialog().file();
    if let Some(path) = default_path {
        dialog = dialog.set_file_name(&path);
    }

    dialog.save_file(Box::new(move |fp| {
        *result_clone.lock().unwrap() = fp;
    }));

    while result.lock().unwrap().is_none() {
        thread::sleep(std::time::Duration::from_millis(10));
    }

    let file_path = result.lock().unwrap().take().unwrap();

    match &file_path {
        FilePath::Path(path) => fs::write(path, content).map_err(|e| e.to_string())?,
        FilePath::Url(_) => return Err("URL file not supported".into()),
    };

    let path_str = match file_path {
        FilePath::Path(path) => path.display().to_string(),
        FilePath::Url(url) => url.to_string(),
    };

    Ok(path_str)
}
