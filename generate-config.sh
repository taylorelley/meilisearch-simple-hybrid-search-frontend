#!/bin/sh
# Generate runtime configuration from environment variables
# This script runs automatically before nginx starts via /docker-entrypoint.d/

set -e

echo "Generating runtime configuration from environment variables..."

# Helper function to escape strings for JSON
# Properly handles backslashes, quotes, and control characters
json_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\x0d/\\r/g; s/\x0a/\\n/g; s/\x09/\\t/g'
}

# Get env values with defaults
HOST="${VITE_MEILISEARCH_HOST:-http://localhost:7700}"
API_KEY="${VITE_MEILISEARCH_API_KEY:-}"
INDEX="${VITE_MEILISEARCH_INDEX:-movies}"
RATIO="${VITE_MEILISEARCH_SEMANTIC_RATIO:-0.5}"
EMBEDDER="${VITE_MEILISEARCH_EMBEDDER:-default}"
TITLE="${VITE_APP_TITLE:-Hybrid Search}"
LOGO="${VITE_APP_LOGO:-}"

# Generate config.js with properly escaped JSON strings
cat > /usr/share/nginx/html/config.js << EOF
window.ENV_CONFIG = {
  "VITE_MEILISEARCH_HOST": "$(json_string "$HOST")",
  "VITE_MEILISEARCH_API_KEY": "$(json_string "$API_KEY")",
  "VITE_MEILISEARCH_INDEX": "$(json_string "$INDEX")",
  "VITE_MEILISEARCH_SEMANTIC_RATIO": "$(json_string "$RATIO")",
  "VITE_MEILISEARCH_EMBEDDER": "$(json_string "$EMBEDDER")",
  "VITE_APP_TITLE": "$(json_string "$TITLE")",
  "VITE_APP_LOGO": "$(json_string "$LOGO")"
};
EOF

echo "✓ Runtime configuration generated successfully"
echo "  - Meilisearch host: ${HOST}"
echo "  - Index: ${INDEX}"
echo "  - App title: ${TITLE}"
echo "  - API key: $([ -n "$API_KEY" ] && echo '[SET]' || echo '[NOT SET]')"
