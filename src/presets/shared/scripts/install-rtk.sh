#!/usr/bin/env bash
# install-rtk: install RTK (Rust Token Killer) — https://github.com/rtk-ai/rtk
# Idempotent. Exits 0 on any failure so aka-kit install never fails.

set -u

RTK_VERSION="${AKAKIT_RTK_VERSION:-v0.41.0}"

log() { echo "[aka-kit:rtk] $*"; }
warn() { echo "[aka-kit:rtk] $*" >&2; }

# 1. Detect existing install — verify it's the rtk-ai version (has 'rtk gain')
if command -v rtk >/dev/null 2>&1; then
    if rtk gain --help >/dev/null 2>&1; then
        log "rtk already installed ($(rtk --version 2>/dev/null | head -1))"
        exit 0
    fi
    warn "found 'rtk' binary at $(command -v rtk) but it doesn't support 'rtk gain'."
    warn "you may have reachingforthejack/rtk (Rust Type Kit) installed — uninstall it first."
    exit 0
fi

OS="$(uname -s)"

# 2. macOS → prefer Homebrew
if [ "$OS" = "Darwin" ] && command -v brew >/dev/null 2>&1; then
    log "installing via Homebrew…"
    if brew install rtk >/dev/null 2>&1; then
        log "installed: $(rtk --version 2>/dev/null | head -1)"
        exit 0
    fi
    warn "brew install rtk failed — falling back to curl installer"
fi

# 3. Linux / fallback → curl installer
if command -v curl >/dev/null 2>&1; then
    log "installing via curl installer…"
    if curl -fsSL "https://raw.githubusercontent.com/rtk-ai/rtk/${RTK_VERSION}/install.sh" | sh >/dev/null 2>&1; then
        # Installer writes to ~/.local/bin — surface PATH reminder if needed
        if ! command -v rtk >/dev/null 2>&1; then
            warn "rtk installed to ~/.local/bin — add to PATH:"
            warn "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"
        else
            log "installed: $(rtk --version 2>/dev/null | head -1)"
        fi
        exit 0
    fi
    warn "curl installer failed"
fi

# 4. Cargo last-resort
if command -v cargo >/dev/null 2>&1; then
    log "installing via cargo…"
    cargo install --git https://github.com/rtk-ai/rtk --tag "${RTK_VERSION}" >/dev/null 2>&1 && {
        log "installed: $(rtk --version 2>/dev/null | head -1)"
        exit 0
    }
fi

warn "could not install rtk automatically. Install manually:"
warn "  macOS:  brew install rtk"
warn "  Linux:  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/${RTK_VERSION}/install.sh | sh"
warn "  Cargo:  cargo install --git https://github.com/rtk-ai/rtk --tag ${RTK_VERSION}"
exit 0
