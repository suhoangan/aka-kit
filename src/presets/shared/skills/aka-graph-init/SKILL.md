---
name: aka:graph-init
description: Bootstrap code-review-graph + graphify for the current project. Builds + registers the graph, adds gitignore entries, wires husky/global post-commit hooks. Use when user says "graph-init", "init graph", "setup graph for this project", or starts a new repo.
allowed-tools: Bash
version: 1.0.0
---

# ak:graph-init

One-shot setup combining `code-review-graph` and `graphify` for any project. Idempotent — safe to re-run.

## Instructions

Run the bundled `setup.sh` (located next to this SKILL.md in the skill directory):

```bash
bash "$(dirname "$0")/setup.sh"    # if invoked from a script
# or, when called from the skill loader, the script path is:
#   ~/.claude/skills/ak-graph-init/setup.sh   (Claude Code, shared preset)
#   ~/.cursor/skills/ak-graph-init/setup.sh   (Cursor, shared preset)
```

Pass user flags through:

| User input                       | Command                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `/ak:graph-init`                 | `setup.sh` (code-review-graph only — free, AST-only)                             |
| `/ak:graph-init --with-graphify` | `setup.sh --with-graphify` (also bootstrap graphify code-only graph + MCP entry) |
| `/ak:graph-init --alias my-app`  | `setup.sh --alias my-app` (override default basename)                            |
| `/ak:graph-init --skip-husky`    | `setup.sh --skip-husky` (don't write `.husky/post-commit`)                       |
| `/ak:graph-init --skip-mcp`      | `setup.sh --skip-mcp` (don't touch `~/.claude.json`)                             |

## What it does

1. Verifies `code-review-graph` (and `graphify` if requested) are installed
2. `code-review-graph build` — AST parse, free, no LLM
3. `code-review-graph register . --alias <name>` — registers in multi-repo registry
4. Appends `.code-review-graph/` (+ `graphify-out/`) to `.gitignore`
5. If `.husky/_` present, writes `.husky/post-commit` + `.husky/post-checkout` delegates
6. (`--with-graphify`) Runs `graphify update .` for a code-only graph
7. (`--with-graphify`, unless `--skip-mcp`) Adds `graphify-<alias>` to `~/.claude.json`

## Prereqs

- Project must be a git repo
- `pipx install graphifyy code-review-graph` (one-time global install)
- Global git hooks (optional): `git config --global core.hooksPath ~/.config/git/hooks`

## Auto-install

`aka-kit install` auto-runs this in code-review-graph-only mode. To upgrade with graphify later, run `/ak:graph-init --with-graphify`.

## After running

- Restart Claude Code / Cursor / Codex to pick up the new MCP entry (only if `--with-graphify`)
- Verify: `code-review-graph repos` should list the new alias
- First commit will auto-update the graph via the post-commit hook
