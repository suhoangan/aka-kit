# nextjs preset

Next.js + React + TypeScript stack.

## Install

```bash
aka-kit install --nextjs                  # Claude Code (default)
aka-kit install --nextjs --platform all   # Claude + Cursor + Codex
```

## Adds (on top of shared)

- **6 skills** — frontend-development, web-frameworks, vercel-react-best-practices, ui-styling, web-testing, frontend-design
- **1 dependency script** — `install-tanstack-intent.sh` (wires `@tanstack/*` agent skills into AGENTS.md / CLAUDE.md / .cursorrules)

## When to use

Building Next.js apps with TanStack ecosystem (Query, Router, Form, Table). Apps using shadcn/ui + Tailwind. SSR / RSC / ISR projects.

## Skip if

You don't use Next.js (then use a different preset or wait for `node-backend`/`fullstack-nextjs` presets).
