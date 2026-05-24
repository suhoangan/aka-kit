---
title: Automate Task Template
intent: automate
triggers: script, automate, schedule, batch, pipeline, CI, workflow, generate, run, watch
---

## Automate Task — Prompt Template

Use when the user wants a script, CLI tool, scheduled job, or repeatable workflow.
Automation prompts carry the highest risk of unintended side effects — scope tightly.

### Template

```agent-prompt
[ROLE]
Script author. Write a focused automation script with no side effects beyond the
explicitly described output.

[SCOPE]
Script location: {file_path}
Runtime: {node | python | bash | deno}
Trigger: {manual_cli | cron | git_hook | CI_step}
Input: {what_the_script_receives}
Output: {what_the_script_produces}

[CONSTRAINTS]
- Dry-run mode required: script must support --dry-run flag that previews without writing
- No network calls unless listed below
- No file deletion without explicit --force flag and confirmation prompt
- No hardcoded credentials — use environment variables listed below
- Idempotent: running twice must produce same result as running once
- Allowed network targets: {list | none}
- Required env vars: {list | none}

[TASK]
{precise_description_of_what_to_automate}

Steps:
1. {step_1}
2. {step_2}
3. {step_3}

Error handling: exit with non-zero code on failure, log reason to stderr

[OUTPUT]
Write tool for {file_path}. Include shebang and chmod note if shell script.
```

---

### Example: Bad vs Good

**User says:**
> "Write a script to scan all our repos and report security issues"

**Bad prompt:**
```
Write a script that scans all our GitHub repos for security issues and sends a report.
Make it automated and send results somewhere useful.
```
Problems: "all repos" = unbounded, "somewhere useful" = undefined, no auth
handling, no rate limiting, destructive if wrong token.

**Good prompt:**
```agent-prompt
[ROLE]
Script author. CLI tool only. No side effects beyond stdout and one output file.

[SCOPE]
Script location: bin/scan-repos.ts
Runtime: node (tsx)
Trigger: manual CLI — node bin/scan-repos.ts [--dry-run]
Input: GITHUB_TOKEN env var + optional --org flag (default: reads from .env)
Output: reports/scan-{date}.json (one file per run, never overwrites)

[CONSTRAINTS]
- Dry-run mode: --dry-run prints repo list without scanning, exits 0
- No file deletion
- No email/Slack/webhook calls (out of scope)
- Max 5 concurrent API requests (rate limit safety)
- Credentials from env only: GITHUB_TOKEN
- Idempotent: re-running same date appends "-v2" suffix to avoid overwrite

[TASK]
CLI tool that:
1. Lists repos in org via GET /orgs/{org}/repos (paginated, public only)
2. For each repo, fetches .claude/ directory contents via GET /repos/{owner}/{repo}/contents/.claude
3. Runs lib/scanners/scan-orchestrator.ts scanFiles() on fetched files
4. Writes findings array to reports/scan-{YYYY-MM-DD}.json

Error handling: skip repos with 404 (no .claude/), log warning; abort on 401/403.

[OUTPUT]
Write tool for bin/scan-repos.ts. Add "tsx" to devDependencies note if not present.
```

---

### Diagnostic for Automation Prompts

- [ ] Does the script have a --dry-run mode?
- [ ] Are all file writes and network calls explicitly listed?
- [ ] Are credentials passed via env vars (not hardcoded)?
- [ ] Is the script idempotent (safe to run twice)?
- [ ] Are destructive operations (delete, overwrite) guarded by --force?
- [ ] Is the trigger (manual, cron, hook) specified?
- [ ] Is error exit behavior defined?
- [ ] Is the output location exactly specified?
