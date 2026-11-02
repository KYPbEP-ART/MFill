use serde::{Deserialize, Serialize};
use std::fs;

// ✅ Структура под актуальный формат TS (TemplateDocument)
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")] 
pub struct TemplateDocument {
    pub id: String,
    pub name: String,
    pub version: String,
    pub blocks: serde_json::Value,      // Массив блоков (любая структура)
    pub fields: serde_json::Value,      // Реестр полей
    pub created_at: String,
    pub updated_at: String,
}

#[tauri::command]
fn save_template(data: TemplateDocument, path: String) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("JSON error: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Ошибка записи: {}", e))?;
    println!("✅ Шаблон сохранён: {}", path);
    Ok(())
}

#[tauri::command]
fn load_template(path: String) -> Result<TemplateDocument, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Ошибка чтения: {}", e))?;
    let doc: TemplateDocument = serde_json::from_str(&content)
        .map_err(|e| format!("Ошибка парсинга: {}", e))?;
    println!("✅ Шаблон загружен: {}", path);
    Ok(doc)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![save_template, load_template])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}