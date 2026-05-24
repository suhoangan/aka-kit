#!/usr/bin/env bash
# install-tanstack-intent: run @tanstack/intent to install Agent Skills shipped
# alongside TanStack packages (Query, Router, Table, Form, etc.).
# https://tanstack.com/blog/from-docs-to-agents
#
# Skips cleanly when:
#   - no package.json in CWD (e.g., global aka-kit install in non-project dir)
#   - no @tanstack/* dependency declared
#   - npx not available
# Idempotent: @tanstack/intent install re-wires skills on every run.

set -u

log()  { echo "[aka-kit:tanstack-intent] $*"; }
warn() { echo "[aka-kit:tanstack-intent] $*" >&2; }

PKG="package.json"

# 1. Project gate — only meaningful inside an npm project
if [ ! -f "$PKG" ]; then
    log "no package.json in $(pwd) — skipping"
    exit 0
fi

# 2. Dep gate — only run if a TanStack package is declared
if ! grep -q '"@tanstack/' "$PKG"; then
    log "no @tanstack/* dependency in package.json — skipping"
    exit 0
fi

# 3. Need npx
if ! command -v npx >/dev/null 2>&1; then
    warn "npx not found — install Node.js to enable TanStack Intent skills"
    exit 0
fi

# 4. Run intent installer — auto-wires CLAUDE.md / AGENTS.md / .cursorrules
log "discovering TanStack skills via @tanstack/intent install…"
if npx -y @tanstack/intent@latest install; then
    log "TanStack Agent Skills installed"
else
    warn "@tanstack/intent install failed — see output above"
fi

exit 0
