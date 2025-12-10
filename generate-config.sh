#!/bin/sh
# Generate runtime configuration from environment variables
# This script runs automatically before nginx starts via /docker-entrypoint.d/

set -e

echo "Generating runtime configuration from environment variables..."

cat > /usr/share/nginx/html/config.js <<EOF
window.ENV_CONFIG = {
  VITE_MEILISEARCH_HOST: "${VITE_MEILISEARCH_HOST:-http://localhost:7700}",
  VITE_MEILISEARCH_API_KEY: "${VITE_MEILISEARCH_API_KEY:-}",
  VITE_MEILISEARCH_INDEX: "${VITE_MEILISEARCH_INDEX:-movies}",
  VITE_MEILISEARCH_SEMANTIC_RATIO: "${VITE_MEILISEARCH_SEMANTIC_RATIO:-0.5}",
  VITE_MEILISEARCH_EMBEDDER: "${VITE_MEILISEARCH_EMBEDDER:-default}",
  VITE_APP_TITLE: "${VITE_APP_TITLE:-Hybrid Search}",
  VITE_APP_LOGO: "${VITE_APP_LOGO:-}"
};
EOF

echo "✓ Runtime configuration generated successfully"
echo "  - Meilisearch host: ${VITE_MEILISEARCH_HOST:-http://localhost:7700}"
echo "  - Index: ${VITE_MEILISEARCH_INDEX:-movies}"
echo "  - App title: ${VITE_APP_TITLE:-Hybrid Search}"
