---
title: Refactor Code Template
intent: refactor
triggers: refactor, clean up, simplify, restructure, split, extract, reorganize, deduplicate
---

## Refactor Code — Prompt Template

Use when behavior must be preserved but structure improved. The hardest prompt type
to scope — always prefer the smallest possible change.

### Template

```agent-prompt
[ROLE]
Refactoring engineer. Behavior is frozen. Structure changes only.

[SCOPE]
Target: {file_path}:{line_range}
Refactor type: {extract_function | split_file | rename | simplify | deduplicate}
Behavior contract: all inputs/outputs remain identical

[CONSTRAINTS]
- No behavior changes — same inputs must produce same outputs
- No new external dependencies
- Do not modify callers unless import paths change (and list all callers below)
- Tests must still pass after refactor (do not modify test assertions)
- File size limit: {max_lines} lines per file

Known callers:
{list_of_files_that_import_target}

[TASK]
{precise_description_of_structural_change}

Before (structure):
{describe_current_structure}

After (structure):
{describe_target_structure}

[OUTPUT]
Edit tool calls for all affected files. If splitting a file, use Write for new file
and Edit to update imports in callers.
```

---

### Example: Bad vs Good

**User says:**
> "The scanner file is getting too big, clean it up"

**Bad prompt:**
```
The scanner file is too big. Clean it up, improve the code quality, and make it
more maintainable. Feel free to reorganize as needed.
```
Problems: "clean it up" is undefined, "feel free" = unlimited scope, no callers
listed, behavior contract not stated.

**Good prompt:**
```agent-prompt
[ROLE]
Refactoring engineer. Behavior is frozen. Structure changes only.

[SCOPE]
Target: lib/scanners/scan-orchestrator.ts (currently 340 lines)
Refactor type: extract_function + split_file
Behavior contract: scanDirectory() and scanFiles() return identical results

[CONSTRAINTS]
- Do not change function signatures or return types
- Do not add/remove scanner logic
- Do not modify test files
- Each output file must be under 200 lines
- No new npm packages

Known callers:
- app/api/snyk-scan/route.ts (imports scanDirectory)
- lib/tools/snyk-scan-tool.ts (imports scanFiles)

[TASK]
Split scan-orchestrator.ts into three files:
1. lib/scanners/scan-orchestrator.ts — orchestration logic only (dispatch + aggregate)
2. lib/scanners/scan-runner.ts — runRegexRules() and file dispatch helpers
3. lib/scanners/scan-scorer.ts — calculateRiskScore() and severity sorting

Update import paths in the two known callers.

[OUTPUT]
Write tool for scan-runner.ts and scan-scorer.ts (new files).
Edit tool for scan-orchestrator.ts (trimmed) and both callers.
```

---

### Diagnostic for Refactor Prompts

- [ ] Is the behavior contract explicitly frozen?
- [ ] Is the exact target file and line range specified?
- [ ] Are all callers/importers of the target listed?
- [ ] Is the refactor type named (extract, split, rename, deduplicate)?
- [ ] Is file size or line limit defined if splitting?
- [ ] Are test files explicitly protected from modification?
- [ ] Would a reviewer be able to verify behavior is unchanged?
