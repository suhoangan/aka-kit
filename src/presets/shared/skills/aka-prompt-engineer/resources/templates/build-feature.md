---
title: Build Feature Template
intent: build
triggers: build, create, add, implement, integrate
---

## Build Feature — Prompt Template

Use when the user wants to add new functionality to an existing codebase.

### Template

```agent-prompt
[ROLE]
Fullstack developer implementing a scoped feature in an existing codebase.

[SCOPE]
Feature: {feature_name}
Entry point: {file_path}:{line_range}
Touches: {list_of_files_to_modify}
Do NOT create: {list_of_files_to_avoid_creating}

[CONSTRAINTS]
- Modify only the listed files
- Match existing code style in {reference_file}
- No new dependencies unless listed below
- No tests unless explicitly requested
- No refactoring of surrounding code
- Allowed new deps: {dep_list | none}

[TASK]
{precise_description_of_what_to_implement}

Accept: {input_type_or_interface}
Return: {output_type_or_interface}

[OUTPUT]
Inline edits to the listed files using Edit tool.
```

---

### Example: Bad vs Good

**User says:**
> "Add a dark mode toggle to the app"

**Bad prompt (scope leak + no anchors):**
```
Add a dark mode toggle. Update the theme, add a button somewhere in the navbar,
persist the preference, and make sure it works everywhere.
```
Problems: "somewhere", "everywhere", no file paths, creates new state management
implicitly, open-ended scope.

**Good prompt:**
```agent-prompt
[ROLE]
Frontend developer adding a focused UI feature.

[SCOPE]
Feature: Dark mode toggle button
Entry point: components/Navbar.tsx:34-67
Touches: components/Navbar.tsx, lib/theme.ts
Do NOT create: new context files, new hooks files, new CSS files

[CONSTRAINTS]
- State lives in localStorage only (no new context/provider)
- Use existing ThemeProvider already in app/layout.tsx
- Button style must match existing <IconButton> components in Navbar.tsx
- No new npm packages

[TASK]
Add a toggle button to the right side of the Navbar that:
1. Reads initial value from localStorage key "theme" (default: "light")
2. Calls `document.documentElement.setAttribute("data-theme", value)` on change
3. Writes updated value back to localStorage

[OUTPUT]
Edit tool calls for Navbar.tsx and lib/theme.ts only.
```

---

### Diagnostic for Build Prompts

- [ ] Is the entry point file + line specified?
- [ ] Are all files to be modified listed explicitly?
- [ ] Are new file creations blocked unless required?
- [ ] Is the input/output interface or type defined?
- [ ] Are new dependencies approved or blocked?
- [ ] Is state management scope bounded?
