---
name: aka:add-plugin
description: 'Enable a curated Claude Code plugin from the aka-kit catalog. Use for /aka:add-plugin or when user asks to add claude-mem, qmd, or marketplace plugins.'
argument-hint: '[plugin-name]'
version: 1.0.0
---

# Add Plugin — Curated Plugin Helper

Enable plugins from the aka-kit catalog (`docs/plugin-catalog.md`).

## Usage

```
/aka:add-plugin claude-mem
/aka:add-plugin qmd
/aka:add-plugin
```

## Bundled plugins (default catalog)

| Name       | ID                    | Marketplace |
| ---------- | --------------------- | ----------- |
| claude-mem | claude-mem@thedotmack | thedotmack  |
| qmd        | qmd@qmd               | qmd         |

## Workflow

1. **Identify plugin** — match user request to catalog (`docs/plugin-catalog.md`)
2. **Verify marketplace** — check agent settings (Claude Code: `.claude/settings.json`; Cursor: use MCP/skills catalog):
   - `extraKnownMarketplaces` contains marketplace source
   - If missing → user should re-run `aka-kit install` or `aka-kit update`
3. **Enable plugin** — set in `enabledPlugins`:
   ```json
   "claude-mem@thedotmack": true
   ```
4. **Guide user** — tell them to run `/plugin` → reload if needed
5. **Third-party** — for plugins outside catalog, document manual marketplace add per `docs/plugin-catalog.md`

## Rules

- Do not enable plugins without user confirmation for third-party sources
- Prefer bundled thedotmack + qmd for memory/search
- Sacrifice grammar for concision

## Related

- `docs/plugin-catalog.md` — full schema + optional recommendations
- `/fewer-permission-prompts` — built-in skill for permission tuning (not a plugin)
