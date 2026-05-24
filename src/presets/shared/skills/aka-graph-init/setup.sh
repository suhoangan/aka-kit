#!/usr/bin/env bash
# ak-graph-init: bootstrap code-review-graph (and optionally graphify) for the current project.
# Idempotent — safe to re-run.

set -euo pipefail

WITH_GRAPHIFY=0
ALIAS=""
SKIP_HUSKY=0
SKIP_MCP=0
QUIET=0

while [ $# -gt 0 ]; do
    case "$1" in
        --with-graphify) WITH_GRAPHIFY=1; shift ;;
        --alias)         ALIAS="$2"; shift 2 ;;
        --skip-husky)    SKIP_HUSKY=1; shift ;;
        --skip-mcp)      SKIP_MCP=1; shift ;;
        --quiet)         QUIET=1; shift ;;
        -h|--help)
            cat <<EOF
ak-graph-init — wire knowledge graph(s) into the current project

Usage: setup.sh [--with-graphify] [--alias NAME] [--skip-husky] [--skip-mcp] [--quiet]

Steps:
  1. Verify code-review-graph (+ graphify) CLIs available
  2. Build code-review-graph (AST-only, free)
  3. Register repo in multi-repo registry
  4. Add .code-review-graph/ (+ graphify-out/) to .gitignore
  5. (Husky projects) Add .husky/post-commit + post-checkout delegates
  6. (--with-graphify) Bootstrap code-only graphify graph
  7. (--with-graphify, unless --skip-mcp) Add graphify-\$ALIAS to ~/.claude.json
EOF
            exit 0 ;;
        *) echo "Unknown flag: $1" >&2; exit 2 ;;
    esac
done

log() { [ "$QUIET" = "1" ] || echo "[ak-graph-init] $*"; }
warn() { echo "[ak-graph-init] $*" >&2; }

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || {
    warn "not a git repo — skipping graph init"
    exit 0
}
cd "$REPO"

[ -z "$ALIAS" ] && ALIAS=$(basename "$REPO")
log "repo=$REPO alias=$ALIAS"

# 1. Tool checks — skip gracefully if missing (don't fail install)
if ! command -v code-review-graph >/dev/null 2>&1; then
    warn "missing 'code-review-graph' CLI — skipping. Install: pipx install code-review-graph"
    exit 0
fi
if [ "$WITH_GRAPHIFY" = "1" ] && ! command -v graphify >/dev/null 2>&1; then
    warn "missing 'graphify' CLI — install: pipx install graphify"
    exit 1
fi

# 2. Build code-review-graph
log "building code-review-graph…"
code-review-graph build >/dev/null 2>&1 || {
    warn "code-review-graph build failed — skipping"
    exit 0
}

# 3. Register
log "registering as alias '$ALIAS'…"
code-review-graph register "$REPO" --alias "$ALIAS" >/dev/null 2>&1 || true

# 4. .gitignore
GI="$REPO/.gitignore"
touch "$GI"
add_ignore() {
    grep -qxF "$1" "$GI" 2>/dev/null || echo "$1" >> "$GI"
}
add_ignore ".code-review-graph/"
[ "$WITH_GRAPHIFY" = "1" ] && add_ignore "graphify-out/"

# 5. Husky shim
if [ "$SKIP_HUSKY" = "0" ] && [ -d "$REPO/.husky/_" ]; then
    log "husky detected — adding hook delegates"
    for HOOK in post-commit post-checkout; do
        F="$REPO/.husky/$HOOK"
        if [ ! -f "$F" ] || ! grep -q "config/git/hooks/$HOOK" "$F" 2>/dev/null; then
            cat > "$F" <<HOOK
#!/usr/bin/env sh
[ -x "\$HOME/.config/git/hooks/$HOOK" ] && "\$HOME/.config/git/hooks/$HOOK" "\$@"
exit 0
HOOK
            chmod +x "$F"
        fi
    done
fi

# 6. Optional graphify bootstrap
if [ "$WITH_GRAPHIFY" = "1" ]; then
    log "bootstrapping graphify (code-only)…"
    graphify update . >/dev/null

    # 7. Wire MCP entry
    if [ "$SKIP_MCP" = "0" ]; then
        GRAPH="$REPO/graphify-out/graph.json"
        if [ -f "$GRAPH" ]; then
            PYBIN="$(command -v python3 || true)"
            [ -z "$PYBIN" ] && PYBIN="/opt/homebrew/bin/python3"
            "$PYBIN" - <<PY
import json, pathlib
p = pathlib.Path.home()/'.claude.json'
if p.exists():
    c = json.loads(p.read_text())
else:
    c = {}
key = "graphify-$ALIAS"
c.setdefault('mcpServers', {})[key] = {
    'command': '$PYBIN',
    'args': ['-m', 'graphify.serve', '$GRAPH'],
    'type': 'stdio',
}
p.write_text(json.dumps(c, indent=2))
print(f'[ak-graph-init] added MCP server: {key}')
PY
        fi
    fi
fi

log "done. Registry:"
[ "$QUIET" = "1" ] || code-review-graph repos 2>/dev/null || true
