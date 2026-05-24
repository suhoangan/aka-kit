# shared preset

Common artifacts auto-included by every other preset via `includes: ["shared"]`.

## Installs

- **26 skills** — agentic flows + add-plugin + core workflow + full-stack
- **10 rules** — development, docs, planning, permissions, rtk, context7, routing, team-coordination
- **5 project hooks** — bash guard, post-edit lint, post-edit typecheck, plan reminder (+ shared lib)
- **Templates** — CLAUDE.md (Claude/Cursor), AGENTS.md (Codex), `.gitignore`, `.env.example`, `docs/` scaffold, `.husky/post-commit`
- **MCP servers** — playwright, agent-browser, figma, context7, code-review-graph, serena
- **Plugins** — claude-mem, qmd
- **Auto-install scripts** — RTK, agent-browser, spec-kit, graph-init

## When used

You don't install this directly. It's pulled in automatically by `--nextjs`, `--php`, `--hubspot`, `--turbo-strapi-nextjs`.

## Prerequisites

- Node 18+
- `pipx` (for code-review-graph + speckit)
- `uv` (for serena MCP + speckit)
- Optional: `brew` on macOS for fastest dependency installs

Run `aka-kit doctor` or `/aka:check` to verify prereqs.

See `docs/agentic-flows.md` for slash-command happy paths.
