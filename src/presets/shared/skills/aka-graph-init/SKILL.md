---
name: aka:graph-init
description: Bootstrap code-review-graph + graphify for the current project. Builds + registers the graph, adds gitignore entries, wires husky/global post-commit hooks. Use when user says "graph-init", "init graph", "setup graph for this project", or starts a new repo.
allowed-tools: Bash
version: 1.1.0
---

# aka:graph-init

One-shot setup combining `code-review-graph` and `graphify` for any project. Idempotent — safe to re-run.

## Instructions

Run the bundled script (next to this SKILL.md):

```bash
bash setup.sh [--with-graphify] [--alias NAME] [--skip-husky] [--skip-mcp]
```

Skill install paths:

- Claude Code: `~/.claude/skills/aka-graph-init/setup.sh`
- Cursor: `~/.cursor/skills/aka-graph-init/setup.sh`

### Windows

Use **Git Bash** or the PowerShell wrapper — not WSL `bash` (broken PATH for `uv` / `.local/bin`).

```powershell
# PowerShell (recommended on Windows)
.\setup.ps1 -WithGraphify

# Git Bash
& "$env:ProgramFiles\Git\bin\bash.exe" "$env:USERPROFILE\.cursor\skills\aka-graph-init\setup.sh" --with-graphify
```

Set `AKAKIT_TARGET_DIR` to your project `.cursor` folder when wiring MCP for Cursor:

```powershell
$env:AKAKIT_TARGET_DIR = (Join-Path (Get-Location) ".cursor")
.\setup.ps1 -WithGraphify
```

Pass user flags through:

| User input                        | Command                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| `/aka:graph-init`                 | `setup.sh` (code-review-graph only — free, AST-only)            |
| `/aka:graph-init --with-graphify` | `setup.sh --with-graphify` (graphify graph + Cursor rule + MCP) |
| `/aka:graph-init --alias my-app`  | `setup.sh --alias my-app`                                       |
| `/aka:graph-init --skip-husky`    | `setup.sh --skip-husky`                                         |
| `/aka:graph-init --skip-mcp`      | `setup.sh --skip-mcp` (skip MCP wiring)                         |

## What it does

1. Verifies `code-review-graph` (and `graphify` if requested) — auto-installs graphify via `uv tool install "graphify[mcp]"` when missing
2. `code-review-graph build` — AST parse, free, no LLM
3. `code-review-graph register . --alias <name>`
4. Appends `.code-review-graph/` (+ `graphify-out/`) to `.gitignore`
5. If `.husky/_` present, writes `.husky/post-commit` + `.husky/post-checkout` delegates
6. (`--with-graphify`) `graphify update .` + `graphify cursor install` (`.cursor/rules/graphify.mdc`)
7. (`--with-graphify`, unless `--skip-mcp`) Adds `graphify-<alias>` MCP using a **real** Python (not Windows Store stub):
   - Cursor: `$AKAKIT_TARGET_DIR/.mcp.json`, else `~/.cursor/.mcp.json`
   - Claude: `~/.claude.json`

## Prereqs

- Project must be a git repo
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
| MCP uses `WindowsApps\python3.exe`   | Use `setup.ps1` / Git Bash; script picks uv tool Python            |
| MCP written to `~/.claude.json` only | Set `AKAKIT_TARGET_DIR` to project `.cursor` or use Cursor install |
| `graphify: command not found`        | `uv tool install "graphify[mcp]"`                                  |
| WSL bash fails                       | Use Git Bash from `C:\Program Files\Git\bin\bash.exe`              |

## Auto-install

`aka-kit install --platform cursor` auto-runs in project git repos:

- Installs `graphify[mcp]`, builds `graphify-out/graph.json`, wires MCP to `.cursor/.mcp.json`
- Runs `graphify cursor install`
- Registers `code-review-graph` and updates `.gitignore`

Manual refresh: `/aka:graph-init --with-graphify`

## After running

- Restart Cursor to pick up MCP (only if `--with-graphify`)
- Verify: `code-review-graph repos` lists the new alias
- First commit auto-updates the graph via post-commit hook
