# Plugin Catalog

Curated Claude Code plugins and marketplaces bundled with aka-kit **shared** preset.

## Bundled by default (shared preset)

| Plugin ID               | Marketplace | Repo                                                              | Purpose                                  |
| ----------------------- | ----------- | ----------------------------------------------------------------- | ---------------------------------------- |
| `claude-mem@thedotmack` | thedotmack  | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Cross-session memory, observation search |
| `qmd@qmd`               | qmd         | [tobi/qmd](https://github.com/tobi/qmd)                           | Markdown knowledge-base search           |

These are enabled via `settings.enabledPlugins` and registered in `extraKnownMarketplaces` on install.

## extraKnownMarketplaces schema

Merged into `.claude/settings.json`:

```json
{
	"extraKnownMarketplaces": {
		"<marketplace-id>": {
			"source": {
				"source": "github",
				"repo": "owner/repo"
			}
		}
	},
	"enabledPlugins": {
		"<plugin-name>@<marketplace-id>": true
	}
}
```

| Field            | Description                               |
| ---------------- | ----------------------------------------- |
| `marketplace-id` | Short key users reference in `/plugin` UI |
| `source.source`  | `"github"` (shorthand) or full git URL    |
| `source.repo`    | `owner/repo` for GitHub shorthand         |
| `enabledPlugins` | Map of `plugin@marketplace` → boolean     |

### Adding a third-party marketplace manually

1. Edit `.claude/settings.json`
2. Add marketplace under `extraKnownMarketplaces`
3. Run `/plugin` → Discover → install desired plugin
4. Set `"plugin-name@marketplace-id": true` in `enabledPlugins`
5. Reload plugins if prompted

## Recommended plugins (optional, not bundled)

| Stack   | Plugin / tool                                                        | Notes                                         |
| ------- | -------------------------------------------------------------------- | --------------------------------------------- |
| All     | `/fewer-permission-prompts`                                          | Built-in Claude Code skill — tune allow rules |
| All     | [cc-permissions](https://github.com/DanielCarmingham/cc-permissions) | Analyze/apply permission rules via plugin     |
| Next.js | Playwright MCP                                                       | Already bundled as MCP server in shared       |
| PHP     | —                                                                    | Use stack preset + `aka:php-code-reviewer`    |
| HubSpot | —                                                                    | HubSpot preset skills cover CMS workflows     |

## Install flow

```
aka-kit install --nextjs
  → merges extraKnownMarketplaces (thedotmack, qmd)
  → enables claude-mem + qmd in enabledPlugins
```

Use **`/aka:add-plugin`** or **`aka-kit search plugin`** to discover catalog entries.

## Updating plugins

Third-party marketplaces do not auto-update by default. In Claude Code:

```
/plugin → Marketplaces → enable auto-update
```

Or from terminal: `claude plugin update <plugin>@<marketplace>`

## Programmatic catalog

Source of truth: `src/core/plugin-catalog.js` — used by `aka:add-plugin` skill.
