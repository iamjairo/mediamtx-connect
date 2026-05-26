// MediaMTX MCP tray — Tauri 2 menubar app.
//
// Architecture:
//   - No main window; the app lives in the tray icon.
//   - On tray-left-click: Settings window opens (or focuses).
//   - On tray-right-click: menu with Start / Stop / Restart / Logs / Quit.
//   - Settings persisted via tauri-plugin-store.
//   - MCP server runs as a child process supervised by `supervisor::*`.

mod supervisor;

use parking_lot::Mutex;
use std::sync::Arc;
use supervisor::{McpSettings, ServerState, Supervisor, SupervisorState};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewUrl, WebviewWindowBuilder,
};

const SETTINGS_FILE: &str = "settings.json";
const SETTINGS_KEY: &str = "settings";

// ---------- IPC commands ----------

#[tauri::command]
async fn load_settings(app: AppHandle) -> Result<Option<McpSettings>, String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, SETTINGS_FILE)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(store.get(SETTINGS_KEY).and_then(|v| serde_json::from_value(v).ok()))
}

#[tauri::command]
async fn save_settings(app: AppHandle, settings: McpSettings) -> Result<(), String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, SETTINGS_FILE)
        .build()
        .map_err(|e| e.to_string())?;
    let value = serde_json::to_value(&settings).map_err(|e| e.to_string())?;
    store.set(SETTINGS_KEY, value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn start_server(app: AppHandle, supervisor: tauri::State<'_, Supervisor>) -> Result<(), String> {
    let settings = load_settings(app.clone()).await?.ok_or("No settings configured")?;
    supervisor::start(&app, supervisor.inner().clone(), settings)
}

#[tauri::command]
async fn stop_server(app: AppHandle, supervisor: tauri::State<'_, Supervisor>) -> Result<(), String> {
    supervisor::stop(&app, supervisor.inner().clone())
}

#[tauri::command]
async fn restart_server(app: AppHandle, supervisor: tauri::State<'_, Supervisor>) -> Result<(), String> {
    let _ = supervisor::stop(&app, supervisor.inner().clone());
    let settings = load_settings(app.clone()).await?.ok_or("No settings configured")?;
    supervisor::start(&app, supervisor.inner().clone(), settings)
}

#[tauri::command]
fn get_server_state(supervisor: tauri::State<'_, Supervisor>) -> ServerState {
    supervisor.lock().state
}

#[tauri::command]
fn get_logs(supervisor: tauri::State<'_, Supervisor>, max_lines: usize) -> Vec<String> {
    let state = supervisor.lock();
    let len = state.logs.len();
    let start = len.saturating_sub(max_lines);
    state.logs.iter().skip(start).cloned().collect()
}

// ---------- Tray + windows ----------

fn open_settings(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.set_focus();
        return;
    }
    let _ = WebviewWindowBuilder::new(app, "settings", WebviewUrl::App("index.html#settings".into()))
        .title("MediaMTX MCP — Settings")
        .inner_size(480.0, 600.0)
        .min_inner_size(420.0, 500.0)
        .resizable(true)
        .build();
}

fn open_logs(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("logs") {
        let _ = win.show();
        let _ = win.set_focus();
        return;
    }
    let _ = WebviewWindowBuilder::new(app, "logs", WebviewUrl::App("index.html#logs".into()))
        .title("MediaMTX MCP — Logs")
        .inner_size(720.0, 480.0)
        .min_inner_size(560.0, 360.0)
        .resizable(true)
        .build();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let supervisor: Supervisor = Arc::new(Mutex::new(SupervisorState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(supervisor)
        .setup(|app| {
            let handle = app.handle().clone();

            let start_item = MenuItem::with_id(app, "start", "Start", true, None::<&str>)?;
            let stop_item = MenuItem::with_id(app, "stop", "Stop", true, None::<&str>)?;
            let restart_item = MenuItem::with_id(app, "restart", "Restart", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
            let logs_item = MenuItem::with_id(app, "logs", "Show logs…", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[
                    &start_item,
                    &stop_item,
                    &restart_item,
                    &settings_item,
                    &logs_item,
                    &quit_item,
                ],
            )?;

            let _tray = TrayIconBuilder::with_id("main")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "start" => {
                        let app = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let supervisor = app.state::<Supervisor>().inner().clone();
                            if let Ok(Some(settings)) = load_settings(app.clone()).await {
                                let _ = supervisor::start(&app, supervisor, settings);
                            }
                        });
                    }
                    "stop" => {
                        let supervisor = app.state::<Supervisor>().inner().clone();
                        let _ = supervisor::stop(app, supervisor);
                    }
                    "restart" => {
                        let app = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let supervisor = app.state::<Supervisor>().inner().clone();
                            let _ = supervisor::stop(&app, supervisor.clone());
                            if let Ok(Some(settings)) = load_settings(app.clone()).await {
                                let _ = supervisor::start(&app, supervisor, settings);
                            }
                        });
                    }
                    "settings" => open_settings(app),
                    "logs" => open_logs(app),
                    "quit" => {
                        let supervisor = app.state::<Supervisor>().inner().clone();
                        let _ = supervisor::stop(app, supervisor);
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        open_settings(app);
                    }
                })
                .build(app)?;

            // Auto-start the server if configured.
            tauri::async_runtime::spawn(async move {
                if let Ok(Some(settings)) = load_settings(handle.clone()).await {
                    if settings.auto_start {
                        let supervisor = handle.state::<Supervisor>().inner().clone();
                        let _ = supervisor::start(&handle, supervisor, settings);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            start_server,
            stop_server,
            restart_server,
            get_server_state,
            get_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
