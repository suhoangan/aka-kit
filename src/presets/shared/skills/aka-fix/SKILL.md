---
name: aka:fix
description: 'Unified bug-fix pipeline: debug → fix → test → review. Use for errors, test failures, CI failures, type/lint issues, or /aka:fix.'
argument-hint: '[issue description] [--auto|--review|--quick]'
version: 1.0.0
---

# Fix — Bug & Failure Pipeline

Unified fix workflow with complexity routing. **Always activate `aka:debug` first.**

## Usage

```
/aka:fix Login returns 500 on OAuth callback
/aka:fix CI failing on unit tests --quick
/aka:fix Type errors in auth module --review
```

## Modes

| Mode          | Flag               | Behavior                                |
| ------------- | ------------------ | --------------------------------------- |
| Autonomous    | `--auto` (default) | Auto-approve if review ≥9.5, 0 critical |
| Human-in-loop | `--review`         | Pause for approval each step            |
| Quick         | `--quick`          | Single-file / type / lint — fast cycle  |

If no flag in request, use `--auto` for simple issues; AskUserQuestion for production-critical.

## Workflow

### Step 0: Activate `aka:debug`

Root cause before any fix. Parallel `Explore` subagents to verify hypotheses.

### Step 1: Classify complexity

| Level    | Indicators                     | Route                              |
| -------- | ------------------------------ | ---------------------------------- |
| Simple   | Single file, clear stack trace | debug → fix → review               |
| Moderate | Multi-file, unclear cause      | + scout, sequential-thinking       |
| Complex  | Architecture / system-wide     | + research, `/aka:plan` before fix |
| CI       | GitHub Actions / pipeline      | `gh run view`, log analysis        |
| Tests    | Suite failures                 | `aka:test`, bisect if needed       |

### Step 2: Implement fix

Minimal diff. Match existing conventions. No over-engineering.

### Step 3: Verify

- Spawn `tester` — run affected + related tests
- Parallel Explore scouts for blast radius
- Activate `aka:test`

### Step 4: Review

Spawn `code-reviewer`; activate `aka:code-review`

### Step 5: Finalize

1. Summary: root cause, files changed, confidence
2. `docs-manager` if behavior/API changed
3. Ask user about commit via `aka:commit`

## Output

```
✓ Step 0: Root cause — missing null check in auth/callback.ts:47
✓ Step 1: Fix — 2 files changed
✓ Step 2: Tests — 18/18 passed
✓ Step 3: Review — 9.6/10
✓ Step 4: Complete
```

## Rules

- NO fixes without root cause from `aka:debug`
- Never ignore failing tests
- Sacrifice grammar for concision in reports

## Related

- **Investigate:** `aka:scout` when codebase unfamiliar
- **Ship:** `/aka:ship` after fix verified
