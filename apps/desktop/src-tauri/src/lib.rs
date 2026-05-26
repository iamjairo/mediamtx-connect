// Tauri 2 entry point for the MediaMTX Connect desktop app.
//
// The frontend (Vite + React + the dashboard package) is bundled into
// `../dist/` at build time and served by the webview. All MediaMTX HTTP
// traffic happens from the webview itself — we don't proxy or rewrite it.
// Persistent settings (MediaMTX URL, credentials) live in tauri-plugin-store
// so the user doesn't have to retype them on every launch.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
