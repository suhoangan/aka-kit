# Subagent Patterns

Standard patterns for spawning and using subagents in cook workflows.

## Task Tool Pattern
```
Task(subagent_type="[type]", prompt="[task description]", description="[brief]")
```

Allowed subagent types (aka-kit): `researcher`, `scout`, `planner`, `tester`, `debugger`, `code-reviewer`, `docs-manager`, `git-manager`, `project-manager`, `ui-ux-designer`, `fullstack-developer`, `code-simplifier`.

## Research Phase
```
Task(subagent_type="researcher", prompt="Research [topic]. Report ≤150 lines.", description="Research [topic]")
```
- Use multiple researchers in parallel for different topics; reports ≤150 lines with citations.

## Scout Phase
```
Task(subagent_type="scout", prompt="Find files related to [feature] in codebase", description="Scout [feature]")
```
- Prefer the `aka:scout` skill; fall back to the `scout` agent.

## Planning Phase
```
Task(subagent_type="planner", prompt="Create implementation plan based on reports: [reports]. Save to [path]", description="Plan [feature]")
```
- Input: researcher and scout reports. Output: `plan.md` + `phase-XX-*.md`.

## UI Implementation
```
Task(subagent_type="ui-ux-designer", prompt="Implement [feature] UI per ./docs/design-guidelines.md", description="UI [feature]")
```

## Testing
```
Task(subagent_type="tester", prompt="Run test suite for plan phase [phase-name]", description="Test [phase]")
```
- Must achieve 100% pass rate.

## Debugging
```
Task(subagent_type="debugger", prompt="Analyze failures: [details]", description="Debug [issue]")
```
- Use when tests fail; provides root-cause analysis.

## Code Review
```
Task(subagent_type="code-reviewer",
     prompt="Review changes for [phase] against these MANDATORY checks: (a) every acceptance criterion met; (b) no regression to business logic in touchpoints/blast-radius from scout; (c) no breaking changes to public contracts (signatures, schemas, APIs, env vars) unless explicitly called out; (d) follows existing patterns from scout; (e) no new lint/type/build errors anywhere. CONTEXT — scout summary: <scout-summary>; acceptance criteria: <acceptance-criteria>. Return score (X/10), critical, warnings, suggestions, and explicitly flag any side effects to trigger HARD-GATE-NO-SIDE-EFFECTS.",
     description="Review [phase]")
```
- Score is advisory; any evidenced critical issue blocks.

## Adversarial Validation
```
Task(subagent_type="code-reviewer",
     prompt="Adversarial validation for [phase]. Disprove implementation claims only. Check acceptance coverage, regression reachability, public contracts, and verification proof. Forbidden: style polish and broad rewrite suggestions. Return: decision, disprovenClaims[], unverifiedClaims[], missingProof[], reachableRegressions[].",
     description="Adversarial validate [phase]")
```
- Trigger for `--auto`, high-risk surfaces, large diffs, and ship/push/PR/deploy. Do not average reviewers — any evidenced critical issue blocks.

## Domain-Risk Review
```
Task(subagent_type="code-reviewer",
     prompt="Domain-risk review for [auth|secrets|payments|db|api|deploy|filesystem|production-config]. Return risks and blocking findings only, tied to file/line evidence.",
     description="Domain-risk review")
```
- Trigger only when touched files affect the named domain.

## Conditional Simplify
```
Task(subagent_type="code-simplifier", prompt="Simplify these files while preserving behavior exactly: [file-list]", description="Simplify recent edits")
```
- Trigger when the live `git diff --numstat HEAD --ignore-all-space` breaches any threshold (defaults: 400 LOC / 8 files / 200 single-file LOC).
- Scope the prompt to `git diff --name-only HEAD`.
- Verify with `git diff --shortstat HEAD -- [file-list]` before/after; do not rely on the agent's prose summary.

## Project Management (Finalize sync-back)
```
Task(subagent_type="project-manager",
     prompt="Run full sync-back in [plan-path]: reconcile completed tasks with all phase files, backfill stale completed checkboxes across all phases, update plan.md status/progress, and report unresolved mappings.",
     description="Plan sync-back")
```

## Documentation
```
Task(subagent_type="docs-manager", prompt="Update docs for [phase]. Changed files: [list]", description="Update docs")
```

## Git Operations
```
Task(subagent_type="git-manager", prompt="Stage and commit changes with conventional commit message", description="Commit changes")
```
- Or activate the `aka:commit` skill for an interactive commit.

## Parallel Execution
```
Task(subagent_type="fullstack-developer", prompt="Implement [phase-file] with file ownership: [files]", description="Implement phase [N]")
```
- Launch multiple for parallel phases; include file-ownership boundaries.
