---
name: aka:ship
description: 'Ship pipeline: test → review → commit → push → PR. Use when user says ship, release, open PR, or /aka:ship.'
argument-hint: '[official|beta] [--skip-tests] [--skip-review] [--dry-run]'
version: 1.0.0
---

# Ship — Branch to PR Pipeline

Single workflow from feature branch to PR URL. Framework-agnostic.

## Usage

```
/aka:ship
/aka:ship official
/aka:ship beta --skip-tests
/aka:ship --dry-run
```

## Flags

| Flag            | Effect                            |
| --------------- | --------------------------------- |
| `official`      | Target main/master; full pipeline |
| `beta`          | Target dev/beta; skip docs update |
| `--skip-tests`  | Tests already passed              |
| `--skip-review` | Skip pre-landing review           |
| `--dry-run`     | Show steps without executing      |

## Mode Detection

- `official` → default branch (main/master)
- `beta` → dev/beta branch
- No arg → infer from branch: `feature/*` → official; `dev/*` → beta; unclear → AskUserQuestion

## Pipeline

```
1. Pre-flight    → branch, uncommitted changes, diff summary
2. Merge target  → fetch + merge origin/<target> (stop on conflicts)
3. Tests         → delegate to tester / aka:test (stop on failure)
4. Review        → delegate to code-reviewer / aka:code-review
5. Docs          → aka:docs update (official only; background OK)
6. Commit        → aka:commit / git-manager (conventional message)
7. Push          → git push -u origin <branch>
8. PR            → gh pr create with summary + test plan
```

## Blocking (stop and report)

- Already on target branch
- Unresolvable merge conflicts
- Test failures (unless `--skip-tests`)
- Critical review issues → AskUserQuestion

## Non-blocking (auto-handle)

- Uncommitted changes → include in commit
- Patch version bump → auto if version file exists
- No changelog → skip silently

## Output

```
✓ Pre-flight: feature/auth, +120/-30 lines
✓ Merged: origin/main (up to date)
✓ Tests: 42 passed
✓ Review: 0 critical
✓ Committed: feat(auth): add OAuth callback
✓ PR: https://github.com/org/repo/pull/123
```

## Rules

- Never force push
- Never skip tests unless `--skip-tests`
- Delegate test/review to subagents — don't inline
- Use `gh` for PR creation

## Related

- **Before:** `/aka:cook` or `/aka:fix` completes implementation
- **Commit only:** `aka:commit` or `aka:git`
