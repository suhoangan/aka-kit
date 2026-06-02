Think harder.
Follow `planning-rules.md`.

## Your mission
Use the `planner` subagent to create **2 detailed implementation plans** for this task:
<task>
$ARGUMENTS
</task>

## Workflow
1. Create the directory `plans/{YYMMDD-HHMM}-{slug}/`. Pass the directory path to every subagent.
2. Follow strictly the "Plan Creation & Organization" rules in `planning-rules.md`.
3. Use multiple `researcher` agents in parallel — each researches a different aspect, max 5 tool calls each. Save reports to the plan's `research/` subdir.
4. Activate `aka:scout` to find the files needed for the task.
5. Gather all research + scout report filepaths and pass them to the `planner` subagent with detailed instructions to create the plan.
   **Output:** At least 2 implementation approaches with clear trade-offs — explain pros/cons of each and give a recommended approach.
6. Receive the plans and ask the user to review them.

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
**IMPORTANT:** Ensure token efficiency while maintaining high quality.
**IMPORTANT:** List any unresolved questions at the end.
**IMPORTANT:** Do NOT start implementing.
