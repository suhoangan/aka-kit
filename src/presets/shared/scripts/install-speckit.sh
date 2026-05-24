#!/usr/bin/env bash
# install-speckit: install GitHub spec-kit (specify CLI) and initialize it in the project.
# https://github.com/github/spec-kit
# Idempotent. Exits 0 on any failure so aka-kit install never fails.

set -u

log() { echo "[aka-kit:speckit] $*"; }
warn() { echo "[aka-kit:speckit] $*" >&2; }

# Skip if not a git repo (matches aka-graph-init behavior)
REPO=$(git rev-parse --show-toplevel 2>/dev/null) || {
    warn "not a git repo — skipping speckit init"
    exit 0
}
cd "$REPO"

# 1. Install specify CLI if missing
if ! command -v specify >/dev/null 2>&1; then
    if ! command -v uv >/dev/null 2>&1; then
        warn "uv not installed — required for specify CLI"
        warn "  install uv:  curl -LsSf https://astral.sh/uv/install.sh | sh"
        warn "  then re-run: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git"
        exit 0
    fi
    log "installing specify CLI via uv tool…"
    if ! uv tool install specify-cli --from git+https://github.com/github/spec-kit.git >/dev/null 2>&1; then
        warn "uv tool install specify-cli failed — skipping"
        exit 0
    fi
fi

# Ensure uv tool bin is on PATH for the rest of this script
export PATH="$HOME/.local/bin:$PATH"
if ! command -v specify >/dev/null 2>&1; then
    warn "specify installed but not on PATH — add ~/.local/bin to PATH"
    exit 0
fi

log "specify version: $(specify --version 2>/dev/null | head -1)"

# 2. Initialize spec-kit in current project (idempotent via --force)
if [ -d "$REPO/.specify" ]; then
    log ".specify/ already present — skipping init"
    exit 0
fi

log "initializing spec-kit (claude integration)…"
if specify init . --here --force --integration claude --ignore-agent-tools >/dev/null 2>&1; then
    log "spec-kit initialized. Slash commands available:"
    log "  /speckit.constitution  /speckit.specify  /speckit.plan"
    log "  /speckit.tasks         /speckit.implement"
    exit 0
fi

warn "specify init failed — run manually: specify init . --here --force --integration claude"
exit 0
