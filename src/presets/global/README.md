# global preset

User-scope artifacts for `~/.claude/` (or `~/.cursor/`, `~/.codex/` with `--platform`).

## Install

```bash
aka-kit install --global
aka-kit install --global --platform all
aka-kit install --nextjs --global    # combine project + global
```

## Adds

- **2 rules** — primary-workflow.md, orchestration-protocol.md
- **5 hooks** — session-init, dev-rules-reminder, privacy-block, descriptive-name, usage-context-awareness
- **Hook wiring** in settings.json (SessionStart, UserPromptSubmit, PreToolUse)

## When to use

You want consistent agent behaviour across **all** your projects on this machine — workflow rules, privacy block on `.env` reads, file-naming guidance on Write, session init context, etc.

Recommended: install once globally, then install project-specific presets per repo.

## Skip if

You only want per-project setup (no cross-project shared rules / hooks).
