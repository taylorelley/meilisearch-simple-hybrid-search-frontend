#!/bin/sh
# Generate runtime configuration from environment variables
# This script runs automatically before nginx starts via /docker-entrypoint.d/

set -e

echo "Generating runtime configuration from environment variables..."

# Helper function to escape strings for JSON
json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\n/\\n/g; s/\r/\\r/g; s/\t/\\t/g'
}

# Get env values with defaults and escape them
HOST=$(json_escape "${VITE_MEILISEARCH_HOST:-http://localhost:7700}")
API_KEY=$(json_escape "${VITE_MEILISEARCH_API_KEY:-}")
INDEX=$(json_escape "${VITE_MEILISEARCH_INDEX:-movies}")
RATIO=$(json_escape "${VITE_MEILISEARCH_SEMANTIC_RATIO:-0.5}")
EMBEDDER=$(json_escape "${VITE_MEILISEARCH_EMBEDDER:-default}")
TITLE=$(json_escape "${VITE_APP_TITLE:-Hybrid Search}")
LOGO=$(json_escape "${VITE_APP_LOGO:-}")

# Generate config.js with properly escaped values
cat > /usr/share/nginx/html/config.js <<EOF
window.ENV_CONFIG = {
  VITE_MEILISEARCH_HOST: "$HOST",
  VITE_MEILISEARCH_API_KEY: "$API_KEY",
  VITE_MEILISEARCH_INDEX: "$INDEX",
  VITE_MEILISEARCH_SEMANTIC_RATIO: "$RATIO",
  VITE_MEILISEARCH_EMBEDDER: "$EMBEDDER",
  VITE_APP_TITLE: "$TITLE",
  VITE_APP_LOGO: "$LOGO"
};
EOF

echo "✓ Runtime configuration generated successfully"
echo "  - Meilisearch host: ${VITE_MEILISEARCH_HOST:-http://localhost:7700}"
echo "  - Index: ${VITE_MEILISEARCH_INDEX:-movies}"
echo "  - App title: ${VITE_APP_TITLE:-Hybrid Search}"
