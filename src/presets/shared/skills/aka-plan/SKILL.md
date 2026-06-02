---
name: aka:plan
description: 'Create implementation plans with phased docs in plans/. Use when user says plan, design architecture, roadmap, or /aka:plan. Do NOT implement code.'
argument-hint: '[fast|hard|parallel|two|validate|ci|cro|archive] [task]'
version: 2.0.0
---

# Plan — Implementation Planning

Write plans to `./plans/` per `planning-rules.md`. **Never implement code** — planning only.

## Usage

```
/aka:plan <task description>          # default: ask complexity → route to fast or hard
/aka:plan hard Add OAuth login        # research-backed plan
/aka:plan fast Refactor billing       # no research, scout → plan
/aka:plan validate plans/.../plan.md  # critical-question interview
```

Subcommands may also be given as flags: `--fast`, `--hard`, `--parallel`.

## Pre-Creation Check

If a `## Plan Context` section is injected (active/suggested plan), honor it:

- **Active plan path** → Ask: "Continue with this plan? [Y/n]"
- **Suggested path** → Inform user; offer to activate or create new
- **None / not injected** → Create new using the literal naming pattern `plans/{YYMMDD-HHMM}-{slug}/`

## Subcommands

| Subcommand | Description | Reference |
|------------|-------------|-----------|
| `fast` | No research. Scout → analyze → create plan | `references/fast.md` |
| `hard` | Research (parallel) → analyze → create plan | `references/hard.md` |
| `parallel` | Plan with parallel-executable, file-isolated phases | `references/parallel.md` |
| `two` | Research → create 2 approaches with trade-offs | `references/two.md` |
| `validate` | Validate an existing plan via critical-question interview | `references/validate.md` |
| `ci` | Analyze GitHub Actions logs → plan the fix | `references/ci.md` |
| `cro` | Conversion-rate-optimization plan for given content | `references/cro.md` |
| `archive` | Summarize + archive plans (journal entries to `./docs/journal/`) | `references/archive.md` |

## Routing

1. Parse subcommand from `$ARGUMENTS` (first word) or flag (`--fast` → `fast`, etc.)
2. If no subcommand: analyze the task; `AskUserQuestion` for complexity if ambiguous; route to `fast` or `hard`
3. Load the corresponding `references/{subcommand}.md` and execute with the remaining arguments

## Workflow (default)

1. **Clarify** — `AskUserQuestion` if task ambiguous (one question at a time)
2. **Scout** — Activate `aka:scout` unless reports provided
3. **Research** — Skip in `fast`; spawn `researcher` subagents in `hard` / `parallel`
4. **Plan** — Spawn `planner` subagent OR write directly:
   - Dir: `plans/{YYMMDD-HHMM}-{slug}/`
   - `plan.md` ≤80 lines: goal, scope, phases with status, links
   - `phase-XX-{slug}.md` per phase (see `planning-rules.md`)
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
- DO NOT create plans in the user home directory
- DO NOT start implementation

## Subagents

| Phase | Subagent |
|-------|----------|
| Scout | `scout` or `aka:scout` skill |
| Research | `researcher` (parallel in hard/parallel mode) |
| Plan write | `planner` |

## Related

- **Next:** `/aka:cook plans/.../plan.md` to execute
- **Rules:** `planning-rules.md`, `documentation-management.md`
