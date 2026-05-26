// Child-process lifecycle for the bundled MCP server.
//
// The MCP server is shipped in resources/mcp-server/ (Node entry + node_modules).
// We launch `node dist/index.js` with the user's env vars, capture stderr/stdout,
// and emit log lines to the frontend.

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Arc;
use std::thread;
use std::io::{BufRead, BufReader};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ServerState {
    Stopped,
    Starting,
    Running,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct McpSettings {
    #[serde(rename = "mediaMtxUrl")]
    pub media_mtx_url: String,
    #[serde(rename = "apiUsername", default)]
    pub api_username: Option<String>,
    #[serde(rename = "apiPassword", default)]
    pub api_password: Option<String>,
    #[serde(rename = "allowKick", default)]
    pub allow_kick: bool,
    #[serde(rename = "autoStart", default)]
    pub auto_start: bool,
    #[serde(rename = "transport", default = "default_transport")]
    pub transport: String,
    #[serde(rename = "httpPort", default)]
    pub http_port: Option<u16>,
}

fn default_transport() -> String {
    "stdio".to_string()
}

#[derive(Default)]
pub struct SupervisorState {
    child: Option<Child>,
    state: ServerState,
    logs: VecDeque<String>,
}

impl SupervisorState {
    pub fn push_log(&mut self, line: String) {
        self.logs.push_back(line);
        while self.logs.len() > 500 {
            self.logs.pop_front();
        }
    }
}

impl Default for ServerState {
    fn default() -> Self {
        ServerState::Stopped
    }
}

pub type Supervisor = Arc<Mutex<SupervisorState>>;

fn resolve_mcp_server_entry(app: &AppHandle) -> Option<PathBuf> {
    app.path()
        .resolve("resources/mcp-server/dist/index.js", tauri::path::BaseDirectory::Resource)
        .ok()
}

fn resolve_node() -> Option<PathBuf> {
    which::which("node").ok()
}

pub fn start(app: &AppHandle, supervisor: Supervisor, settings: McpSettings) -> Result<(), String> {
    let entry = resolve_mcp_server_entry(app)
        .ok_or_else(|| "Bundled MCP server entry not found".to_string())?;
    let node = resolve_node()
        .ok_or_else(|| "Node executable not found on PATH. Install Node 20+.".to_string())?;

    {
        let mut state = supervisor.lock();
        if state.child.is_some() {
            return Err("Server already running".into());
        }
        state.state = ServerState::Starting;
    }
    app.emit("mcp:state", ServerState::Starting).ok();

    let mut cmd = Command::new(node);
    cmd.arg(entry);
    cmd.env("MEDIAMTX_URL", &settings.media_mtx_url);
    if let Some(u) = &settings.api_username {
        cmd.env("MEDIAMTX_API_USERNAME", u);
    }
    if let Some(p) = &settings.api_password {
        cmd.env("MEDIAMTX_API_PASSWORD", p);
    }
    cmd.env(
        "MEDIAMTX_MCP_ALLOW_KICK",
        if settings.allow_kick { "true" } else { "false" },
    );
    cmd.env("MEDIAMTX_MCP_TRANSPORT", &settings.transport);
    if let Some(port) = settings.http_port {
        cmd.env("MEDIAMTX_MCP_HTTP_PORT", port.to_string());
    }
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn: {e}"))?;

    if let Some(stderr) = child.stderr.take() {
        let app_clone = app.clone();
        let supervisor_clone = supervisor.clone();
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines().flatten() {
                supervisor_clone.lock().push_log(line.clone());
                app_clone.emit("mcp:log", line).ok();
            }
        });
    }

    {
        let mut state = supervisor.lock();
        state.child = Some(child);
        state.state = ServerState::Running;
    }
    app.emit("mcp:state", ServerState::Running).ok();
    Ok(())
}

pub fn stop(app: &AppHandle, supervisor: Supervisor) -> Result<(), String> {
    let mut state = supervisor.lock();
    if let Some(mut child) = state.child.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    state.state = ServerState::Stopped;
    app.emit("mcp:state", ServerState::Stopped).ok();
    Ok(())
}
