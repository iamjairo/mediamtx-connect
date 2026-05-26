# Build the Vite SPA, then serve it from nginx.
# Runtime config (MediaMTX URL etc.) is injected at container start via a
# small env-to-window-globals shim — no rebuild needed to point at a different
# MediaMTX backend.

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Configurable at container start
ENV MEDIAMTX_URL=http://localhost:9997 \
    MEDIAMTX_API_USERNAME= \
    MEDIAMTX_API_PASSWORD= \
    ALLOW_DESTRUCTIVE=true \
    POLL_INTERVAL_MS=5000

COPY --from=builder /app/dist-app /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
