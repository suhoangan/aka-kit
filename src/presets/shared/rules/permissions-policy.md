# Permissions Policy

aka-kit merges **allow**, **deny**, and **ask** rules into `.claude/settings.json` on install (**Claude Code only**). Cursor uses `.cursor/rules/*.mdc`; Codex uses reference rules under `.codex/rules/`.

## Evaluation order

Claude Code evaluates: **deny → ask → allow** (first match wins).

## Bundled policy

| Tier      | Purpose                                                               |
| --------- | --------------------------------------------------------------------- |
| **deny**  | Block filesystem root/home wipes, pipe-to-shell curls                 |
| **ask**   | Confirm git push, force push, hard reset, rm -rf, SQL DROP            |
| **allow** | Pre-approve safe dev commands (git read, npm/pnpm, node, stack tools) |

Stack-specific Bash allows are added per preset (e.g. `next`, `php`, `composer`).

## Reduce prompt fatigue

1. **Re-run install/update** after upgrading aka-kit — merges latest allow/deny/ask rules
2. **Built-in skill** — run `/fewer-permission-prompts` in Claude Code for interactive tuning
3. **Permission mode** — `acceptEdits` auto-approves file edits; set in settings or `/permissions`
4. **Review rules** — `/permissions` UI shows merged rules and their source file

## Custom overrides

User rules in `settings.local.json` can add allows; **deny from project settings cannot be overridden** by allow at lower scope.

Do not remove deny rules for destructive Bash unless you understand the risk.

## Related

- `docs/plugin-catalog.md` — plugin marketplaces
- `aka-kit doctor` — detects orphan `Skill(...)` permissions
