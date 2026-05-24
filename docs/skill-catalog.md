# Skill Catalog

All skills bundled by aka-kit presets, as of 2026-05-24.

Naming: `aka-*` prefix denotes aka-kit curated skills. `vercel-*` denotes upstream skills from `vercel-labs`.

## shared (26 skills)

Bundled with every preset via `includes: ["shared"]`.

| Skill               | Slug                      | Purpose                                                     |
| ------------------- | ------------------------- | ----------------------------------------------------------- |
| Plan                | `aka-plan`                | Phased plans in `plans/` — no implementation                |
| Cook                | `aka-cook`                | End-to-end feature pipeline (plan/code/test/review)         |
| Fix                 | `aka-fix`                 | Bug-fix pipeline (debug → fix → test → review)              |
| Ship                | `aka-ship`                | Test → review → commit → push → PR                          |
| Bootstrap           | `aka-bootstrap`           | Greenfield: stack → `aka-kit install` → plan → implement    |
| Check               | `aka-check`               | `aka-kit doctor` health check wrapper                       |
| Add plugin          | `aka-add-plugin`          | Enable curated Claude Code plugins from aka-kit catalog     |
| Git                 | `aka-git`                 | Conventional commits, staging, pushing, PRs, merges         |
| Code review         | `aka-code-review`         | Adversarial code-quality review, scout-based edge cases     |
| Debug               | `aka-debug`               | Root-cause analysis, call stack tracing, CI/CD log analysis |
| Test                | `aka-test`                | Unit/integration/e2e/UI test execution, coverage            |
| Sequential thinking | `aka-sequential-thinking` | Step-by-step analysis for complex problems with revision    |
| Scout               | `aka-scout`               | Fast parallel codebase scouting for file discovery          |
| Research            | `aka-research`            | Technical research, architecture analysis, best practices   |
| Daily report        | `aka-daily-report`        | Slack-formatted daily standup summaries                     |
| Figma to code       | `aka-figma-to-code`       | Convert Figma designs to code via figma-mcp-go              |
| Commit              | `aka-commit`              | Focused git commits with conventional format                |
| Prompt engineer     | `aka-prompt-engineer`     | Convert vague prompts → scoped agent instructions           |
| Graph init          | `aka-graph-init`          | Bootstrap code-review-graph for current project             |
| Databases           | `aka-databases`           | MongoDB + PostgreSQL schemas, queries, migrations           |
| Better Auth         | `aka-better-auth`         | Email/OAuth, 2FA, passkeys, sessions, RBAC                  |
| Payment integration | `aka-payment-integration` | Stripe, Polar, SePay — checkout, webhooks, subscriptions    |
| Deploy              | `aka-deploy`              | Vercel, Cloudflare, Railway, Fly.io — auto-detect hosting   |
| DevOps              | `aka-devops`              | Docker, K8s, Cloudflare Workers, CI/CD, GitOps              |
| Security scan       | `aka-security-scan`       | OWASP patterns, secrets scan, security audit                |
| Docs                | `aka-docs`                | Project docs management (codebase-summary, PDR, changelog)  |

## nextjs (+6 skills)

| Skill                       | Slug                          | Purpose                                             |
| --------------------------- | ----------------------------- | --------------------------------------------------- |
| Frontend development        | `aka-frontend-development`    | React/TS frontends, Suspense, lazy, TanStack Router |
| Web frameworks              | `aka-web-frameworks`          | Next.js App Router, RSC, SSR, ISR, Turborepo        |
| Vercel React best practices | `vercel-react-best-practices` | Upstream Vercel performance patterns                |
| UI styling                  | `aka-ui-styling`              | Tailwind + shadcn/ui, themes, dark mode, responsive |
| Web testing                 | `aka-web-testing`             | Playwright, Vitest, k6 — E2E / load / a11y          |
| Frontend design             | `aka-frontend-design`         | Replicate UI from designs/screenshots/videos        |

## fullstack-nextjs (0 extra skills)

Named bundle: `includes: ["nextjs"]` → shared + nextjs. Use `aka-kit install --fullstack-nextjs`.

## node-backend (+2 skills)

Includes `shared`. Adds:

| Skill               | Slug                      | Purpose                                       |
| ------------------- | ------------------------- | --------------------------------------------- |
| Backend development | `aka-backend-development` | REST/GraphQL APIs, auth, microservices, OWASP |
| MCP builder         | `aka-mcp-builder`         | Build MCP servers (FastMCP, Node SDK)         |

## php (+3 skills)

| Skill               | Slug                      | Purpose                                   |
| ------------------- | ------------------------- | ----------------------------------------- |
| Backend development | `aka-backend-development` | REST/GraphQL APIs, auth, microservices    |
| Ship feature        | `aka-ship-feature`        | Feature shipping pipeline for PHP stacks  |
| PHP code reviewer   | `aka-php-code-reviewer`   | Magento 2 / Laravel / Symfony code review |

## hubspot (+3 skills)

| Skill              | Slug                     | Purpose                                   |
| ------------------ | ------------------------ | ----------------------------------------- |
| HubSpot HubL       | `aka-hubspot-hubl`       | HubSpot CMS templating language           |
| HubSpot fields.js  | `aka-hubspot-fields-js`  | fields.json/fields.js for HubSpot modules |
| Visual diff tester | `aka-visual-diff-tester` | Pixel-level UI regression tests           |

## turbo-strapi-nextjs (+6 skills)

Same skills as `nextjs` (excluding `vercel-react-best-practices`, plus `aka-react-best-practices`).

## global (0 skills)

Global preset ships hooks + rules only, no skills.

---

## How to add a skill

1. Pick the right preset (shared if generic, stack-specific otherwise)
2. Create `src/presets/<preset>/skills/aka-<name>/SKILL.md` with frontmatter:
   ```yaml
   ---
   name: aka:<name>
   description: One-line trigger description
   ---
   ```
3. Add `"aka-<name>"` to `artifacts.skills` in `preset.json`
4. Add `"Skill(aka:<name>)"` to `permissions.allow`
5. Add row to this catalog
6. Bump CHANGELOG.md

## Skill source

Fork from **claudekit-engineer** (`/Users/an/Documents/AI/claudekit-engineer/.claude/skills/`) or global `~/.claude/skills/`:

```bash
rsync -a --exclude node_modules SOURCE/ src/presets/shared/skills/aka-<name>/
# Fix frontmatter: name: aka:<name>
```

See `plans/reports/researcher-260524-ck-kit-skills-phase6.md` for ck-kit → aka-kit mapping.
