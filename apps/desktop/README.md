# MediaMTX Connect — Desktop

Native desktop wrapper around the `@iamjairo/mediamtx-dashboard` React
package, built with Tauri 2. Produces installable binaries for:

| OS      | Architectures | Bundle formats          |
|---------|---------------|--------------------------|
| Linux   | x64, arm64    | `.deb`, `.rpm`, AppImage |
| macOS   | x64, arm64    | `.app`, `.dmg`           |
| Windows | x64, arm64    | `.msi`, `.exe`           |

The Tauri shell is tiny — it loads the React UI in the system webview and
adds:

- Persistent connection settings (URL, optional API credentials) via
  `tauri-plugin-store`, so the user doesn't reconfigure on every launch.
- A first-run connection wizard that smoke-tests the URL before persisting.
- Native window decorations, menu bar, tray (planned).

## Develop

Requirements:

- Node 22+
- Rust 1.77+ (`rustup install stable`)
- Platform Tauri prerequisites: <https://v2.tauri.app/start/prerequisites/>

```sh
npm install
npm run tauri dev
```

The first run downloads the system webview dependencies + builds the Rust
shell — subsequent runs hot-reload the UI in milliseconds.

## Build

```sh
npm run build              # default targets for the current OS
npm run build:bundles      # every bundle target Tauri knows about
```

Bundled installers land in `src-tauri/target/release/bundle/`.

## CI

Multi-arch release matrix lives in
`.github/workflows/desktop-release.yml` (TODO — added in a follow-up).
For now `npm run build` from a CI runner on each target OS produces the
artifacts.

## Configuration

The desktop app stores settings in:

- Linux: `~/.config/com.iamjairo.mediamtx-connect/settings.json`
- macOS: `~/Library/Application Support/com.iamjairo.mediamtx-connect/settings.json`
- Windows: `%APPDATA%\com.iamjairo.mediamtx-connect\settings.json`

Delete that file (or use the in-app "Disconnect" action — planned) to
re-run the connection wizard.
