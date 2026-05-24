# aka-kit

`aka-kit` is a toolkit CLI for AI coding agents — install curated preset bundles (skills, rules, hooks, templates, MCP config) into **Claude Code**, **Cursor**, and **OpenAI Codex CLI** by project type.

## Install

**From GitHub** (no npm registry — installs source + dependencies via npm/pnpm):

```bash
# Global CLI (recommended)
npm install -g github:suhoangan/aka-kit

# Pin a release tag
npm install -g github:suhoangan/aka-kit#v0.1.1

# One-off — no global install
npx --package=github:suhoangan/aka-kit aka-kit install --nextjs
npx --package=github:suhoangan/aka-kit aka-kit doctor --quick
```

**pnpm:**

```bash
pnpm add -g github:suhoangan/aka-kit
pnpm dlx github:suhoangan/aka-kit aka-kit install --nextjs
```

Replace `v0.1.1` with the [latest release tag](https://github.com/suhoangan/aka-kit/releases). Then: `aka-kit --version`.

**From source** (development):

```bash
git clone https://github.com/suhoangan/aka-kit.git
cd aka-kit
pnpm install   # or: npm install

# Global CLI from source (pick one — works on macOS, Linux, Windows)
npm link                  # recommended; all platforms
pnpm add -g .             # pnpm global install from current dir
# Do NOT use `pnpm link --global` — pnpm requires `pnpm link <dir>`

# Or run without a global install:
node bin/aka-kit.js --version
```

**Upgrade:** `aka-kit upgrade` (re-installs from latest GitHub release tag).

## Security & trust

aka-kit is **public and open source** ([MIT](./LICENSE), copyright ansh). Before installing:

| What                 | Where                                          | Notes                                                                                                  |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Skills, rules, hooks | `<target>/.claude/` (or `.cursor/`, `.codex/`) | Copied from presets; review with `--dry-run`                                                           |
| Settings merge       | `settings.json`, `.mcp.json`                   | Deep-merged; `.bak.<timestamp>` backup before overwrite                                                |
| Permissions          | `settings.json`                                | Pre-approved Bash/MCP rules — see [permissions-policy](src/presets/shared/rules/permissions-policy.md) |
| Project templates    | repo root (`CLAUDE.md`, `.env.example`, …)     | Skipped if file already exists                                                                         |
| Manifest             | `.aka-kit.json`                                | Tracks installed files per target                                                                      |

**Network scripts** (optional, non-fatal if they fail) run on `aka-kit install`:

- `install-rtk.sh` — may `curl \| sh` from **tagged** [rtk-ai/rtk](https://github.com/rtk-ai/rtk) release
- `install-agent-browser.sh` — Homebrew / `npm install -g agent-browser@…` / cargo
- `install-speckit.sh` — `uv tool install` from **tagged** [github/spec-kit](https://github.com/github/spec-kit)
- `install-tanstack-intent.sh` (nextjs) — pinned `@tanstack/intent` via npx
- `auto-graph-init.sh` — local graph build only

**MCP servers** use **pinned npm/git versions** (not `@latest`). See [docs/pinned-dependencies.md](./docs/pinned-dependencies.md).

**Never commit** `.env` or API keys. Use `.env.example` as a template only.

- [SECURITY.md](./SECURITY.md) — report vulnerabilities
- [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) — bundled and runtime third-party components

## Setup CLI

Use the setup command:

```bash
aka-kit install [options]
```

### Preset options

- `--nextjs` Install Next.js project preset (default target: `<cwd>/.claude/`)
- `--php` Install PHP project preset (default target: `<cwd>/.claude/`)
- `--hubspot` Install HubSpot project preset (default target: `<cwd>/.claude/`)
- `--global` Install global user preset (default target: `~/.claude/`)

### Utility options

- `--dry-run` Preview file operations and merges without writing changes
- `--platform <platform>` Install target: `claude` (default), `cursor`, `codex`, `both` (claude+cursor), or `all` (claude+cursor+codex)
- `--docs` Print setup docs directly in terminal

`--platform` is also accepted on `uninstall`, `update`, and `list`. For `list` it defaults to `all` so every install shows up.

## Examples

```bash
# Interactive wizard (platform → auto-detected project type → optional global)
aka-kit install

# Same flow via init
aka-kit init

# Install Next.js preset for current project
aka-kit install --nextjs

# Install project + global presets together
aka-kit install --nextjs --global --platform both

# Install only for Cursor
aka-kit install --nextjs --platform cursor

# Install for OpenAI Codex CLI (writes AGENTS.md + ~/.codex/config.toml)
aka-kit install --nextjs --platform codex

# Install for all three editors at once
aka-kit install --nextjs --global --platform all

# Install for Claude Code explicitly (same as default)
aka-kit install --nextjs --platform claude

# Preview setup changes only
aka-kit install --nextjs --dry-run

# Show setup docs in CLI
aka-kit install --docs
```

## Health check

```bash
aka-kit doctor              # full check (env, binaries, MCP, skills, permissions, network)
aka-kit doctor --quick      # skip network reachability checks
aka-kit doctor --json       # machine-readable output (for CI / scripts)
```

Cross-platform: pure Node, works on **macOS, Linux, and Windows**. `aka-kit install` **bootstraps the core toolchain first** (uv → Python → pip → pipx → bun → cargo) on every dependency script, then installs packages (code-review-graph, graphify, claude-mem, MCP npm packages, rtk, agent-browser, spec-kit) — no Git Bash required (Git Bash optional for RTK curl installer on Windows).

Exit codes:

| Code | Meaning                                                           |
| ---- | ----------------------------------------------------------------- |
| `0`  | all checks passed                                                 |
| `1`  | warnings only (recommended tooling missing, env vars unset, etc.) |
| `2`  | errors (required runtime missing, MCP config parse failed)        |

What it checks:

- **Runtime** — Node ≥ 18
- **Binaries** — node, npx, git (required); rtk, code-review-graph, pipx, uv, uvx, bash (recommended); specify, agent-browser, gh, cargo, brew (optional)
- **MCP config** — parses `.mcp.json` (Claude/Cursor) and `~/.codex/config.toml` (Codex), validates structure
- **Skills** — walks `<target>/skills/*/SKILL.md`, validates frontmatter (`name`, `description`)
- **Permissions** — detects orphan `Skill(aka:foo)` entries in `settings.json` that lack a corresponding skill directory
- **Env vars** — `CONTEXT7_API_KEY`
- **Connectivity** — plugin marketplaces (`--quick` skips)

Open an issue with `aka-kit doctor --json` output if anything looks off.

## CLI ergonomics

```bash
aka-kit init                 # interactive wizard (preset + platform + global)
aka-kit info nextjs          # preview what a preset installs
aka-kit info nextjs --json   # machine-readable preset manifest
aka-kit search deploy        # search skills, rules, presets
aka-kit add aka-deploy       # add one skill to project install
aka-kit remove aka-deploy    # remove one skill
aka-kit upgrade              # reinstall from latest GitHub release tag
aka-kit upgrade --check      # compare current vs latest without installing
```

## Notes

- Default is **Claude Code**: installs to `~/.claude/` and `<cwd>/.claude/` unless `--platform` overrides.
- `--platform both` writes to Claude + Cursor (`~/.claude` + `~/.cursor`). `--platform all` adds Codex (`~/.codex`).
- **Codex specifics:**
  - Codex installs a native **`AGENTS.md`** template (not a rename of `CLAUDE.md`). Claude/Cursor get `CLAUDE.md`.
  - MCP servers are merged into `~/.codex/config.toml` as `[mcp_servers.NAME]` tables (instead of `.mcp.json`).
  - Skills, rules, and hooks copy into `.codex/` as reference (Codex has no native runtime for them yet).
  - Existing servers/keys are preserved on every merge; a `.bak.<timestamp>` file is written before each change.

## Bundled MCP servers

`shared` preset wires these MCP entries into `.claude/.mcp.json`:

| Server              | Package / ref (pinned)          | Transport | Requires                                              |
| ------------------- | ------------------------------- | --------- | ----------------------------------------------------- |
| `playwright`        | `@playwright/mcp@0.0.75`        | npx       | Node                                                  |
| `agent-browser`     | `agent-browser-mcp@0.1.3`       | npx       | Node; `agent-browser` CLI recommended                 |
| `figma`             | `@vkhanhqui/figma-mcp-go@0.1.3` | npx       | Node + Figma desktop plugin                           |
| `context7`          | HTTP endpoint                   | http      | `CONTEXT7_API_KEY` env var (free key at context7.com) |
| `code-review-graph` | `code-review-graph` (PyPI)      | stdio     | `pipx install code-review-graph`                      |
| `serena`            | `oraios/serena@v1.5.1`          | stdio     | `uvx` (`pipx install uv`)                             |

`claude-mem` and `qmd` are enabled as **plugins** (via `enabledPlugins`), not MCP — installed automatically.

## Auto RTK install

Every install auto-runs `scripts/install-rtk.sh` which installs [RTK (Rust Token Killer)](https://github.com/rtk-ai/rtk) — a CLI proxy that compresses tool outputs and saves 60–90% on LLM tokens.

Install method order:

1. Already installed → skip
2. macOS + Homebrew → `brew install rtk`
3. Linux/macOS fallback → tagged RTK release install script (`v0.41.0`)
4. Cargo last-resort → `cargo install --git … --tag v0.41.0`

If all methods fail, aka-kit prints manual instructions and continues — install never fails because of RTK.

## Auto agent-browser install

Every install auto-runs `scripts/install-agent-browser.sh` which installs [Vercel Labs agent-browser](https://github.com/vercel-labs/agent-browser) — a fast native Rust CLI for AI-driven browser automation (snapshots, clicks, fills, screenshots, AI chat REPL).

Install method order:

1. Already installed → skip
2. macOS + Homebrew → `brew install agent-browser`
3. npm fallback → `npm install -g agent-browser@0.27.0`
4. Cargo last-resort → `cargo install agent-browser`

After install, runs `agent-browser install` once to download Chrome for Testing. On Linux, uses `--with-deps`. If every method fails, aka-kit prints manual instructions and continues — install never fails because of agent-browser.

## Auto spec-kit install

Every install auto-runs `scripts/install-speckit.sh` which:

1. Installs [GitHub spec-kit](https://github.com/github/spec-kit) (`specify` CLI) via `uv tool install` if missing
2. Runs `specify init . --here --force --integration claude` in the current git repo

After install, the `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement` slash commands are available in Claude Code.

Prereq: `uv` must be installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`). Skipped silently if `uv` is missing.

## Auto TanStack Intent (Next.js preset only)

`aka-kit install --nextjs` auto-runs `scripts/install-tanstack-intent.sh` which invokes [`@tanstack/intent install`](https://tanstack.com/blog/from-docs-to-agents). The CLI scans the project's `package.json`, discovers every intent-enabled TanStack package (Query, Router, Table, Form, …), and wires their **Agent Skills** into `AGENTS.md` / `CLAUDE.md` / `.cursorrules` so agents read accurate, version-pinned guidance directly from the libraries you've installed.

Skipped silently when:

- no `package.json` in the working directory
- no `@tanstack/*` dependency declared
- `npx` is unavailable

Re-running is safe — `@tanstack/intent install` reconciles the skill block on every invocation, so updating a TanStack package and re-running `aka-kit install --nextjs` keeps skills in sync.

## Auto graph-init + graphify

Every **project** install (in a git repo) auto-runs:

1. **code-review-graph** — AST-only structural graph (free)
2. **graphify** — knowledge graph per [graphify docs](https://github.com/safishamsi/graphify): `pipx install graphify[mcp]` → `graphify install` (grammars) → `graphify update .`
3. Wires **`graphify-<repo>`** MCP into `.claude/.mcp.json` or `.cursor/.mcp.json` when `graphify-out/graph.json` exists
4. Adds `.code-review-graph/` and `graphify-out/` to `.gitignore`
5. Husky hook delegates when `.husky/_` is present

Prerequisites are **auto-installed** on `aka-kit install` (Windows + macOS). Each platform gets its own config:

| Platform | Config dir | MCP file      | spec-kit integration | Serena context  |
| -------- | ---------- | ------------- | -------------------- | --------------- |
| Claude   | `.claude/` | `.mcp.json`   | `claude`             | `claude-code`   |
| Cursor   | `.cursor/` | `.mcp.json`   | `cursor-agent`       | `ide-assistant` |
| Codex    | `.codex/`  | `config.toml` | `codex`              | `ide-assistant` |

Project-only steps (graphify, spec-kit, graph-init) run in `<cwd>/.cursor` — not on global `~/.cursor` skill install.

Manual fallback:

```bash
pipx install 'graphify[mcp]==0.8.17' code-review-graph
graphify install   # tree-sitter grammars (required once)
```

Re-run `/aka:graph-init --with-graphify` to refresh the graph or MCP entry.
