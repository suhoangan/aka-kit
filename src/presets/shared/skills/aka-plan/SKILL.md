---
name: aka:plan
description: 'Create implementation plans with phased docs in plans/. Use when user says plan, design architecture, roadmap, or /aka:plan. Do NOT implement code.'
argument-hint: '[task] [--fast|--hard|--parallel]'
version: 1.0.0
---

# Plan — Implementation Planning

Write plans to `./plans/` per `planning-rules.md`. **Never implement code** — planning only.

## Usage

```
/aka:plan <task description>
/aka:plan Add OAuth login --hard
/aka:plan Refactor billing module --fast
```

## Flags

| Flag         | When                       | Behavior                               |
| ------------ | -------------------------- | -------------------------------------- |
| `--fast`     | Single phase, known scope  | Skip research; scout → plan            |
| `--hard`     | Architecture, multi-system | Parallel `researcher` agents → plan    |
| `--parallel` | 3+ independent workstreams | Split into parallel phase groups       |
| (none)       | Default                    | Ask complexity → route to fast or hard |

## Pre-Creation Check

Read `## Plan Context` from hook injection:

- **Plan: {path}** → Ask: continue existing plan? [Y/n]
- **Suggested: {path}** → Inform user; offer activate or create new
- **Plan: none** → Create new using `## Naming` pattern from hooks

## Workflow

1. **Clarify** — AskUserQuestion if task ambiguous (one question at a time)
2. **Scout** — Activate `aka:scout` unless reports provided
3. **Research** — Skip in `--fast`; spawn `researcher` subagents in `--hard` / `--parallel`
4. **Plan** — Spawn `planner` subagent OR write directly:
   - Dir: `plans/{YYMMDD-HHMM}-{slug}/`
   - `plan.md` ≤80 lines: goal, scope, phases with status, links
   - `phase-XX-{slug}.md` per phase (see planning-rules.md)
   - Reports → `research/` and `reports/` subdirs
5. **Present** — Return plan path + summary; wait for approval unless `--auto`

## Output

```
✓ Plan: plans/260524-1430-auth/plan.md
  Phases: 4 (all TODO)
  Research: 2 reports
```

## Rules

- YAGNI, KISS, DRY
- Sacrifice grammar for concision in reports
- List unresolved questions at end of summary
- DO NOT create plans in user home directory
- DO NOT start implementation

## Subagents

| Phase      | Subagent                             |
| ---------- | ------------------------------------ |
| Scout      | `scout` or `aka:scout` skill         |
| Research   | `researcher` (parallel in hard mode) |
| Plan write | `planner`                            |

## Related

- **Next:** `/aka:cook plans/.../plan.md` to execute
- **Rules:** `planning-rules.md`, `documentation-management.md`
