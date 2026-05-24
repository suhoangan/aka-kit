---
title: Code Review Template
intent: review
triggers: review, audit, check, analyze, assess, evaluate, security, quality
---

## Code Review — Prompt Template

Use when the user wants analysis, not implementation. The agent reads and reports —
it does NOT modify files unless explicitly asked with a separate follow-up prompt.

### Template

```agent-prompt
[ROLE]
Code reviewer. Read-only analysis. Output a structured report. Do not edit files.

[SCOPE]
Review target: {file_path | directory | PR_diff}
Review type: {security | performance | correctness | style | architecture | all}
Depth: {surface (interfaces only) | standard (logic + interfaces) | deep (all paths)}

[CONSTRAINTS]
- Do not modify any files
- Do not propose refactors beyond the review scope
- Flag only — do not auto-fix

[TASK]
Analyze {target} for {review_type} issues.

Focus areas:
- {specific_concern_1}
- {specific_concern_2}

Ignore:
- {what_to_skip — e.g., test files, generated code, style nits}

[OUTPUT]
Structured report with these sections:
## Critical — must fix before merge
## Warnings — should fix, not blocking
## Info — low priority or FYI
## Summary — risk score (1-10) and recommendation (approve / request changes)

Each finding: file:line | severity | description | suggested fix (one line)
```

---

### Example: Bad vs Good

**User says:**
> "Can you review my code?"

**Bad prompt:**
```
Please review my code and let me know if there are any issues. Make sure it's good
quality and follows best practices.
```
Problems: No target files, "best practices" = undefined, no depth guidance,
no output format, Claude will hallucinate a generic review.

**Good prompt:**
```agent-prompt
[ROLE]
Security-focused code reviewer. Read-only. No file modifications.

[SCOPE]
Review target: app/api/snyk-scan/route.ts, lib/tools/snyk-scan-tool.ts
Review type: security + correctness
Depth: deep (all code paths)

[CONSTRAINTS]
- Do not modify files
- Skip style/formatting issues
- Skip test coverage gaps (separate review)

[TASK]
Review these two files for:
- User input validation (are external inputs sanitized before use?)
- Command injection risk (any exec/spawn calls with user-controlled args?)
- Auth enforcement (are API routes protected?)
- Error leakage (do error messages expose internal paths or stack traces?)

[OUTPUT]
## Critical
## Warnings
## Info
## Summary: risk score (1-10), recommendation

Format: `file.ts:line | SEVERITY | issue description | one-line fix`
```

---

### Specializations

#### Security Audit Focus Areas
- SQL/command injection: user-controlled args in exec/query
- XSS: unsanitized output to DOM/HTML
- Auth bypass: missing middleware or role checks
- Secret exposure: env vars logged or returned in responses
- Path traversal: `../` in file operations with user input
- CSRF: state-changing GET endpoints

#### Performance Audit Focus Areas
- N+1 queries: loops with DB calls inside
- Missing indexes: queries on un-indexed columns
- Sync in async context: blocking calls in event loop
- Memory leaks: listeners/intervals without cleanup
- Over-fetching: selecting all columns when subset needed

#### Architecture Audit Focus Areas
- Circular dependencies
- Tight coupling (direct imports across domain boundaries)
- Shared mutable state
- Missing abstraction boundaries (business logic in route handlers)

---

### Diagnostic for Review Prompts

- [ ] Is the review target specified by exact file paths?
- [ ] Is the review type named (security, perf, correctness)?
- [ ] Is depth specified to avoid over-analysis?
- [ ] Are files or areas to skip explicitly listed?
- [ ] Is the output format defined (prevents free-form rambling)?
- [ ] Is modification explicitly blocked?
- [ ] Is the focus narrow enough to be actionable?
