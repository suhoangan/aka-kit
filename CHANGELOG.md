# Changelog

All notable changes to **aka-kit** documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Added

- _(none yet)_

### Changed

- Distribution: GitHub repo install (`github:owner/aka-kit#tag` via npm/pnpm/npx); CLI renamed to `aka-kit`; manifest `.aka-kit.json`; no npm registry publish

## [0.1.1] — 2026-05-24

### Added

- GitHub Actions CI (`ci.yml`) and release (`release.yml`) workflows; issue/PR templates; `bumpp` + `scripts/prepublish-check.mjs` + `scripts/release-pack.mjs`
- Phase 4 shared bundle: 5 rules; templates (AGENTS.md, `.gitignore`, `.env.example`, `docs/` scaffold, `.husky/post-commit`); native AGENTS.md for Codex
- Phase 5 project hooks: bash guard, post-edit lint/typecheck, plan reminder; wired in `shared/preset.json` settings.hooks
- Phase 6 full-stack skills: moved `aka-databases` to shared; added better-auth, payment-integration, deploy, devops, security-scan, docs; presets `fullstack-nextjs`, `node-backend` (sources: ck-kit + global skills)
- Phase 7 agentic flows: `aka-plan`, `aka-cook`, `aka-fix`, `aka-ship`, `aka-bootstrap`, `aka-check` with slash commands; `docs/agentic-flows.md`; updated skill-workflow-routing
- Phase 8 CLI: `init`, `add`, `remove`, `upgrade`, `info`, `search`
- Phase 9 permissions: Bash allowlists per preset, baseline deny/ask rules, `permissions-policy.md`; `/fewer-permission-prompts` documented
- Phase 10 plugins: `docs/plugin-catalog.md`, `aka-add-plugin` skill, `src/core/plugin-catalog.js`
- `aka-kit doctor` cross-platform health-check command (macOS/Linux/Windows). Checks Node version, required binaries (rtk, code-review-graph, agent-browser, specify, uv, pipx, gh), parses `.mcp.json` / `~/.codex/config.toml`, validates `SKILL.md` frontmatter, detects orphan permissions, checks env vars.
- `LICENSE` (MIT)
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/` scaffold: project-overview-pdr, codebase-summary, system-architecture, code-standards, skill-catalog
- Per-preset `README.md` for shared / nextjs / php / hubspot / global / turbo-strapi-nextjs

### Changed

- _(none)_

### Fixed

- _(none)_

## [0.1.0] — 2026-05-24

### Added

- Initial CLI scaffold: `install`, `uninstall`, `list`, `update`, `presets`
- Multi-platform support: Claude Code, Cursor, OpenAI Codex CLI (`--platform claude|cursor|codex|both|all`)
- Presets: shared, nextjs, php, hubspot, global, turbo-strapi-nextjs
- 25 bundled skills (aka-\* + vercel-react-best-practices)
- 4 shared rules: development-rules, documentation-management, planning-rules, rtk
- 5 global hooks: session-init, dev-rules-reminder, privacy-block, descriptive-name, usage-context-awareness
- MCP merging into `.mcp.json` (Claude/Cursor) and `~/.codex/config.toml` (Codex)
- Auto-install dependency scripts: RTK, agent-browser, spec-kit, graph-init, tanstack-intent (Next.js)
- Dry-run mode (`--dry-run`)
- Manifest tracking (`.aka-kit.json`)
- Settings deep-merge with `.bak.<timestamp>` backups

[Unreleased]: https://github.com/suhoangan/aka-kit/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/suhoangan/aka-kit/releases/tag/v0.1.1
[0.1.0]: https://github.com/suhoangan/aka-kit/releases/tag/v0.1.0
