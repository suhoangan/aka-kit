Think harder.
Follow `planning-rules.md`.

## Your mission
<task>
$ARGUMENTS
</task>

## Pre-Creation Check (Active vs Suggested Plan)

If a `## Plan Context` section is injected:
- Active plan path → Ask: "Continue with this plan? [Y/n]"
- Suggested path → Ask if they want to activate it or create new.
- None / not injected → Create a new plan using the literal pattern `plans/{YYMMDD-HHMM}-{slug}/`.

## Workflow
1. If creating new: create the directory `plans/{YYMMDD-HHMM}-{slug}/`. If reusing: use the active plan path. Pass the directory path to every subagent.
2. Follow strictly the "Plan Creation & Organization" rules in `planning-rules.md`.
3. Use multiple `researcher` agents (max 2) in parallel — each researches a different aspect of the task, max 5 tool calls each. Save reports to `plans/{YYMMDD-HHMM}-{slug}/research/`.
4. Analyze the codebase by reading `docs/codebase-summary.md`, `docs/code-standards.md`, `docs/system-architecture.md`, and `docs/project-overview-pdr.md` if present.
   **ONLY if `docs/codebase-summary.md` is missing or older than 3 days:** activate `aka:scout` to search the codebase for files needed for the task.
5. Gather all research + scout report filepaths and pass them to the `planner` subagent to create the implementation plan.
6. Receive the plan from `planner` and ask the user to review it.

## Post-Plan Validation (Optional)

After plan creation, offer a validation interview to confirm decisions before implementation:
- `AskUserQuestion`: "Validate this plan with a brief interview?" → Yes (Recommended) / No
- If Yes → execute `/aka:plan validate {plan-path}`.

## Plan File Specification — every `plan.md` MUST start with YAML frontmatter:
```yaml
---
title: "{Brief title}"
description: "{One sentence for card preview}"
status: pending
priority: P2
effort: {sum of phases, e.g., 4h}
branch: {current git branch}
tags: [relevant, tags]
created: {YYYY-MM-DD}
---
```

## Important Notes
**IMPORTANT:** Activate the skills needed for the task during the process.
**IMPORTANT:** Sacrifice grammar for concision in reports.
**IMPORTANT:** Ensure token efficiency while maintaining high quality.
**IMPORTANT:** List any unresolved questions at the end.
**IMPORTANT:** Do NOT start implementing.
