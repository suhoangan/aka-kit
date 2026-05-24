# Planning Rules

**IRON RULE:** Whenever you plan — feature, refactor, bugfix, migration, infra change — you **MUST** write the plan to a markdown file before implementing. No exceptions. No "I'll just keep it in my head."

## Why

- The user can review and redirect before code is written
- The plan persists across sessions and compactions
- Sub-agents (planner, fullstack-developer, tester) work from the file, not from chat scrollback
- A written plan forces concrete thinking — vague plans get rewritten, not committed

## Where

Plans go under `./plans/` using the naming pattern injected by hooks:

```
plans/{YYMMDD-HHMM}-{descriptive-kebab-slug}/
├── plan.md                          # Overview (≤80 lines) — required
├── phase-01-{slug}.md               # Phase details — one file per phase
├── phase-02-{slug}.md
├── research/                        # Researcher agent outputs
│   └── researcher-XX-report.md
└── reports/                         # Scout / reviewer / debugger / tester reports
    └── ...
```

For trivial single-step changes (< ~15 LOC, no architectural impact), a single `plan.md` is enough — phase files optional.

## Required content of `plan.md`

1. **Goal** — one sentence: what success looks like
2. **Why** — the motivation / triggering request
3. **Scope** — what's IN and what's OUT
4. **Phases** — bulleted list with status (TODO / IN PROGRESS / DONE)
5. **Dependencies** — files, services, agents, packages affected
6. **Risks & open questions** — at the bottom, even if empty

## Required content of `phase-XX-*.md`

- **Context Links** — related reports, files, docs
- **Overview** — priority, current status, brief description
- **Key Insights** — important findings from research
- **Requirements** — functional + non-functional
- **Architecture** — system design, component interactions, data flow
- **Related Code Files** — to modify / create / delete
- **Implementation Steps** — numbered, specific
- **Todo List** — checkbox list for tracking
- **Success Criteria** — definition of done + validation method
- **Risk Assessment** — potential issues + mitigation
- **Security Considerations** — auth, data protection
- **Next Steps** — dependencies, follow-up tasks

## Workflow

1. **Before** spawning `planner`, `fullstack-developer`, or any implementation work — write `plan.md`
2. **Present the file path** to the user for review (e.g. "Plan written to `plans/260524-1430-auth-rewrite/plan.md` — review before I proceed?")
3. **Wait for user redirect or approval** unless operating in `auto` mode
4. **Update the plan file as work progresses** — mark phases DONE, add new findings, log course corrections
5. **Never** delete plan files after completion — they're historical context for future work

## When NOT to write a plan file

- Typo fixes
- One-line config changes
- Direct user instruction to "just do X" with no ambiguity
- Read-only investigations (use scout/research reports instead)

## Anti-patterns

- Plan only in chat → user can't reference it later, sub-agents can't see it
- Mega `plan.md` with no phase split → re-reads thrash context window
- Plan written **after** implementation → not a plan, that's a postmortem
- Plan in `docs/` instead of `plans/` → docs are reference material, plans are work-in-progress
