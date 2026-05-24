# Project Overview — Product Definition Requirements (PDR)

## What

**aka-kit** is a CLI that installs curated bundles (skills, rules, hooks, MCP servers, plugins, templates) into AI coding tools — Claude Code, Cursor, and OpenAI Codex CLI — by project type (Next.js, PHP, HubSpot, monorepo, etc.).

## Why

Setting up a productive AI coding environment is repetitive and error-prone. Every new project re-discovers:

- Which skills/rules to install
- How to wire MCP servers (`.mcp.json` vs `config.toml`)
- How to merge permissions without overwriting existing settings
- Which auxiliary tools (RTK, code-review-graph, agent-browser, spec-kit) to install

`aka-kit install --nextjs` solves all of that in one command, idempotently, across three editors.

## Users

- Solo developers shipping side projects fast
- Agencies and teams standardising AI tooling across client engagements
- Teams onboarding new devs who want one-command parity

## Goals

1. **Zero-config install** — `aka-kit install --<preset>` is enough to go from empty repo to fully-configured Claude/Cursor/Codex setup.
2. **Cross-platform** — works on macOS, Linux, Windows. CLI is pure Node; bash dependency scripts auto-skip on incompatible platforms.
3. **Multi-platform editor** — Claude Code, Cursor, Codex from a single preset definition (`--platform claude|cursor|codex|both|all`).
4. **Idempotent** — re-running `install` / `update` / `doctor` never breaks state. Backups (`.bak.<timestamp>`) before every merge.
5. **Self-validating** — `aka-kit doctor` reports environment health, flags missing binaries, validates MCP config, detects orphan permissions.
6. **Composable presets** — `nextjs` extends `shared` extends nothing. New presets cherry-pick artifacts from siblings.

## Non-goals

- Building a new editor or runtime
- Replacing Claude Code's plugin marketplace
- Tracking telemetry / phoning home
- Auto-updating user CLAUDE.md content (we own template, user owns project copy)

## Success metrics

- < 60 seconds from `npx aka-kit install --nextjs` to first agent invocation
- 0 manual `.mcp.json` edits required for canonical stacks
- `aka-kit doctor` exits 0 on a freshly installed preset
- Single preset definition produces correct output for all three editors

## Stack

- **Runtime:** Node 18+
- **CLI framework:** commander
- **TOML:** @iarna/toml
- **Filesystem:** fs-extra
- **Prompts:** prompts (for interactive selectors)
- **Distribution:** npm (`npx aka-kit`)

## Scope (in / out)

**In scope:**

- Install, uninstall, update, list, doctor, presets commands
- Preset bundles per project type
- Auto-install of common dev binaries (RTK, agent-browser, spec-kit, graph-init)
- Multi-platform editor support

**Out of scope (for now):**

- GUI / TUI
- Cloud-hosted profiles
- Skill authoring assistant (use `/skill-creator` upstream)
- Editor itself (we configure, not replace)
