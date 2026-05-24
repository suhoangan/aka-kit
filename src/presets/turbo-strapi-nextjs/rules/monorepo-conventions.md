---
description: Monorepo structure and Turborepo pipeline conventions
---

# Monorepo Conventions

## Workspace Structure

```
apps/
├── web/              # Next.js frontend (port 3000)
└── cms/              # Strapi headless CMS (port 1337)
packages/
├── eslint-config/    # Shared ESLint configuration
└── prettier-config/  # Shared Prettier configuration
turbo.json            # Turborepo configuration
```

## Package Manager: Yarn 4 (Berry)

- All commands run from root via turbo
- Dev: `yarn dev`
- Build: `yarn build`
- Lint: `yarn lint`
- Type check: `yarn type-check`

### Yarn 4 Specifics

- Use `yarn workspace <name> <cmd>` instead of `pnpm --filter`
- Zero-installs: `.yarn/cache` is committed, `node_modules` is not
- Add deps: `yarn workspace <name> add <package>`
- Add dev deps: `yarn workspace <name> add -D <package>`
- Add root dev deps: `yarn add -D <package> -W`
- `nodeLinker` is set in `.yarnrc.yml` — do not change without team discussion

### Import Convention

- Shared packages use workspace aliases: `@valprovia/eslint-config`, `@valprovia/prettier-config`
- No cross-app imports (web must not import directly from cms)

## Turborepo Pipeline Rules

- Every task must declare `inputs`/`outputs` for correct caching
- Do not add `dependsOn` entries arbitrarily — they affect build order
- Build tasks must depend on `^build` (packages build before apps)
- All env vars must be listed in `globalEnv` or the task's `env` field
- `turbo` is installed as a root dev dependency, invoked via `yarn turbo`
- Do not use `npx turbo` — always go through `yarn`
- Remote caching config lives in `turbo.json` under `remoteCache`
