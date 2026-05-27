#!/usr/bin/env bash
# aka-graph-init: bootstrap code-review-graph (+ optional graphify) for the current project.
# Idempotent — safe to re-run. Windows-safe (Git Bash, no WindowsApps python stub).

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
aka-graph-init — wire knowledge graph(s) into the current project

Usage: setup.sh [--with-graphify] [--alias NAME] [--skip-husky] [--skip-mcp] [--quiet]

Windows: use setup.mjs or setup.ps1 (preferred — no Git Bash):
  node setup.mjs --with-graphify
  .\\setup.ps1 -WithGraphify

Steps:
  1. Verify code-review-graph (+ graphify) CLIs
  2. Build code-review-graph (AST-only, free)
  3. Register repo in multi-repo registry
  4. Add .code-review-graph/ (+ graphify-out/) to .gitignore
  5. (Husky) post-commit + post-checkout delegates
  6. (--with-graphify) graphify update + cursor rule
  7. (--with-graphify) MCP → .cursor/.mcp.json or AKAKIT_TARGET_DIR
EOF
            exit 0 ;;
        *) echo "Unknown flag: $1" >&2; exit 2 ;;
    esac
done

log() { [ "$QUIET" = "1" ] || echo "[aka-graph-init] $*"; }
warn() { echo "[aka-graph-init] $*" >&2; }

is_windows_apps_python() {
    [[ "$1" == *WindowsApps* ]]
}

# Resolve real Python (uv tool env → uv python find → Programs/Python → py/python)
resolve_python() {
    local cand root
    if command -v uv >/dev/null 2>&1; then
        root="$(uv tool dir graphify 2>/dev/null || true)"
        if [ -n "$root" ]; then
            cand="$root/Scripts/python.exe"
            [ -x "$cand" ] && { echo "$cand"; return 0; }
            cand="$root/bin/python3"
            [ -x "$cand" ] && { echo "$cand"; return 0; }
        fi
        cand="$(uv python find 2>/dev/null || true)"
        if [ -n "$cand" ] && [ -x "$cand" ] && ! is_windows_apps_python "$cand"; then
            if "$cand" -c "import sys" 2>/dev/null; then echo "$cand"; return 0; fi
        fi
    fi
    for py in py python python3; do
        cand="$(command -v "$py" 2>/dev/null || true)"
        [ -z "$cand" ] && continue
        is_windows_apps_python "$cand" && continue
        if "$cand" -c "import sys" 2>/dev/null; then echo "$cand"; return 0; fi
    done
    return 1
}

try_install_graphify() {
    command -v graphify >/dev/null 2>&1 && return 0
    if command -v uv >/dev/null 2>&1; then
        log "installing graphify via uv tool (graphify[mcp])…"
        uv tool install "graphify[mcp]" 2>/dev/null || true
    fi
    command -v graphify >/dev/null 2>&1
}

resolve_mcp_file() {
    if [ -n "${AKAKIT_TARGET_DIR:-}" ] && [ -d "$AKAKIT_TARGET_DIR" ]; then
        echo "$AKAKIT_TARGET_DIR/.mcp.json"
        return 0
    fi
    if [ -d "${HOME}/.cursor" ] || [ -f "${HOME}/.cursor/.mcp.json" ]; then
        echo "${HOME}/.cursor/.mcp.json"
        return 0
    fi
    if [ -d "${HOME}/.claude" ] || [ -f "${HOME}/.claude.json" ]; then
        echo "${HOME}/.claude.json"
        return 0
    fi
    echo "${HOME}/.cursor/.mcp.json"
}

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || {
    warn "not a git repo — skipping graph init"
    exit 0
}
cd "$REPO"

[ -z "$ALIAS" ] && ALIAS=$(basename "$REPO")
log "repo=$REPO alias=$ALIAS"

if ! command -v code-review-graph >/dev/null 2>&1; then
    warn "missing code-review-graph — install: uv tool install code-review-graph"
    exit 0
fi

if [ "$WITH_GRAPHIFY" = "1" ]; then
    if ! try_install_graphify; then
        warn "missing graphify CLI — install: uv tool install \"graphify[mcp]\""
        exit 0
    fi
fi

log "building code-review-graph…"
code-review-graph build >/dev/null 2>&1 || {
    warn "code-review-graph build failed — skipping"
    exit 0
}

log "registering as alias '$ALIAS'…"
code-review-graph register "$REPO" --alias "$ALIAS" >/dev/null 2>&1 || true

GI="$REPO/.gitignore"
touch "$GI"
add_ignore() {
    grep -qxF "$1" "$GI" 2>/dev/null || echo "$1" >> "$GI"
}
add_ignore ".code-review-graph/"
[ "$WITH_GRAPHIFY" = "1" ] && add_ignore "graphify-out/"

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
            chmod +x "$F" 2>/dev/null || true
        fi
    done
fi

if [ "$WITH_GRAPHIFY" = "1" ]; then
    log "bootstrapping graphify…"
    graphify update . >/dev/null 2>&1 || graphify . >/dev/null 2>&1 || warn "graphify build failed"

    if command -v graphify >/dev/null 2>&1; then
        graphify cursor install >/dev/null 2>&1 || true
    fi

    if [ "$SKIP_MCP" = "0" ]; then
        GRAPH="$REPO/graphify-out/graph.json"
        if [ -f "$GRAPH" ]; then
            PYBIN="$(resolve_python || true)"
            if [ -z "$PYBIN" ]; then
                warn "no working Python — skip MCP (Windows: avoid Microsoft Store python stub)"
            elif ! "$PYBIN" -c "import mcp" 2>/dev/null; then
                warn "graphify missing [mcp] — run: uv tool install \"graphify[mcp]\" --force"
            else
                MCP_FILE="$(resolve_mcp_file)"
                GRAPH_N="${GRAPH//\\//}"
                PYBIN_N="${PYBIN//\\//}"
                set +e
                "$PYBIN" - <<PY || warn "MCP wiring failed (non-fatal)"
import json, pathlib
p = pathlib.Path("$MCP_FILE")
if p.exists():
    c = json.loads(p.read_text())
else:
    c = {}
if "mcpServers" not in c:
    c["mcpServers"] = {}
key = "graphify-$ALIAS"
c["mcpServers"][key] = {
    "command": "$PYBIN_N",
    "args": ["-m", "graphify.serve", "$GRAPH_N"],
    "type": "stdio",
}
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(c, indent=2))
print(f"[aka-graph-init] MCP: {key} -> {p}")
PY
                set -e
            fi
        fi
    fi
fi

log "done."
[ "$QUIET" = "1" ] || code-review-graph repos 2>/dev/null || true
exit 0
