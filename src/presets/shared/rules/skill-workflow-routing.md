# Skill Workflow Routing

When orchestrating multi-step tasks, activate **aka:** skills (see `docs/skill-catalog.md`) or slash commands (see `docs/agentic-flows.md`).

## Primary slash flows

| Goal                             | Start with                      |
| -------------------------------- | ------------------------------- |
| New greenfield project           | `/aka:bootstrap`                |
| Plan only (no code)              | `/aka:plan`                     |
| Implement feature / execute plan | `/aka:cook`                     |
| Fix bug / CI / tests             | `/aka:fix`                      |
| Open PR / ship branch            | `/aka:ship`                     |
| Verify install / environment     | `/aka:check` or `aka-kit doctor` |

## Core Development Workflow

```
/aka:plan → /aka:cook → /aka:ship
     ↓           ↓
planning-rules  aka:test → aka:code-review → aka:commit
```

| User Intent                               | Suggested Start                             |
| ----------------------------------------- | ------------------------------------------- |
| "implement feature X", "build X", "add X" | `/aka:cook` or `/aka:plan` then `/aka:cook` |
| "execute this plan"                       | `/aka:cook plans/.../plan.md`               |
| "commit" / "push" / "PR"                  | `/aka:ship` or `aka:commit` / `aka:git`     |
| "bootstrap", "new project"                | `/aka:bootstrap`                            |

## Bugfix Workflow

```
/aka:fix  (aka:scout → aka:debug → fix → aka:test → aka:code-review)
```

| User Intent                             | Suggested Start                                         |
| --------------------------------------- | ------------------------------------------------------- |
| "X is broken", "error in X", "bug in X" | `/aka:fix` or `aka:debug` (+ `aka:scout` if unfamiliar) |
| "CI is failing", "tests broken"         | `/aka:fix --quick`                                      |
| "investigate why X happens"             | `aka:scout` then `/aka:fix`                             |

## Investigation Workflow

```
aka:scout → aka:research → /aka:plan
```

| User Intent              | Suggested Start          |
| ------------------------ | ------------------------ |
| "understand how X works" | `aka:scout`              |
| "why is X happening"     | `aka:debug`              |
| "explore options for X"  | `aka:research` then plan |

## Post-Implementation Checklist

After completing implementation work:

- `aka:code-review` — review changes before merging
- `aka:test` — verify tests pass
- `/aka:ship` — merge, push, PR

## Setup (before non-trivial work)

- `aka:graph-init` — bootstrap code-review-graph (auto-run on `aka-kit install`)
- `aka:scout` — discover relevant files and patterns
- `aka:sequential-thinking` — complex multi-step reasoning with revision
- `/aka:check` — confirm environment after install

## Health Check

- `/aka:check` — skill wrapper for `aka-kit doctor`
- `aka-kit doctor` — CLI direct (same checks)
