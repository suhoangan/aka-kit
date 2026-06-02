Think strategically about parallelization.
Follow `planning-rules.md`.

## Your mission
<task>
$ARGUMENTS
</task>

## Workflow
1. Create the directory `plans/{YYMMDD-HHMM}-{slug}/`. Pass the directory path to every subagent.
2. Follow strictly the "Plan Creation & Organization" rules in `planning-rules.md`.
3. Use multiple `researcher` agents (max 2) in parallel — each researches a different aspect, max 5 tool calls each. Save reports to the plan's `research/` subdir.
4. Analyze the codebase by reading `docs/codebase-summary.md`, `docs/code-standards.md`, `docs/system-architecture.md`, and `docs/project-overview-pdr.md` if present.
   **ONLY if `docs/codebase-summary.md` is missing or older than 3 days:** activate `aka:scout`.
5. Gather all research + scout report filepaths and pass them to the `planner` subagent to create a parallel-optimized implementation plan.
6. Receive the plan and ask the user to review it.

## Post-Plan Validation (Optional)
- `AskUserQuestion`: "Validate this plan with a brief interview?" → Yes (Recommended) / No
- If Yes → execute `/aka:plan validate {plan-path}`.

## Special Requirements for Parallel Execution

**CRITICAL:** The `planner` subagent must create phases that:
1. **Execute independently** — each phase self-contained, no runtime dependency on other phases
2. **Have clear boundaries** — no file overlap (each file modified in ONE phase only)
3. **Separate concerns logically** — group by architectural layer, feature domain, or technology stack

Include a **file-ownership matrix** in `plan.md` mapping each phase to the files it exclusively owns, so parallel `fullstack-developer` agents never collide.

## Plan File Specification — every `plan.md` MUST start with YAML frontmatter:
```yaml
---
title: "{Brief title}"
description: "{One sentence for card preview}"
status: pending
priority: P2
effort: {sum of phases}
branch: {current git branch}
tags: [relevant, tags]
created: {YYYY-MM-DD}
---
```

## Important Notes
**IMPORTANT:** Activate the skills needed for the task.
**IMPORTANT:** Sacrifice grammar for concision in reports.
**IMPORTANT:** List any unresolved questions at the end.
**IMPORTANT:** Do NOT start implementing.
