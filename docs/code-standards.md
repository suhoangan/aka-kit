# Code Standards

## File naming
- **JS / SH / Py:** kebab-case, descriptive (long is OK — self-documenting for Grep/Glob)
- **MD:** kebab-case
- **No abbreviations** unless industry-standard (mcp, cli, db)
- **No version suffixes** in filenames (`installer.js`, not `installer-v2.js`)

## File size
- **`.js` < 200 LOC** — split at clear concern boundaries
- **`.md`** — no strict limit, but break > 800 LOC docs into multiple files
- **`.sh`** — no strict limit; group related operations

## JS conventions
- **ESM modules** (`type: "module"` in package.json) — use `import` / `export`
- **No CommonJS** in source — `.cjs` only for hook files Claude Code expects
- **No default exports** for utility modules — named exports for clarity
- **Async/await over .then()**
- **No semicolons** ... actually **use semicolons** (existing code does)
- **2-space indent**, tab in some files — match the file's existing style

## Error handling
- **Validate at boundaries** (CLI flags, file parsing) — fail loud with clear messages
- **Trust internal code** — don't double-check what a typed function returns
- **`chalk.red` for errors, `chalk.yellow` for warnings, `chalk.dim` for hints**
- **Exit codes:** 0 = ok, 1 = warning, 2 = error (used by `doctor` and others)

## Cross-platform code
- **`path.join` / `path.sep` / `path.delimiter`** — never hardcode `/` or `\`
- **`os.homedir()`** — never `~` or `$HOME`
- **`process.platform`** checks for OS-specific branches (`'win32' | 'darwin' | 'linux'`)
- **`spawnSync` with `shell: false`** when possible (avoid shell injection)
- **No bash inside `.js`** — wrap shell calls and respect Windows
- **PATH lookups** must honour `PATHEXT` on Windows

## Comments
- **Default: no comments.** Names should self-document.
- **Comment WHY only**, never WHAT — code says what, comments say why
- **Avoid TODO/FIXME** unless paired with a tracking issue link

## Imports
- **Order:** node built-ins → npm packages → local modules
- **Alphabetised within each group** (loosely)
- **Relative paths** for local modules (`./preset-resolver.js`)

## Logging
- **`console.log`** for normal output
- **`console.error`** for warnings/errors (goes to stderr)
- **Use chalk** for colour, but ensure messages are readable without colour (CI logs)

## Tests
- Currently: smoke test via `--dry-run` only
- Future (Phase 2+): Vitest with fixture presets

## Commit messages
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Scoped if useful:** `feat(doctor): add MCP launch test`
- **Imperative mood:** "add", not "added"
- **No AI references** in commit messages or code comments

## Security
- **Never commit secrets** — `.env`, API keys, tokens
- **Validate file paths** — no traversal into parent dirs unless explicitly intended
- **Preserve existing settings** — every merge writes `.bak.<ts>` first
- **Idempotent installs** — re-running must be safe

## Modularization triggers
Refactor when:
- A `.js` file passes 200 LOC
- Two functions share > 10 LOC of logic (extract helper)
- A check would benefit from being one of several swappable strategies
- A constant is referenced from > 2 files (move to a `constants.js`)
