Follow `planning-rules.md`.

## GitHub Actions URL
$ARGUMENTS

Use the `planner` subagent to read the GitHub Actions logs (via `gh run view`), analyze and find the root causes of the failures, then produce a detailed fix plan saved to `plans/{YYMMDD-HHMM}-{slug}/`.

**Plan File Specification** — every `plan.md` MUST start with YAML frontmatter:
```yaml
---
title: "{Brief title}"
description: "{One sentence for card preview}"
status: pending
priority: P1
effort: {estimated fix time}
branch: {current git branch}
tags: [ci, bugfix]
created: {YYYY-MM-DD}
---
```

**Output:** Provide at least 2 fix approaches with clear trade-offs, pros/cons of each, and a recommended approach.

**IMPORTANT:** Ask the user for confirmation before implementing.
**IMPORTANT:** Activate the skills needed for the task.
**IMPORTANT:** Sacrifice grammar for concision in outputs.
**IMPORTANT:** Do NOT start implementing — produce the plan only.
