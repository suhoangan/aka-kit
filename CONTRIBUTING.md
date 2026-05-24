# Contributing to aka-kit

Thanks for helping improve the kit.

## Dev setup

```bash
git clone https://github.com/suhoangan/aka-kit.git
cd aka-kit
npm install
npm link              # makes `aka-kit` available globally
aka-kit --version      # confirm
aka-kit doctor         # health-check your dev env
```

## Project layout

```
bin/aka-kit.js           # CLI entry (commander program)
src/commands/           # one file per command (install, uninstall, list, update, presets, doctor)
src/core/               # installer, preset-resolver, settings-merger, platforms, manifest, dependency-runner
src/core/doctor-checks/ # individual healthcheck modules (binaries, mcp, skills, etc.)
src/presets/            # preset bundles — each has preset.json + skills/ + rules/ + hooks/ + templates/ + scripts/
docs/                   # project documentation (PDR, architecture, code standards, skill catalog)
plans/                  # in-progress work plans, one folder per task
```

## Adding a preset

1. Create `src/presets/<name>/preset.json` (use existing as template — e.g. `nextjs/preset.json`)
2. Drop skills under `skills/<aka-name>/SKILL.md` (+ optional scripts/, references/, commands/)
3. Drop rules under `rules/<name>.md`
4. Drop hooks under `hooks/<name>.cjs`
5. Drop templates under `templates/<name>.md`
6. Drop install scripts under `scripts/<name>.sh` and reference from `dependencies.scripts`
7. Add CLI option in `src/commands/install.js`
8. Add to `docs/skill-catalog.md`
9. Update `CHANGELOG.md`

## Adding a skill

1. Create `src/presets/<preset>/skills/aka-<name>/SKILL.md` with frontmatter (`name:`, `description:`)
2. Add `"aka-<name>"` to `artifacts.skills` in `preset.json`
3. Add `"Skill(aka:<name>)"` to `permissions.allow`
4. Update `docs/skill-catalog.md`
5. Run `aka-kit doctor` to verify

## Code style

- **File naming:** kebab-case for `.js` / `.sh` / `.py` (long descriptive names OK — self-documenting for Grep)
- **File size:** keep `.js` under 200 lines — split into modules at clear concern boundaries
- **No `cd` in bash commands** — use absolute paths
- **No `--no-verify`** on commits unless explicitly requested
- **YAGNI / KISS / DRY** at all times
- **No comments unless WHY is non-obvious**
- **Cross-platform:** doctor + core logic must work on macOS, Linux, Windows. Pure Node, no bash assumptions inside `.js` files. Bash scripts in `scripts/` are OS-specific and skipped where they can't run (e.g. Windows without WSL).

## Commits

- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- No AI references in messages
- Run `aka-kit doctor` before opening a PR

## Testing

Smoke test before commit:

```bash
node bin/aka-kit.js install --nextjs --dry-run
node bin/aka-kit.js list --platform all
node bin/aka-kit.js doctor --quick
```

## Releasing

Maintainers only. Distribution is **GitHub repo install** (`github:owner/repo#tag`) — no npm registry publish.

1. Update `CHANGELOG.md` (move `[Unreleased]` into a versioned section).
2. `npm run test:ci` locally.
3. `npm run release` — interactive **bumpp** (bumps `package.json`, commits, tags `v*.*.*`, pushes).
4. GitHub Actions `release.yml` runs on the tag: `release-pack.mjs` → attaches `aka-kit-{version}.tgz` → `gh release create` with notes from `CHANGELOG.md`.

No `NPM_TOKEN` required. Users install with:

```bash
npm install -g github:suhoangan/aka-kit
# or one-off:
npx --package=github:suhoangan/aka-kit aka-kit install --nextjs
```

See `docs/system-architecture.md` → Release pipeline.

## Reporting bugs

Open an issue at https://github.com/suhoangan/aka-kit/issues with output of `aka-kit doctor --json`.
