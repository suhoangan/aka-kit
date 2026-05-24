---
name: aka:bootstrap
description: 'Interactive new-project bootstrap: requirements → stack → aka-kit preset → plan → implement. Use for greenfield projects or /aka:bootstrap.'
argument-hint: '[requirements]'
version: 1.0.0
---

# Bootstrap — New Project Init

Step-by-step greenfield setup. YAGNI, KISS, DRY.

## Usage

```
/aka:bootstrap SaaS dashboard for team analytics
/aka:bootstrap
```

## Workflow

### 0. Git check

If no git repo → ask user; initialize via `git-manager` if yes.

### 1. Requirements

- AskUserQuestion: one question at a time until scope clear
- Clarify constraints, users, timeline, deployment target

### 2. Research

- Parallel `researcher` subagents for stack options, risks
- Reports ≤150 lines → `plans/.../research/`

### 3. Tech stack

- If user provided stack → document in `./docs`
- Else: planner + researchers → present 2–3 options with pros/cons
- User approval required before proceeding

### 4. Install preset

Run aka-kit for chosen stack (from project root or target dir):

| Stack              | Command                             |
| ------------------ | ----------------------------------- |
| Next.js full-stack | `aka-kit install --fullstack-nextjs` |
| Next.js frontend   | `aka-kit install --nextjs`           |
| Node backend       | `aka-kit install --node-backend`     |
| PHP                | `aka-kit install --php`              |
| HubSpot            | `aka-kit install --hubspot`          |
| Rules/hooks only   | `aka-kit install --global`           |

Add `--platform cursor|claude|codex|all` per user IDE. Use `--dry-run` first if uncertain.

### 5. Plan

- `/aka:plan` with approved stack and requirements
- User must approve plan before implementation

### 6. Design (optional)

Ask user if wireframes needed. If yes → `ui-ux-designer` → `./docs/design-guidelines.md`

### 7. Implement

- `/aka:cook plans/.../plan.md` or phase-by-phase
- Compile/typecheck after each phase

### 8. Test & review

- `tester` + `aka:test`
- `code-reviewer` + `aka:code-review`

### 9. Docs & onboarding

- `aka:docs` — codebase-summary, architecture, PDR
- Guide user through env setup (`.env.example`, MCP keys)
- Suggest `/aka:check` to verify install

### 10. Final report

Summary, next steps, offer commit via `aka:commit`

## Rules

- Do NOT implement before plan approval
- Do NOT skip aka-kit install for greenfield (skills/rules/hooks)
- Sacrifice grammar for concision

## Related

- **Health:** `/aka:check` after install
- **Execute plan:** `/aka:cook`
