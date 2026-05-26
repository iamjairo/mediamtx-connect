#!/bin/sh
# Writes /runtime-config.js using the container env so the SPA can read it
# before bootstrapping. Lets one image be repointed at any MediaMTX without
# a rebuild.

set -e

out=/usr/share/nginx/html/runtime-config.js

cat > "$out" <<EOF
window.__MEDIAMTX_DASHBOARD_CONFIG__ = {
  baseUrl: "${MEDIAMTX_URL:-http://localhost:9997}",
  username: "${MEDIAMTX_API_USERNAME:-}",
  password: "${MEDIAMTX_API_PASSWORD:-}",
  allowDestructive: ${ALLOW_DESTRUCTIVE:-true},
  pollIntervalMs: ${POLL_INTERVAL_MS:-5000}
};
EOF

echo "[runtime-config] wrote $out (baseUrl=${MEDIAMTX_URL:-http://localhost:9997})"
