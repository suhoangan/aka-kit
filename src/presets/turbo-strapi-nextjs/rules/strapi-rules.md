---
paths:
  - 'apps/cms/**'
description: Strapi v5 CMS rules for the monorepo cms app
---

# Strapi Rules

- Strapi v5 — use Document Service API (`strapi.documents()`), not Entity Service (removed in v5)
- Never modify files in `node_modules` or `.cache`
- All config changes go through `apps/cms/config/` — no hardcoding
- Run dev: `yarn dev:cms`
- Content type schema changes require a Strapi restart

## Content Types

Each content type has: controller, route, service.

```
apps/cms/src/api/<name>/
├── content-types/<name>/schema.json
├── controllers/<name>.ts
├── routes/<name>.ts
└── services/<name>.ts
```

- Custom logic lives in the service, not the controller
- Custom routes must explicitly declare auth and policies
- Never expose sensitive fields in default populate

## Plugins

- Plugins must be fully registered in `apps/cms/src/index.ts`
- Access other plugins via `strapi.plugin('<name>')`
- Plugin config belongs in `apps/cms/config/plugins.ts`
- Do not mutate core Strapi types — extend them instead

## TypeScript Types

- Files in `types/` are auto-generated — do not edit manually
- After any schema change, regenerate: `yarn workspace cms strapi ts:generate-types`
- Sync relevant types to `apps/web/types` when the web app needs them
