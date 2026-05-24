# shared preset

Common artifacts auto-included by every other preset via `includes: ["shared"]`.

## Installs

- **26 skills** — agentic flows + add-plugin + core workflow + full-stack
- **10 rules** — development, docs, planning, permissions, rtk, context7, routing, team-coordination
- **5 project hooks** — bash guard, post-edit lint, post-edit typecheck, plan reminder (+ shared lib)
- **Templates** — CLAUDE.md (Claude/Cursor), AGENTS.md (Codex), `.gitignore`, `.env.example`, `docs/` scaffold, `.husky/post-commit`
- **MCP servers** — playwright, agent-browser, figma, context7, code-review-graph, serena
- **Plugins** — claude-mem, qmd
- **Auto-install scripts** — prerequisites (uv/pipx/Python/cargo), MCP cache, claude-mem, RTK, agent-browser, spec-kit, graph-init

## When used

You don't install this directly. It's pulled in automatically by `--nextjs`, `--php`, `--hubspot`, `--turbo-strapi-nextjs`.

## Prerequisites (auto-installed on `aka-kit install`)

Windows and macOS: **uv**, **pip/pipx**, **Python**, **Rust/cargo**, **bun**, **code-review-graph**, **claude-mem**, MCP npm packages, **rtk**, **agent-browser**, **spec-kit** — via Node installers (no Git Bash required).

Run `aka-kit doctor` or `/aka:check` to verify.

See `docs/agentic-flows.md` for slash-command happy paths.
