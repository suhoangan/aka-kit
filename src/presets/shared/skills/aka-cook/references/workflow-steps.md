# Unified Workflow Steps

All modes share core steps with mode-specific variations.

**Task Tool Fallback:** `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` are CLI-only — unavailable in some IDE extensions. If they error, use `TodoWrite` for progress tracking. All steps remain functional without Task tools.

## Step 0: Intent Detection & Setup

1. Parse input with `intent-detection.md` rules
2. Log detected mode: `✓ Step 0: Mode [X] — [reason]`
3. If mode=code: detect plan path, set active plan
4. Use `TaskCreate` to create workflow step tasks (with dependencies if complex)

**Output:** `✓ Step 0: Mode [interactive|auto|fast|parallel|no-test|code] — [detection reason]`

## Step 1: Research (skip if fast/code mode)

**Interactive/Auto:**
- Spawn multiple `researcher` agents in parallel
- Use `aka:scout` skill or `scout` agent for codebase search
- Keep reports ≤150 lines

**Parallel:** Optional — max 2 researchers if complex.

**Output:** `✓ Step 1: Research complete — [N] reports gathered`

### [Review Gate 1] Post-Research (skip if auto mode)
- Present research summary
- `AskUserQuestion`: "Proceed to planning?" / "Request more research" / "Abort"

## Step 2: Planning

**Interactive/Auto/No-test:** Use `planner` agent with research context → `plan.md` + `phase-XX-*.md`.
**Fast:** `/aka:plan fast` with scout results only — minimal planning, focus on action.
**Parallel:** `/aka:plan parallel` for dependency graph + file-ownership matrix.
**Code:** Skip — plan already exists; parse existing plan for phases.

**Output:** `✓ Step 2: Plan created — [N] phases`

### [Review Gate 2] Post-Plan (skip if auto mode)
- Present plan overview with phases
- `AskUserQuestion`: "Validate the plan or approve to start implementation?" — "Validate" / "Approve" / "Abort" / "Other (request revisions)"
  - "Validate" → run `/aka:plan validate`
  - "Approve" → continue to implementation
  - "Abort" → stop
  - "Other" → revise plan per user feedback

## Step 3: Implementation

**IMPORTANT:**
1. `TaskList` first — check for existing tasks (hydrated by the plan skill in the same session)
2. If tasks exist → pick them up, skip re-creation
3. If no tasks → read plan phases, `TaskCreate` for each unchecked `[ ]` item with priority order and metadata (`phase`, `planDir`, `phaseFile`)
4. Tasks can be blocked via `addBlockedBy`

### Conformance Checklist (before writing code)

Before implementing each phase, the developer agent MUST:
1. **Read `./docs/code-standards.md`** and confirm naming, file structure, and error-handling patterns still match the repo.
2. **Scout adjacent code patterns** in the files being modified; follow the same import, logging, and error-wrapping style.
3. **Check for existing helpers** before creating new utilities (stay DRY).
4. **Verify interface contracts** so new code extends the current surface instead of creating a parallel one.
5. **Cross-check the plan checklist** so every file in the phase inventory is addressed.

After each file is modified:
- **Compile check:** run the relevant compile/type-check command
- **Pattern verify:** confirm new code matches adjacent conventions
- **Import check:** confirm no circular dependency or dead import added

### `--tdd` Flag Behavior

When `--tdd` is active, Step 3 splits into sub-steps per phase:

```
Step 3.T: Write tests for CURRENT behavior (regression safety net)
Step 3.I: Implement changes (refactor, new code)
Step 3.V: Verify all tests from 3.T still pass + compile gates
```

Tests from Step 3.T document current behavior. If any fail after Step 3.I, the refactor broke something and must be fixed before proceeding.

**All modes:**
- `TaskUpdate` to mark tasks `in_progress` immediately
- Execute phase tasks sequentially (Step 3.1, 3.2, …)
- Use `ui-ux-designer` for frontend
- Run type checking after each file

**Parallel mode:**
- Use all Claude Task tools (`TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`)
- Launch multiple `fullstack-developer` agents
- When an agent picks up a task, `TaskUpdate` to assign + mark `in_progress`
- Respect file-ownership boundaries; wait for the parallel group before the next

**Output:** `✓ Step 3: Implemented [N] files — [X/Y] tasks complete`

### Step 3.S: Conditional Simplify (live-diff gated)

Recompute signals from the live worktree (no hook state):

```bash
totals=$(git diff --numstat HEAD --ignore-all-space)
loc=$(echo "$totals" | awk '{s+=$1+$2} END {print s+0}')
files=$(echo "$totals" | awk 'NF{c++} END {print c+0}')
maxFile=$(echo "$totals" | awk 'BEGIN{m=0} {if ($1>m) m=$1} END {print m+0}')
modified=$(git diff --name-only HEAD)
```

Default thresholds: **400 LOC delta**, **8 files**, **200 single-file LOC**. If any is breached, spawn the simplifier scoped to the modified files:

```
Task(subagent_type="code-simplifier", prompt="Simplify these files while preserving behavior exactly: [file-list]", description="Simplify recent edits")
```

After the subagent returns, log only — never re-run or block:
- `git diff --shortstat HEAD -- [file-list]` changed → "simplifier made scoped edits"
- unchanged → "simplifier ran clean"

**Output:** `✓ Step 3.S: Simplify [ran|skipped] — [scoped changes|clean|under threshold]`

