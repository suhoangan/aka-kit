# Skill Domain Routing

When a user's task involves a specific domain, activate the matching **aka:** skill. See `docs/skill-catalog.md` for the full list.

## Agentic slash commands (start here)

| Intent                   | Command          |
| ------------------------ | ---------------- |
| Greenfield project       | `/aka:bootstrap` |
| Plan only                | `/aka:plan`      |
| Implement / execute plan | `/aka:cook`      |
| Bug / CI / test failure  | `/aka:fix`       |
| Ship PR                  | `/aka:ship`      |
| Health check             | `/aka:check`     |

See `docs/agentic-flows.md` for full happy paths.

## Frontend / UI (nextjs preset)

```
User wants to...
├── Replicate a mockup, screenshot, or video     → aka:frontend-design
├── Build React/TS components, best practices    → aka:frontend-development
├── Style with Tailwind + shadcn/ui              → aka:ui-styling
├── Next.js App Router, RSC, Turborepo           → aka:web-frameworks
├── React performance patterns (Vercel)          → vercel-react-best-practices
└── Web testing (Playwright, Vitest, k6)         → aka:web-testing
```

## Codebase Understanding (shared)

```
User wants to...
├── Quick file search, locate specific code      → aka:scout
├── Technical research, best practices           → aka:research
├── Complex step-by-step analysis                → aka:sequential-thinking
└── Bootstrap / refresh code graph               → aka:graph-init
```

## Backend / API (shared + php / node-backend)

```
User wants to...
├── Build REST/GraphQL API (Node)                → aka:backend-development (node-backend / php)
├── Build REST/GraphQL API (PHP stack)           → aka:backend-development + aka:php-code-reviewer
├── Design schemas, SQL/NoSQL queries            → aka:databases (shared)
├── Add authentication                           → aka:better-auth (shared)
├── Integrate payments                           → aka:payment-integration (shared)
├── Ship a feature end-to-end (PHP)              → aka:ship-feature
└── Build MCP server                             → aka:mcp-builder (node-backend)
```

## Infrastructure (shared)

```
User wants to...
├── Deploy to Vercel / Railway / Cloudflare      → aka:deploy
├── Docker, K8s, CI/CD, Cloudflare Workers       → aka:devops
├── Security audit, secrets scan                 → aka:security-scan
└── Update project docs / PDR / changelog        → aka:docs
```

## HubSpot CMS (hubspot preset)

```
User wants to...
├── HubL templating                              → aka:hubspot-hubl
├── fields.json / fields.js modules              → aka:hubspot-fields-js
└── Pixel-level UI regression tests              → aka:visual-diff-tester
```

## Git / Release (shared)

```
User wants to...
├── Stage, commit, push, PR                      → aka:git or aka:commit
├── Daily standup / Slack update                 → aka:daily-report
└── Convert vague prompt → scoped instructions   → aka:prompt-engineer
```

## Quality (shared)

```
User wants to...
├── Run tests, coverage, CI validation           → aka:test
├── Debug failures, root-cause analysis          → aka:debug
├── Code review before merge                     → aka:code-review
└── Figma design → code                          → aka:figma-to-code
```

## Usage Notes

- Pick ONE skill per distinct user intent
- Multi-domain tasks: primary skill first, mention secondary (e.g. implement → `aka:frontend-development`, then `aka:web-testing`)
- Combine with workflow routing: plan → domain skill → `aka:test` → `aka:code-review`
- Library/API docs: use Context7 MCP (see `context7.md`), not a skill
