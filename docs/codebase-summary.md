# Codebase Summary

Snapshot of the aka-kit source tree, ~2026-05-24.

## Top-level

```
bin/aka-kit.js               # CLI entry — registers commands via commander
src/                        # All implementation
plans/                      # Work plans (this folder is gitignored except plan.md files)
docs/                       # You are here
package.json                # ESM, Node 18+, deps: chalk, commander, fs-extra, prompts, @iarna/toml
README.md                   # User-facing docs
CHANGELOG.md                # Release history
LICENSE                     # MIT
CONTRIBUTING.md             # Dev guide
```

## src/commands/

One file per CLI verb. Each exports a `register<Name>Command(program)` function called from `bin/aka-kit.js`.

| File           | Verb        | Purpose                                              |
| -------------- | ----------- | ---------------------------------------------------- |
| `install.js`   | `install`   | Resolve preset chain → call core installer           |
| `uninstall.js` | `uninstall` | Read manifest → remove files → rewrite settings      |
| `list.js`      | `list`      | Show installed presets per platform                  |
| `update.js`    | `update`    | Re-install presets with latest version               |
| `presets.js`   | `presets`   | List available presets                               |
| `doctor.js`    | `doctor`    | Health-check env, binaries, MCP, skills, permissions |

## src/core/

Reusable logic shared by commands.

| File                   | Purpose                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `installer.js`         | `install(targetDir, presetChain, opts)` — copies artifacts, merges settings, writes manifest                |
| `preset-resolver.js`   | Walks `includes:` chain (e.g. `nextjs → shared`), returns ordered preset list                               |
| `settings-merger.js`   | `mergeSettings`, `mergeMcpConfig` (JSON), `mergeMcpConfigToml` (Codex), `mergePermissions`                  |
| `manifest.js`          | Read/write `.aka-kit.json` (legacy `.akakit.json`; tracks installed presets per target)                     |
| `platforms.js`         | `resolveTargetDirs(platform)` for claude/cursor/codex/both/all                                              |
| `dependency-runner.js` | Run `dependencies.scripts` via cross-platform Node (`.mjs` in `dependency-scripts/`), bash fallback on Unix |
| `doctor-checks/*.js`   | One module per check category (binaries, node, mcp-config, skills, permissions, env-vars)                   |

## src/presets/

Each subdir is a self-contained preset.

```
<preset>/
├── preset.json              # Contract — declares artifacts, permissions, settings, mcp, dependencies
├── skills/                  # Each subdir is one skill with SKILL.md + optional refs/scripts
├── rules/                   # Plain .md files copied into <target>/.claude/rules/
├── hooks/                   # .cjs files copied into <target>/.claude/hooks/
├── templates/               # Copied into project root (CLAUDE.md, AGENTS.md, etc.)
└── scripts/                 # Bash install scripts executed by dependency-runner
```

### Preset inheritance

`includes: ["shared"]` makes the preset prepend shared's artifacts before its own. The chain is flattened by `preset-resolver.js` and processed in order — later presets override earlier ones on key collisions (e.g. settings, permissions).

| Preset              | Includes | Adds                                                           |
| ------------------- | -------- | -------------------------------------------------------------- |
| shared              | —        | 12 skills, 4 rules, MCP servers, plugins, auto-install scripts |
| global              | —        | Global hooks, primary-workflow / orchestration rules           |
| nextjs              | shared   | 6 frontend skills, tanstack-intent script                      |
| php                 | shared   | 4 backend skills                                               |
| hubspot             | shared   | 3 hubspot skills, hubspot rules                                |
| turbo-strapi-nextjs | shared   | 6 frontend skills + monorepo/strapi/nextjs rules               |

## Manifest format

`<target>/.aka-kit.json`:

```json
{
	"presets": {
		"nextjs": {
			"version": "0.1.0",
			"installedAt": "2026-05-24T13:30:00Z",
			"files": [".claude/skills/aka-git/SKILL.md", "..."]
		}
	}
}
```

Used by `uninstall` to safely remove only files this preset wrote, and by `list` to show what's installed.

## Settings merge strategy

- `.claude/settings.json` — deep-merged. Arrays union by stringified equality.
- `.claude/.mcp.json` — `mcpServers.*` merged, existing entries preserved unless preset explicitly overrides.
- `~/.codex/config.toml` — `[mcp_servers.NAME]` tables merged. Existing tables preserved.
- `permissions.allow` — union, deduplicated.
- Before each merge: write `<file>.bak.<ISO-timestamp>`.

## Cross-platform contract

| Layer                          | Cross-platform?                                              | Notes                                                                  |
| ------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| CLI (`bin/aka-kit.js`, `src/`) | ✅ Yes                                                       | Pure Node, uses `path.join`, `os.homedir()`, `process.platform` checks |
| Doctor                         | ✅ Yes                                                       | `whichBin()` walks PATH with PATHEXT on Windows                        |
| Settings merger                | ✅ Yes                                                       | fs-extra, JSON/TOML                                                    |
| Dependency scripts             | ✅ Node `.mjs` on all platforms; `.sh` fallback on Unix only |
| Hooks (`.cjs`)                 | ✅ Yes                                                       | Node-based                                                             |

## File size policy

Code files > 200 LOC trigger split. Current outliers:

- `src/core/installer.js` (~210 LOC) — borderline, will split if it grows
- `src/core/settings-merger.js` (~180 LOC) — OK
