---
name: aka:graph-init
description: Bootstrap code-review-graph + graphify for the current project. Builds + registers the graph, adds gitignore entries, wires husky/global post-commit hooks. Use when user says "graph-init", "init graph", "setup graph for this project", or starts a new repo.
allowed-tools: Bash, Shell
version: 1.3.0
---

# aka:graph-init

One-shot setup combining `code-review-graph` and `graphify` for any project. Idempotent — safe to re-run.

## Instructions

**Preferred (all platforms, including Windows):** run `setup.mjs` next to this SKILL.md with Node — no Git Bash or WSL.

```bash
node setup.mjs [--with-graphify] [--alias NAME] [--skip-husky] [--skip-mcp]
```

Or use the global CLI (same logic):

```bash
aka-kit graph-init [--with-graphify] [--alias NAME] [--skip-husky] [--skip-mcp]
```

Skill install paths:

- Claude Code: `~/.claude/skills/aka-graph-init/setup.mjs`
- Cursor: `~/.cursor/skills/aka-graph-init/setup.mjs` or `setup.ps1` (Windows)

### Windows

Use **Node** (`setup.mjs`) or **PowerShell** (`setup.ps1`) — not WSL `bash` (broken PATH for `uv` / `.local/bin`).

```powershell
# PowerShell
.\setup.ps1 -WithGraphify

# Or Node directly
node setup.mjs --with-graphify
```

Set `AKAKIT_TARGET_DIR` to your project `.cursor` folder when wiring MCP for Cursor:

```powershell
$env:AKAKIT_TARGET_DIR = (Join-Path (Get-Location) ".cursor")
.\setup.ps1 -WithGraphify
```

Legacy `setup.sh` remains for Git Bash on Unix/macOS only.

Pass user flags through:

| User input                        | Command                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `/aka:graph-init`                 | `node setup.mjs` (code-review-graph only — free, AST-only)           |
| `/aka:graph-init --with-graphify` | `node setup.mjs --with-graphify` (graphify graph + Cursor rule + MCP) |
| `/aka:graph-init --alias my-app`  | `node setup.mjs --alias my-app`                                      |
| `/aka:graph-init --skip-husky`    | `node setup.mjs --skip-husky`                                        |
| `/aka:graph-init --skip-mcp`      | `node setup.mjs --skip-mcp` (skip MCP wiring)                        |

## What it does

1. Verifies `code-review-graph` (and `graphify` if requested) — auto-installs graphify via `uv tool install "graphify[mcp]"` when missing
2. `code-review-graph build` — AST parse, free, no LLM
3. `code-review-graph register . --alias <name>`
4. Appends `.code-review-graph/` (+ `graphify-out/`) to `.gitignore`
5. If `.husky/_` present, writes `.husky/post-commit` + `.husky/post-checkout` delegates
6. (`--with-graphify`) `graphify update .` + `graphify cursor install` (`.cursor/rules/graphify.mdc`)
7. (`--with-graphify`, unless `--skip-mcp`) Adds `graphify-<alias>` MCP using a **real** Python (not Windows Store stub):
   - Cursor: `$AKAKIT_TARGET_DIR/.mcp.json`, else `~/.cursor/.mcp.json`
   - Claude: `~/.claude/.mcp.json`

## Prereqs

- Project must be a git repo
- Node 18+ (for `setup.mjs`)
- **Auto-installed** on `aka-kit install --platform cursor`: `graphify[mcp]`, `code-review-graph`
- Manual fallback:
  ```bash
  uv tool install "graphify[mcp]" code-review-graph
  # or: pipx install 'graphify[mcp]' code-review-graph
  ```
- Global git hooks (optional): `git config --global core.hooksPath ~/.config/git/hooks`

## Windows troubleshooting

| Symptom                              | Fix                                                                |
| ------------------------------------ | ------------------------------------------------------------------ |
| `ModuleNotFoundError: mcp`           | `uv tool install "graphify[mcp]" --force`                          |
| MCP uses `WindowsApps\python3.exe`   | Use `setup.mjs` / `setup.ps1`; script picks uv tool Python         |
| MCP written to wrong config          | Set `AKAKIT_TARGET_DIR` to project `.cursor`                       |
| `graphify: command not found`        | `uv tool install "graphify[mcp]"` or `aka-kit install`             |
| Agent runs `bash setup.sh` and fails | Use `node setup.mjs --with-graphify` instead                       |

## Auto-install

`aka-kit install --platform cursor` auto-runs in project git repos (Node scripts — Windows-safe):

- Installs `graphify[mcp]`, builds `graphify-out/graph.json`, wires MCP to `.cursor/.mcp.json`
- Runs `graphify cursor install`
- Registers `code-review-graph` and updates `.gitignore`

Manual refresh: `/aka:graph-init --with-graphify` → `node setup.mjs --with-graphify`

## After running

- Restart Cursor to pick up MCP (only if `--with-graphify`)
- Verify: `code-review-graph repos` lists the new alias
- First commit auto-updates the graph via post-commit hook
