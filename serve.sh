#!/usr/bin/env bash
# Run the site locally. Usage: ./serve.sh [port]
#   ./serve.sh          — Nuxt dev server with hot reload
#   ./serve.sh --built  — build once, then run what the container runs
set -euo pipefail
cd "$(dirname "$0")"

if [[ "${1:-}" == "--built" ]]; then
  PORT="${2:-8080}"
  npm run build
  echo "the spooky cluster → http://localhost:${PORT}"
  PORT="$PORT" exec npm start
fi

PORT="${1:-3000}"
echo "the spooky cluster → http://localhost:${PORT}"
exec npx nuxt dev --port "$PORT"
