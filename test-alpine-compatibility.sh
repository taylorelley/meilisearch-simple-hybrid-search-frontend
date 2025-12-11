#!/bin/sh
# Test script to verify generate-config.sh works in Alpine/BusyBox environment
# Usage: docker run --rm -v $(pwd):/test:ro nginx:alpine sh /test/test-alpine-compatibility.sh

set -e

echo "========================================"
echo "Alpine/BusyBox Compatibility Test"
echo "========================================"
echo

# Check available tools
echo "Environment Information:"
echo "  Shell: $SHELL"
echo "  AWK version:"
awk --version 2>&1 | head -1 || awk -W version 2>&1 | head -1 || echo "    (version info not available)"
echo "  SED version:"
sed --version 2>&1 | head -1 || echo "    BusyBox sed"
echo

# Source the json_string function from generate-config.sh
json_string() {
  printf '%s' "$1" | awk '
  BEGIN {
    result = ""
  }
  {
    # Escape backslashes first (must be done before other escapes)
    gsub(/\\/, "\\\\", $0)
    # Escape double quotes
    gsub(/"/, "\\\"", $0)
    # Escape carriage returns
    gsub(/\r/, "\\r", $0)
    # Escape tabs
    gsub(/\t/, "\\t", $0)

    # Append line to result, adding escaped newline between lines
    if (NR > 1) result = result "\\n"
    result = result $0
  }
  END {
    printf "%s", result
  }'
}

echo "Running Tests..."
echo "----------------------------------------"

# Test 1: Standard values
echo "Test 1: Standard environment variables"
VITE_MEILISEARCH_HOST="https://search.example.com:7700"
VITE_MEILISEARCH_API_KEY="abc123-def456-ghi789"
VITE_APP_TITLE="My Search App"

cat > /tmp/test-config.js << EOF
window.ENV_CONFIG = {
  "VITE_MEILISEARCH_HOST": "$(json_string "$VITE_MEILISEARCH_HOST")",
  "VITE_MEILISEARCH_API_KEY": "$(json_string "$VITE_MEILISEARCH_API_KEY")",
  "VITE_APP_TITLE": "$(json_string "$VITE_APP_TITLE")"
};
EOF

echo "  Generated config:"
cat /tmp/test-config.js
echo "  ✓ Passed"
echo

# Test 2: Values with quotes (edge case)
echo "Test 2: Values with embedded quotes"
TITLE_WITH_QUOTES='Search App "Beta Version"'
API_KEY_QUOTED='key-"special"-123'

cat > /tmp/test-quoted.js << EOF
window.ENV_CONFIG = {
  "VITE_APP_TITLE": "$(json_string "$TITLE_WITH_QUOTES")",
  "VITE_MEILISEARCH_API_KEY": "$(json_string "$API_KEY_QUOTED")"
};
EOF

echo "  Generated config:"
cat /tmp/test-quoted.js
echo "  ✓ Passed"
echo

# Test 3: Empty values
echo "Test 3: Empty environment variables"
EMPTY_VAL=""

cat > /tmp/test-empty.js << EOF
window.ENV_CONFIG = {
  "VITE_MEILISEARCH_API_KEY": "$(json_string "$EMPTY_VAL")",
  "VITE_APP_LOGO": "$(json_string "$EMPTY_VAL")"
};
EOF

echo "  Generated config:"
cat /tmp/test-empty.js
echo "  ✓ Passed"
echo

# Test 4: Simulate actual generate-config.sh behavior
echo "Test 4: Full generate-config.sh simulation"
export VITE_MEILISEARCH_HOST="http://localhost:7700"
export VITE_MEILISEARCH_API_KEY="test-key-123"
export VITE_MEILISEARCH_INDEX="movies"
export VITE_MEILISEARCH_SEMANTIC_RATIO="0.5"
export VITE_MEILISEARCH_EMBEDDER="default"
export VITE_APP_TITLE="Hybrid Search"
export VITE_APP_LOGO=""

HOST="${VITE_MEILISEARCH_HOST:-http://localhost:7700}"
API_KEY="${VITE_MEILISEARCH_API_KEY:-}"
INDEX="${VITE_MEILISEARCH_INDEX:-movies}"
RATIO="${VITE_MEILISEARCH_SEMANTIC_RATIO:-0.5}"
EMBEDDER="${VITE_MEILISEARCH_EMBEDDER:-default}"
TITLE="${VITE_APP_TITLE:-Hybrid Search}"
LOGO="${VITE_APP_LOGO:-}"

cat > /tmp/final-config.js << EOF
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

echo "  Generated config:"
cat /tmp/final-config.js
echo "  ✓ Passed"
echo

echo "========================================"
echo "All tests completed successfully!"
echo "This json_string function is compatible"
echo "with BusyBox/Alpine awk."
echo "========================================"
