#!/bin/bash
# Deploy to gh-pages using personal-stubs (no personal data in public build).
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Backup personal if it exists
PERSONAL_BAK=""
if [ -d personal ]; then
  PERSONAL_BAK="$ROOT/personal.bak.$$"
  mv personal "$PERSONAL_BAK"
fi

# Use stubs for build
cp -r personal-stubs personal

cleanup() {
  rm -rf personal
  if [ -n "$PERSONAL_BAK" ] && [ -d "$PERSONAL_BAK" ]; then
    mv "$PERSONAL_BAK" personal
  fi
}
trap cleanup EXIT

npm run build
node node_modules/gh-pages/bin/gh-pages.js -d dist -b gh-pages -r https://github.com/radogit/cocoarui.git

echo "deployed to: https://radogit.github.io/cocoarui/"
echo "check status on: https://github.com/radogit/cocoarui/deployments"
