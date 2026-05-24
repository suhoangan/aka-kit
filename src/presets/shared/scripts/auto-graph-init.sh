#!/usr/bin/env bash
# auto-graph-init: dependency-script hook invoked by aka-kit install.
# Delegates to the bundled aka-graph-init/setup.sh in code-review-graph-only mode.
# Exits 0 on missing prereqs so aka-kit install never fails because of this.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETUP="$SCRIPT_DIR/../skills/aka-graph-init/setup.sh"

if [ ! -x "$SETUP" ]; then
    echo "[aka-kit] graph-init setup.sh not executable — skipping" >&2
    exit 0
fi

# Run non-interactively, fail-soft.
"$SETUP" --quiet || {
    echo "[aka-kit] graph-init skipped (non-fatal)" >&2
    exit 0
}
