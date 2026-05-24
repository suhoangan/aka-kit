# System Architecture

## Big picture

```
                   ┌─────────────────────┐
   user terminal   │  aka-kit <command>   │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │  bin/aka-kit.js      │  commander program
                   └──────────┬──────────┘
                              │ dispatches
        ┌─────────────────────┼───────────────────────┐
        ▼            ▼        ▼          ▼            ▼
   install     uninstall    list      update       doctor
        │            │        │          │            │
        ▼            ▼        ▼          ▼            ▼
   ┌─────────────────────────────────────────────────────┐
   │                    src/core/                         │
   │  installer · preset-resolver · settings-merger ·    │
   │  manifest · platforms · dependency-runner ·         │
   │  doctor-checks/*                                     │
   └─────────────────────────────────────────────────────┘
        │
        ▼ writes
   ┌──────────────────────────────────────────────────┐
   │  <cwd>/.claude/      ~/.claude/                  │
   │  <cwd>/.cursor/      ~/.cursor/                  │
   │  <cwd>/.codex/       ~/.codex/                   │
   └──────────────────────────────────────────────────┘
```

## Install flow (happy path)

```
aka-kit install --nextjs --platform all
        │
        ▼
1. parse opts → preset = "nextjs", platforms = [claude, cursor, codex]
        │
        ▼
2. resolvePresets("nextjs") → [shared, nextjs]   (includes-chain flattened)
        │
        ▼
3. for each platform:
        ├── resolveTargetDirs(platform) → { projectDirs, globalDirs }
        ├── for each preset in chain:
        │     ├── installArtifacts() — copy skills/rules/hooks/templates
        │     ├── mergeSettings(.claude/settings.json)
        │     ├── mergeMcpConfig(.mcp.json)         ← claude/cursor
        │     │   or mergeMcpConfigToml(config.toml) ← codex
        │     ├── mergePermissions()
        │     └── runDependencyScripts() — bash install scripts
        ▼
4. writeManifest(.aka-kit.json)
        │
        ▼
5. print summary
```

## Preset resolution

```
preset.json:
  includes: ["shared"]
  artifacts: { skills: [...], rules: [...], ... }

resolver walk:
  nextjs → includes: ["shared"] → shared → includes: []
  flatten: [shared, nextjs]  (parents first, child wins on conflicts)
```

## Platform routing

`src/core/platforms.js`:

| platform flag      | projectDirs                        | globalDirs                 |
| ------------------ | ---------------------------------- | -------------------------- |
| `claude` (default) | `<cwd>/.claude`                    | `~/.claude`                |
| `cursor`           | `<cwd>/.cursor`                    | `~/.cursor`                |
| `codex`            | `<cwd>/.codex` + `<cwd>/AGENTS.md` | `~/.codex` + `~/AGENTS.md` |
| `both`             | claude + cursor                    | claude + cursor            |
| `all`              | claude + cursor + codex            | claude + cursor + codex    |

**Codex specifics:**

- `CLAUDE.md` template → renamed `AGENTS.md` at parent dir
- `.mcp.json` → `~/.codex/config.toml` (`[mcp_servers.NAME]` tables)
- Skills/rules/hooks copied as reference (Codex has no native runtime)

## Settings merge

```
existing settings.json         preset.settings              merged output
{ "a": 1, "b": [1] }    +   { "b": [2], "c": 3 }    =   { "a": 1, "b": [1,2], "c": 3 }
```

- Objects: deep merge (preset wins on scalar collision)
- Arrays: union, dedupe via JSON-stringify equality
- `.bak.<ISO>` written before every change

## Doctor architecture

```
runDoctor()
   ├── checkNode()
   ├── checkBinaries()         ── walks PATH for rtk, code-review-graph, etc.
   ├── checkMcpConfigs()       ── parses .mcp.json + config.toml
   ├── checkSkills()           ── walks install dirs, validates SKILL.md frontmatter
   ├── checkPermissions()      ── compares settings.json allow-list vs installed skills
   ├── checkEnvVars()          ── CONTEXT7_API_KEY etc.
   └── (optional) applyFixes() ── if --fix, re-run scripts/install-*.sh
```

Each check returns `{ category, name, status: ok|warn|error|skip, detail?, fix? }`. Orchestrator aggregates and renders.

## Cross-platform support

| Concern                                   | macOS     | Linux     | Windows                                            |
| ----------------------------------------- | --------- | --------- | -------------------------------------------------- |
| Node CLI runtime                          | ✅        | ✅        | ✅                                                 |
| Path handling (`path.join`, `os.homedir`) | ✅        | ✅        | ✅                                                 |
| Binary detection (`whichBin`)             | ✅ `PATH` | ✅ `PATH` | ✅ `PATH` + `PATHEXT` (`.EXE`/`.CMD`/`.BAT`)       |
| Bash scripts (`scripts/*.sh`)             | ✅        | ✅        | ⚠️ Requires WSL / Git Bash; auto-skipped otherwise |
| Husky hook delegation                     | ✅        | ✅        | ⚠️ Git Bash needed                                 |
| MCP server processes                      | ✅        | ✅        | ✅ (Node-based servers)                            |

**Strategy:** keep core JS pure-Node and cross-platform. Bash scripts are best-effort additions — `dependency-runner.js` detects `process.platform === 'win32'` + absence of `bash`, logs a warning, and continues without failing.

## Release pipeline

```
local                         GitHub Actions                    GitHub Releases
  │
  ├── npm run test:ci         PR / push main ──► ci.yml
  │   (dry-run + doctor)
  │
  ├── npm run release         tag v*.*.* ─────► release.yml
  │   (bumpp: version, commit, tag, push)            ├── prepublish-check
  │                                                  ├── release-pack.mjs → aka-kit-{version}.tgz
  │                                                  └── gh release (CHANGELOG + install snippet)
  ▼
```

**Maintainer flow**

1. Move `[Unreleased]` items in `CHANGELOG.md` into `## [x.y.z] — date`.
2. `npm run release` (bumpp) — pick patch/minor, confirm commit + tag + push.
3. Workflow publishes release notes + optional tarball asset; verify install commands in release notes.
4. Users install with `npm install -g github:owner/aka-kit#tag`, `npx --package=github:owner/aka-kit aka-kit …`, or `aka-kit upgrade`.

**CI gate:** `scripts/prepublish-check.mjs` — dry-run install + `doctor --quick` (exit 2 only on errors; warnings allowed).

## Data flow examples

### MCP config write (Claude)

```
shared/preset.json.mcp.context7  →  mergeMcpConfig()  →  <target>/.claude/.mcp.json
                                                              .mcpServers.context7
```

### MCP config write (Codex)

```
shared/preset.json.mcp.context7  →  mergeMcpConfigToml()  →  ~/.codex/config.toml
                                                                [mcp_servers.context7]
                                                                type = "http"
                                                                url = "..."
```

### Permissions merge

```
shared.permissions.allow + nextjs.permissions.allow
        ↓
union, dedupe
        ↓
settings.json.permissions.allow = [...all unique entries...]
```

## Open architecture questions

- Should `dependency-runner.js` execute `.ps1` on Windows when `.sh` is unavailable? (Currently: just skips.)
- Should doctor's MCP-launch test cache results to avoid repeated 5s spawns?
- Should preset.json schema be JSON-Schema validated?
