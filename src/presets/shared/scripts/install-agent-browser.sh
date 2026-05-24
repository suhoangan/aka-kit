#!/usr/bin/env bash
# install-agent-browser: install Vercel Labs agent-browser CLI
# https://github.com/vercel-labs/agent-browser
# Idempotent. Exits 0 on any failure so aka-kit install never blocks.

set -u

log()  { echo "[aka-kit:agent-browser] $*"; }
warn() { echo "[aka-kit:agent-browser] $*" >&2; }

# 1. Already installed → done
if command -v agent-browser >/dev/null 2>&1; then
    log "agent-browser already installed ($(agent-browser --version 2>/dev/null | head -1))"
    exit 0
fi

OS="$(uname -s)"
installed=0

# 2. macOS → prefer Homebrew
if [ "$OS" = "Darwin" ] && command -v brew >/dev/null 2>&1; then
    log "installing via Homebrew…"
    if brew install agent-browser >/dev/null 2>&1; then
        installed=1
    else
        warn "brew install agent-browser failed — falling back to npm"
    fi
fi

# 3. npm global install (cross-platform fallback)
if [ "$installed" -eq 0 ] && command -v npm >/dev/null 2>&1; then
    log "installing via npm…"
    if npm install -g agent-browser >/dev/null 2>&1; then
        installed=1
    else
        warn "npm install -g agent-browser failed — falling back to cargo"
    fi
fi

# 4. cargo last-resort
if [ "$installed" -eq 0 ] && command -v cargo >/dev/null 2>&1; then
    log "installing via cargo…"
    if cargo install agent-browser >/dev/null 2>&1; then
        installed=1
    fi
fi

if [ "$installed" -eq 0 ]; then
    warn "could not install agent-browser — install one of: brew, npm, cargo"
    warn "see https://github.com/vercel-labs/agent-browser"
    exit 0
fi

# 5. Bootstrap Chrome for Testing (one-time browser download)
if command -v agent-browser >/dev/null 2>&1; then
    log "installed: $(agent-browser --version 2>/dev/null | head -1)"
    log "downloading Chrome for Testing (one-time)…"
    if [ "$OS" = "Linux" ]; then
        agent-browser install --with-deps >/dev/null 2>&1 || warn "agent-browser install --with-deps failed (Chrome download)"
    else
        agent-browser install >/dev/null 2>&1 || warn "agent-browser install failed (Chrome download)"
    fi
fi

exit 0
