# Pinned dependencies

aka-kit pins external package and git refs used by MCP config and install scripts. Bump intentionally after review — not `@latest`.

| Component                 | Pin       | Used by                                            |
| ------------------------- | --------- | -------------------------------------------------- |
| `@playwright/mcp`         | `0.0.75`  | `shared/preset.json` → MCP `playwright`            |
| `agent-browser-mcp`       | `0.1.3`   | `shared/preset.json` → MCP `agent-browser`         |
| `@vkhanhqui/figma-mcp-go` | `0.1.3`   | `shared/preset.json` → MCP `figma`                 |
| `oraios/serena`           | `v1.5.1`  | `shared/preset.json` → MCP `serena` (uvx `--from`) |
| `agent-browser` CLI       | `0.27.0`  | `scripts/install-agent-browser.sh`                 |
| `rtk-ai/rtk`              | `v0.41.0` | `scripts/install-rtk.sh`                           |
| `github/spec-kit`         | `v0.8.13` | `scripts/install-speckit.sh`                       |
| `@tanstack/intent`        | `0.0.41`  | `nextjs/scripts/install-tanstack-intent.sh`        |

Override for local testing (optional env vars):

- `AKAKIT_RTK_VERSION=v0.41.0`
- `AKAKIT_AGENT_BROWSER_VERSION=0.27.0`
- `AKAKIT_SPECKIT_VERSION=v0.8.13`
- `AKAKIT_TANSTACK_INTENT_VERSION=0.0.41`
- `AKAKIT_SERENA_VERSION=v1.5.1`
