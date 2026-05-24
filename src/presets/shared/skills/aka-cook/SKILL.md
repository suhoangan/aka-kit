---
name: aka:cook
description: "End-to-end feature implementation. Use for build/add/implement requests or /aka:cook. Activates scout→plan→code→test→review pipeline."
argument-hint: "[task or plan path] [--interactive|--fast|--auto|--no-test]"
version: 1.0.0
---

# Cook — Smart Feature Implementation

End-to-end implementation with workflow detection. Principles: YAGNI, KISS, DRY.

## Usage

```
/aka:cook Add user authentication
/aka:cook plans/260524-1430-auth/plan.md
/aka:cook Quick fix for login redirect --fast
/aka:cook Implement billing --auto
```

## Intent Detection

| Input | Mode | Pipeline |
|-------|------|----------|
| Path to `plan.md` or `phase-*.md` | code | Execute plan phases |
| "fast", "quick" | fast | scout → plan → implement (no research) |
| "auto", "trust me" | auto | All phases, no review gates |
| "no test" | no-test | Skip testing step |
| Default | interactive | Full pipeline with approval gates |

## Pipeline

```
[Detect mode] → [Research?] → [Plan?] → Implement → [Test?] → Review → Finalize
```

| Mode | Research | Plan | Tests | Review gates |
|------|----------|------|-------|--------------|
| interactive | ✓ | ✓ | ✓ | User approval between steps |
| auto | ✓ | ✓ | ✓ | Auto if review score ≥9.5, 0 critical |
| fast | ✗ | ✓ | ✓ | User approval |
| code | ✗ | ✗ | ✓ | Per plan phase |
| no-test | ✓ | ✓ | ✗ | User approval |

## Steps

1. **Scout** — `aka:scout` (skip in code mode if plan has context)
2. **Research** — `aka:research` / `researcher` subagents (skip fast/code)
3. **Plan** — `/aka:plan` or read existing plan; get approval unless auto
4. **Implement** — Follow plan phases; one phase at a time unless auto
5. **Test** — Spawn `tester` subagent; activate `aka:test`. **100% pass required**
6. **Review** — Spawn `code-reviewer`; activate `aka:code-review`
7. **Finalize** (mandatory):
   - `docs-manager` → update `./docs` if warranted
   - Mark plan phases DONE in plan files
   - Ask user about commit via `aka:commit` / `git-manager`

## Output Format

```
✓ Step 1: Scout — 12 files mapped
✓ Step 2: Plan approved — plans/.../plan.md
✓ Step 3: Implemented — 8 files changed
✓ Step 4: Tests — 42/42 passed
✓ Step 5: Review — 9.2/10, 0 critical
✓ Step 6: Finalized — docs updated
```

## Enforcement

- Steps 5–6 **must** use Task tool to spawn subagents — do not inline
- Workflow incomplete if zero Task spawns for test/review
- UI work → spawn `ui-ux-designer`
- Compile/typecheck after code changes

## Related

- **Before:** `/aka:plan` for new features
- **After:** `/aka:ship` to merge and open PR
