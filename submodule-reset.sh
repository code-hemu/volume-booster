#!/usr/bin/env bash

set -e

SUBMODULE="workspace"
REPO="https://github.com/code-hemu/extensions-workspace.git"

echo "Resetting submodule: $SUBMODULE"

# Remove existing submodule
git submodule deinit -f "$SUBMODULE" || true
git rm -f "$SUBMODULE" || true
rm -rf ".git/modules/$SUBMODULE"

# Commit removal if needed
if ! git diff --quiet; then
  git commit -m "Remove $SUBMODULE submodule"
  git push
fi

echo "Adding submodule again..."

git submodule add -b main "$REPO" "$SUBMODULE"

git commit -m "Add $SUBMODULE submodule"
git push

echo "Submodule reset completed"