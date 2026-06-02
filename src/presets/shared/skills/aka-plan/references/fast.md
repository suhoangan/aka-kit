Think.
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
Use the `planner` subagent to:
1. If creating new: create the directory `plans/{YYMMDD-HHMM}-{slug}/`. If reusing: use the active plan path. Pass the directory path to every subagent.
2. Follow strictly the "Plan Creation & Organization" rules in `planning-rules.md`.
3. Analyze the codebase by reading `docs/codebase-summary.md`, `docs/code-standards.md`, `docs/system-architecture.md`, and `docs/project-overview-pdr.md` if present. Activate `aka:scout` to find relevant files.
4. Gather all information and create an implementation plan for this task.
5. Ask the user to review the plan.

## Output Requirements

**Plan Directory Structure**
```
plans/{YYMMDD-HHMM}-{slug}/
├── reports/
│   ├── XX-report.md
│   └── ...
├── plan.md
├── phase-XX-phase-name-here.md
└── ...
```

**Plan File Specification** — every `plan.md` MUST start with YAML frontmatter:
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
