# Third-Party Notices

aka-kit bundles curated skills, rules, hooks, and templates. **Copyright (c) 2026 ansh** applies to the CLI and aka-kit-authored files (MIT — see [LICENSE](./LICENSE)).

The following third-party material is included or referenced. Each retains its original license.

## Skills & rules (bundled)

| Component                    | Source / author                                                                 | License                   | Location                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| Vercel React Best Practices  | [vercel-labs](https://github.com/vercel-labs)                                   | MIT                       | `src/presets/nextjs/skills/vercel-react-best-practices/`          |
| UI styling (shadcn helpers)  | aka-kit + shadcn ecosystem                                                      | Apache-2.0 (skill bundle) | `src/presets/nextjs/skills/aka-ui-styling/`                       |
| MCP builder reference        | Anthropic MCP examples                                                          | Apache-2.0                | `src/presets/node-backend/skills/aka-mcp-builder/`                |
| Sequential thinking          | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | MIT                       | `src/presets/shared/skills/aka-sequential-thinking/`              |
| Payment / auth / deploy docs | Community + vendor docs (Stripe, Polar, SePay, etc.)                            | Various (documentation)   | `src/presets/shared/skills/aka-*`                                 |
| HubSpot skills               | aka-kit / HubSpot ecosystem                                                     | MIT (aka-kit bundle)      | `src/presets/hubspot/skills/`                                     |
| Canvas fonts                 | Google Fonts & independent foundries                                            | SIL OFL                   | `src/presets/nextjs/skills/aka-ui-styling/canvas-fonts/*-OFL.txt` |

Many `aka-*` skills adapt patterns from open-source agent tooling; they are re-namespaced (`aka:`) and trimmed for preset install.

## Runtime dependencies (npm — aka-kit CLI)

See `package.json` / `package-lock.json`: chalk, commander, fs-extra, prompts, @iarna/toml, bumpp (dev).

## Installed at runtime (not shipped in repo)

When users run `aka-kit install`, these may be downloaded or invoked (pinned versions in [docs/pinned-dependencies.md](./docs/pinned-dependencies.md)):

| Package / tool                     | Purpose               | Upstream                                                                        |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `@playwright/mcp`                  | Browser MCP           | Microsoft / Playwright                                                          |
| `agent-browser-mcp`                | Browser MCP bridge    | [minhlucvan/agent-browser-mcp](https://github.com/minhlucvan/agent-browser-mcp) |
| `@vkhanhqui/figma-mcp-go`          | Figma MCP             | [vkhanhqui/figma-mcp-go](https://github.com/vkhanhqui/figma-mcp-go)             |
| `agent-browser` CLI                | Browser automation    | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)       |
| `code-review-graph`                | Code graph MCP        | PyPI                                                                            |
| `serena` (via uvx)                 | Code intelligence MCP | [oraios/serena](https://github.com/oraios/serena)                               |
| `rtk`                              | Token compression CLI | [rtk-ai/rtk](https://github.com/rtk-ai/rtk)                                     |
| `specify-cli` (spec-kit)           | Spec workflow         | [github/spec-kit](https://github.com/github/spec-kit)                           |
| `@tanstack/intent`                 | TanStack agent skills | TanStack                                                                        |
| Claude plugins `claude-mem`, `qmd` | Memory / search       | GitHub marketplaces in `preset.json`                                            |

## Attribution

If you redistribute aka-kit or its preset bundles, retain this file, [LICENSE](./LICENSE), and any per-component LICENSE/OFL files in skill directories.
