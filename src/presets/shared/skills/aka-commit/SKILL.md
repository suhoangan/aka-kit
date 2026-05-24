---
name: aka:commit
model: haiku
description: Create focused git commits with conventional format. ALWAYS asks before push and shows commit message/description first. Use when committing code changes.
argument-hint: [message]
---

# Git Commit

Create focused, well-formatted git commits. **NEVER push without explicit user approval.**

## Context

- Status: !`git status --porcelain`
- Staged: !`git diff --staged --name-only`
- Recent: !`git log --oneline -5`

## Task

Create a commit: "$ARGUMENTS"

## Rules

### CRITICAL: Push Safety
- **NEVER auto-push to remote.** After commit, show:
  - Commit message
  - Short commit description (why + key changes)
- Then ask user:
  > Commit created. Push to remote? [y/N]
- Default is NO push. Only push if user explicitly says yes.
- Never force-push. Never push to main/master without warning.

### Commit Format
- Conventional commits: `type(scope): description`
- Subject line ≤ 72 characters
- Body explains "why" if non-obvious
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`

### Breaking Changes
Two equivalent ways to indicate breaking changes:
- Preferred: add `!` after type/scope — `feat(api)!: remove deprecated endpoint`
- Alternative: add `BREAKING CHANGE:` in footer body

### Issue References (footer)
- `Fixes #123` — closes the issue on merge
- `Closes #456` — same effect
- `Refs #789` — links without closing

### Template
```
type(scope): concise description

Why:
- Brief motivation

What changed:
- Key modifications
```

### Security — Never Commit
- `.env`, `.env.*` files
- `auth.json`, credentials, API keys, tokens
- `node_modules/`, `vendor/`, `__pycache__/`
- Generated files (`generated/`, `pub/static/`, `.next/`, `dist/`)
- Database dumps, log files
- IDE configs (`.idea/`, `.vscode/` unless shared)

### Framework-Specific Exclusions

**Magento 2:**
- `app/etc/env.php` (contains secrets)
- `generated/`, `pub/static/`
- `auth.json` with repo credentials

**Laravel:**
- `.env` (use `.env.example` only)
- `storage/logs/`, `storage/framework/cache/`

**Next.js:**
- `.next/`, `out/`
- `.env.local`, `.env.production`

## Process

1. Review `git status` — identify what to stage
2. Stage relevant files (specific files, not `git add -A`)
3. Review diff of staged changes
4. Create commit with conventional message
5. **Before any push, show commit message + short description**
6. **Ask user if they want to push** — do NOT push automatically
