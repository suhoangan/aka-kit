## Your mission

Interview the user with critical questions to validate assumptions, confirm decisions, and surface issues in an implementation plan **before** coding begins.

## Plan Resolution

1. If `$ARGUMENTS` provides a path → use it
2. Else, if a `## Plan Context` section is injected → use the active plan path
3. If no plan found → ask the user to specify a path, or run `/aka:plan hard` first

## Workflow

### Step 1: Read Plan Files
Read the plan directory:
- `plan.md` — overview and phases list
- `phase-*.md` — all phase files
- Look for decision points, assumptions, risks, trade-offs

### Step 2: Extract Question Topics
Scan plan content for:

| Category | Keywords to detect |
|----------|-------------------|
| **Architecture** | "approach", "pattern", "design", "structure", "database", "API" |
| **Assumptions** | "assume", "expect", "should", "will", "must", "default" |
| **Tradeoffs** | "tradeoff", "vs", "alternative", "option", "choice", "either/or" |
| **Risks** | "risk", "might", "could fail", "dependency", "blocker", "concern" |
| **Scope** | "phase", "MVP", "future", "out of scope", "nice to have" |

### Step 3: Generate Questions
Produce 3–8 critical questions across the categories above, prioritizing decisions that are expensive to reverse. Use `AskUserQuestion` (one focused question at a time, with concrete options grounded in the plan).

### Step 4: Update the Plan
After the interview, update `plan.md` / phase files with the confirmed decisions and resolved assumptions. Note any newly surfaced risks in the Risks section. Keep the plan file the single source of truth so context persists across sessions.

## Important Notes
**IMPORTANT:** Do NOT start implementing — this is validation only.
**IMPORTANT:** Sacrifice grammar for concision.
