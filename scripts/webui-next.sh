#!/usr/bin/env bash
# webui-next.sh — Next.js Web UI launcher (localhost only)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="${SCRIPT_DIR}/ui"
HOST="127.0.0.1"
PORT="3000"
NO_INSTALL=false

usage() {
    echo "Usage: $0 [--port <port>] [--no-install] [--help]"
    echo ""
    echo "  --port      override UI port (default: 3000)"
    echo "  --no-install skip npm install when node_modules is missing"
    echo "  --help      show this help"
    exit 1
}

while [ $# -gt 0 ]; do
    case "$1" in
        --port)
            PORT="$2"
            shift 2
            ;;
        --no-install)
            NO_INSTALL=true
            shift
            ;;
        --help|-h)
            usage
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            ;;
    esac
done

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || ((PORT < 1 || PORT > 65535)); then
    echo "[webui-next] invalid port: $PORT" >&2
    exit 1
fi

if [[ ! -d "$UI_DIR" ]]; then
    echo "[webui-next] ui directory not found: $UI_DIR" >&2
    exit 1
fi

if [[ ! -f "$UI_DIR/package.json" ]]; then
    echo "[webui-next] package.json not found: $UI_DIR/package.json" >&2
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "[webui-next] npm command not found" >&2
    exit 1
fi

cd "$UI_DIR"

if [[ "$NO_INSTALL" != true && ! -d node_modules ]]; then
    if [[ -f package-lock.json ]]; then
        echo "[webui-next] Installing dependencies with npm ci..."
        npm ci
    else
        echo "[webui-next] node_modules not found; falling back npm install..."
        npm install
    fi
elif [[ "$NO_INSTALL" == true && ! -d node_modules ]]; then
    echo "[webui-next] node_modules is missing and --no-install was specified." >&2
    exit 1
fi

echo "[webui-next] Starting Next.js on http://${HOST}:${PORT}"
exec npm run dev -- --hostname "$HOST" --port "$PORT"
