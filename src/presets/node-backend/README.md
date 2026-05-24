# node-backend preset

API/backend projects: **shared** (DB, auth, deploy, devops, etc.) + backend-development + mcp-builder.

## Install

```bash
aka-kit install --node-backend
```

## Skills added (on top of shared)

| Skill                     | Purpose                                 |
| ------------------------- | --------------------------------------- |
| `aka-backend-development` | REST/GraphQL APIs, auth patterns, OWASP |
| `aka-mcp-builder`         | Build MCP servers (FastMCP, Node SDK)   |

Shared already provides: databases, better-auth, payment-integration, deploy, devops, security-scan, docs.

## When to use

Express, Fastify, NestJS, or other Node backends without a Next.js frontend.

## When not to use

- Next.js full-stack → `--fullstack-nextjs`
- PHP stack → `--php`