### [Review Gate 3] Post-Implementation (skip if auto mode)
- Present implementation summary (files changed, key changes)
- `AskUserQuestion`: "Proceed to testing?" / "Request implementation changes" / "Abort"

## Step 4: Testing (skip if no-test mode)

**All modes (except no-test):**
- Write tests: happy path, edge cases, errors
- **MUST** spawn `tester` subagent: `Task(subagent_type="tester", prompt="Run test suite", description="Run tests")`
- If failures: **MUST** spawn `debugger` subagent → fix → repeat
- **Forbidden:** fake mocks, commented tests, changed assertions, skipping subagent delegation

**Output:** `✓ Step 4: Tests [X/X passed] — tester subagent invoked`

### [Review Gate 4] Post-Testing (skip if auto mode)
- Present test results summary
- `AskUserQuestion`: "Proceed to code review?" / "Request test fixes" / "Abort"

## Step 5: Code Review

**All modes — MANDATORY subagent:**
- **MUST** spawn `code-reviewer` subagent with explicit (a–e) checks and scout/acceptance context:
  ```
  Task(subagent_type="code-reviewer",
       prompt="Review changes against these MANDATORY checks: (a) every acceptance criterion met; (b) no regression to business logic in touchpoints/blast-radius from scout; (c) no breaking changes to public contracts (signatures, schemas, APIs, env vars) unless explicitly called out; (d) follows existing patterns from scout; (e) no new lint/type/build errors anywhere. CONTEXT — scout summary: <scout-summary>; acceptance criteria: <acceptance-criteria>. Return score (X/10), critical, warnings, suggestions, and explicitly flag any side effects to trigger HARD-GATE-NO-SIDE-EFFECTS.",
       description="Code review")
  ```
- **DO NOT** review code yourself — delegate to the subagent

**Interactive/Parallel/Code/No-test:** Interactive cycle (max 3) — see `review-cycle.md`. Requires user approval.
**Auto:** Auto-approve only if review decision is PASS and no high-risk stop. Auto-fix critical (max 3 cycles). Escalate to user after 3 failed cycles.
**Fast:** Simplified review, no fix loop — user approves or aborts.

**Output:** `✓ Step 5: Review [score]/10 — [Approved|Auto-approved] — code-reviewer subagent invoked`

For high-risk `--auto`, stop with `AskUserQuestion` before finalize/commit/ship unless the user has approved the risk.

## Step 6: Finalize

**All modes — MANDATORY subagents (NON-NEGOTIABLE):**
1. **MUST** spawn `project-manager` subagent — full sync-back for `[plan-path]`: reconcile all completed Claude Tasks with all phase files, backfill stale completed checkboxes across every phase, then update `plan.md` status/progress. Do NOT only mark the current phase.
2. **MUST** spawn `docs-manager`: `Task(subagent_type="docs-manager", prompt="Update docs for changes.", description="Update docs")`
3. Project-manager sync-back MUST:
   - Sweep all `phase-XX-*.md` files in the plan directory
   - Mark every completed item `[ ] → [x]` based on completed tasks (including earlier phases)
   - Update `plan.md` status/progress (`pending`/`in-progress`/`completed`) from actual checkbox state — edit `plan.md` directly, changing only the Status cell and preserving table structure
   - Return unresolved mappings if any completed task cannot be matched to a phase file
4. `TaskUpdate` to mark Claude Tasks complete after sync-back confirmation
5. Onboarding check (API keys, env vars)
6. **MUST** ask user about commit, then spawn `git-manager`: `Task(subagent_type="git-manager", prompt="Stage and commit changes", description="Commit")` (or activate `aka:commit`)

**CRITICAL:** Step 6 is INCOMPLETE without spawning `project-manager` + `docs-manager` + `git-manager` subagents. DO NOT skip.

**Auto mode:** Continue to next phase automatically, starting from **Step 3**.
**Others:** Ask user before next phase.

**Output:** `✓ Step 6: Finalized — 3 subagents invoked — full-plan sync-back complete — committed`

## Mode-Specific Flow Summary

Legend: `[R]` = Review Gate (human approval required)

```
interactive: 0 → 1 → [R] → 2 → [R] → 3 → [R] → 4 → [R] → 5(user) → 6
auto:        0 → 1 → 2 → 3 → 4 → 5(auto, low-risk) → 6 → next phase (stops on high risk)
fast:        0 → skip → 2(fast) → [R] → 3 → [R] → 4 → [R] → 5(simple) → 6
parallel:    0 → 1? → [R] → 2(parallel) → [R] → 3(multi-agent) → [R] → 4 → [R] → 5(user) → 6
no-test:     0 → 1 → [R] → 2 → [R] → 3 → [R] → skip → 5(user) → 6
code:        0 → skip → skip → 3 → [R] → 4 → [R] → 5(user) → 6
```

## Critical Rules

- Never skip steps without mode justification
- **MANDATORY DELEGATION:** Steps 4, 5, 6 MUST delegate via Task tool. DO NOT implement directly.
  - Step 4: `tester` (and `debugger` if failures)
  - Step 5: `code-reviewer`
  - Step 6: `project-manager`, `docs-manager`, `git-manager`
- Use `TaskCreate` for each unchecked item with priority order and dependencies (or `TodoWrite` if Task tools unavailable)
- `TaskUpdate` to mark tasks `in_progress` when picking up, `complete` immediately after finalizing
- All step outputs follow: `✓ Step [N]: [status] — [metrics]`
- **VALIDATION:** If Task tool calls = 0 at end of workflow, the workflow is INCOMPLETE.
