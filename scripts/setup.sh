#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

cd "$ROOT"

BIN="$(node -p "require('./package.json').bin.fsql")"

chmod +x "$BIN"

LINK_DIR="$HOME/.local/bin"
LINK_TARGET="$LINK_DIR/fsql"

mkdir -p "$LINK_DIR"

if [[ -L "$LINK_TARGET" || -f "$LINK_TARGET" ]]; then
  rm "$LINK_TARGET"
fi

ln -s "$(realpath "$BIN")" "$LINK_TARGET"

echo "fsql installed -> $LINK_TARGET"

if [[ ":$PATH:" != *":$LINK_DIR:"* ]]; then
  echo "NOTE: Add $LINK_DIR to your PATH if not already present:"
  echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"
fi
