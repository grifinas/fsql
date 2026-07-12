#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh [patch|minor|major]
# Defaults to standard-version's automatic bump if no argument is given.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

cd "$ROOT"

BUMP="${1:-}"

echo "==> Running confirm (build + lint + test)..."
npm run confirm

echo "==> Running standard-version..."
if [[ -n "$BUMP" ]]; then
  npx standard-version --release-as "$BUMP"
else
  npx standard-version
fi

VERSION="$(node -p "require('./package.json').version")"
TAG="v$VERSION"

echo "==> Building dist for release $TAG..."
npm run build

echo "==> Pushing branch and tag..."
git push --follow-tags origin master

ASSET="fsql-$TAG.tar.gz"
echo "==> Packaging dist/ into $ASSET..."
tar -czf "$ASSET" dist/

echo "==> Creating GitHub release $TAG..."
gh release create "$TAG" "$ASSET" \
  --title "$TAG" \
  --notes-file CHANGELOG.md

rm "$ASSET"

echo "==> Released $TAG successfully."
