# turbo-strapi-nextjs preset

Turborepo monorepo with Strapi v5 CMS + Next.js 15 frontend (Yarn 4).

## Install

```bash
aka-kit install --turbo-strapi-nextjs
aka-kit install --turbo-strapi-nextjs --platform all
```

## Adds (on top of shared)

- **6 skills** — frontend-development, web-frameworks, react-best-practices, ui-styling, web-testing, frontend-design
- **3 rules** — monorepo-conventions, nextjs-rules, strapi-rules

## When to use

Monorepo with `apps/web` (Next.js 15) + `apps/cms` (Strapi v5), managed by Turborepo + Yarn 4 workspaces.

## Skip if

You're not on this exact stack. Use `--nextjs` for frontend-only or wait for `--node-backend` / `--fullstack-nextjs` for other monorepo shapes.
