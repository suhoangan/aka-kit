#!/bin/bash
# Install dependencies for HubSpot generator skills
# Run: bash .claude/skills/install.sh

SKILLS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if node_modules exists
if [ ! -d "$SKILLS_DIR/node_modules" ]; then
  echo "Installing skill dependencies..."
  cd "$SKILLS_DIR" && npm install --no-audit --no-fund
  echo "Done."
else
  echo "Dependencies already installed."
fi

# Copy .env from project root if not present near package.json
PROJECT_ROOT="$(cd "$SKILLS_DIR/../.." && pwd)"
if [ ! -f "$SKILLS_DIR/.env" ] && [ -f "$PROJECT_ROOT/.env" ]; then
  echo "Copying .env from project root..."
  cp "$PROJECT_ROOT/.env" "$SKILLS_DIR/.env"
  echo "Done."
fi
