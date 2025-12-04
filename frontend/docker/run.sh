#!/bin/sh
set -e

# Robust launcher for Next.js in Cloud Run
# Preference order:
# 1) Next standalone server entry (various file names and locations)
# 2) Fallback to `next start` using the installed Next binary

echo "[launcher] PORT=${PORT:-8080}"

SEARCH_DIRS="/app/standalone /app/standalone/frontend /app"
# Broaden candidate list to handle different Next.js standalone layouts
CANDIDATES="server.js server.mjs server.cjs \
  server/index.js server/index.mjs server/index.cjs \
  server/server.js server/server.mjs server/server.cjs \
  index.js index.mjs index.cjs \
  app.mjs app.js"

# Try to find a standalone server entry file (known names)
for dir in $SEARCH_DIRS; do
  for file in $CANDIDATES; do
    if [ -f "$dir/$file" ]; then
      echo "[launcher] Found standalone entry: $dir/$file"
      exec node "$dir/$file"
    fi
  done
done

# Try a generic scan within shallow depth for server entry files
for dir in $SEARCH_DIRS; do
  if command -v find >/dev/null 2>&1; then
    FOUND=$(find "$dir" -maxdepth 3 \( -name 'server.*js' -o -name 'server.*mjs' -o -name 'index.js' -o -name 'index.mjs' \) | head -n 1)
    if [ -n "$FOUND" ] && [ -f "$FOUND" ]; then
      echo "[launcher] Found entry via scan: $FOUND"
      exec node "$FOUND"
    fi
  fi
done

echo "[launcher] No standalone entry found. Listing directories for diagnostics..."
ls -la /app/standalone 2>/dev/null || echo "[launcher] /app/standalone not present"
[ -d /app/standalone/frontend ] && ls -la /app/standalone/frontend || true

# Fallback: run `next start`
for dir in /app/standalone /app/standalone/frontend /app; do
  if [ -f "$dir/node_modules/next/dist/bin/next" ]; then
    echo "[launcher] Falling back to Next CLI from: $dir"
    cd "$dir"
    exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p "${PORT:-8080}"
  fi
done

echo "[launcher] ERROR: Could not locate a Next standalone entry or Next CLI binary. Exiting."
exit 1
