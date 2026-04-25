use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use tauri::async_runtime::spawn_blocking;
use tauri::{command, AppHandle};
use tauri_plugin_dialog::{DialogExt, FilePath};

static DIALOG_ACTIVE: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Serialize, Deserialize)]
pub struct FileData {
    pub path: Option<String>,
    pub content: String,
}

#[command]
pub async fn open_file(app: AppHandle) -> Result<FileData, String> {
    if DIALOG_ACTIVE.swap(true, Ordering::SeqCst) {
        return Err("A file dialog is already open".into());
    }

    let result = (|| async {
        let (tx, rx) = mpsc::channel();
        app.dialog().file().pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });

        let file_path = spawn_blocking(move || rx.recv().unwrap())
            .await
            .map_err(|_| "Failed to receive file path")?;

        let file_path = file_path.ok_or("No file selected")?;

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
    })()
    .await;

    DIALOG_ACTIVE.store(false, Ordering::SeqCst);
    result
}

#[command]
pub async fn save_file(
    app: AppHandle,
    content: String,
    default_path: Option<String>,
) -> Result<String, String> {
    if DIALOG_ACTIVE.swap(true, Ordering::SeqCst) {
        return Err("A file dialog is already open".into());
    }

    let result = (|| async {
        let (tx, rx) = mpsc::channel();
        let mut dialog = app.dialog().file();
        if let Some(path) = default_path {
            dialog = dialog.set_file_name(&path);
        }
        dialog.save_file(move |file_path| {
            let _ = tx.send(file_path);
        });

        let file_path = spawn_blocking(move || rx.recv().unwrap())
            .await
            .map_err(|_| "Failed to receive file path")?;

        let file_path = file_path.ok_or("Save cancelled")?;

        match &file_path {
            FilePath::Path(path) => fs::write(path, content).map_err(|e| e.to_string())?,
            FilePath::Url(_) => return Err("URL file not supported".into()),
        };

        let path_str = match file_path {
            FilePath::Path(path) => path.display().to_string(),
            FilePath::Url(url) => url.to_string(),
        };

        Ok(path_str)
    })()
    .await;

    DIALOG_ACTIVE.store(false, Ordering::SeqCst);
    result
}