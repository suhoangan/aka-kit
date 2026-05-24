---
title: Fix Bug Template
intent: fix
triggers: fix, broken, error, not working, failing, crash, wrong, incorrect, unexpected
---

## Fix Bug — Prompt Template

Use when something is broken and the user can describe the symptom.

### Template

```agent-prompt
[ROLE]
Debugger fixing a specific, confirmed bug. No refactoring. No improvements.

[SCOPE]
File: {file_path}:{line_range}
Function/component: {name}
Symptom: {what_is_wrong_observable_behavior}
Expected: {what_should_happen}
Actual: {what_is_happening_instead}

[CONSTRAINTS]
- Fix only the identified root cause
- Do not rename, restructure, or move code
- Do not add error handling beyond what fixes the bug
- Do not add tests unless asked

[TASK]
{precise_description_of_the_fix}

Root cause hypothesis: {hypothesis_if_known | investigate_first}
Reproduction: {how_to_reproduce | see_error_message_below}

Error / Stack trace:
```
{paste_error_here}
```

[OUTPUT]
Edit tool call for the affected file(s) only. If root cause requires reading more
code first, use Read tool before editing.
```

---

### Example: Bad vs Good

**User says:**
> "The scan results page is broken, fix it"

**Bad prompt:**
```
The results page is broken. Fix it and make sure everything works properly.
```
Problems: No file path, no symptom, "everything" = unlimited scope.

**Good prompt:**
```agent-prompt
[ROLE]
Debugger. Fix only the identified bug. No improvements.

[SCOPE]
File: app/results/page.tsx
Component: ResultsPage
Symptom: Page throws "Cannot read properties of undefined (reading 'findings')"
         on mount when no scan has been run yet
Expected: Empty state UI shown when findings array is empty/undefined
Actual: Runtime crash, white screen

[CONSTRAINTS]
- Fix the null/undefined guard only
- Do not refactor the component structure
- Do not add loading states or error boundaries (not asked)

[TASK]
Add null guard for `report.findings` before accessing it.
The `report` prop comes from parent via context; it can be undefined on first render.

Error:
```
TypeError: Cannot read properties of undefined (reading 'findings')
    at ResultsPage (app/results/page.tsx:23)
```

[OUTPUT]
Edit tool call to app/results/page.tsx line 23 area only.
```

---

### Diagnostic for Bug Fix Prompts

- [ ] Is the exact file and line range of the failure known?
- [ ] Is the symptom described in observable terms (not "it's broken")?
- [ ] Is the expected vs actual behavior clearly stated?
- [ ] Is the error message or stack trace included if available?
- [ ] Is the fix constrained to the root cause only?
- [ ] Is refactoring explicitly blocked?
