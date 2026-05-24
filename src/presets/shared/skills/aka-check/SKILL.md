---
name: aka:check
description: 'Run aka-kit doctor health check. Alias for CLI doctor — verifies Node, binaries, MCP, skills, permissions. Use for /aka:check or environment validation.'
argument-hint: '[--quick|--json|--fix]'
version: 1.0.0
---

# Check — Environment Health

Runs `aka-kit doctor` and interprets results. CLI alias — not a replacement for doctor logic.

## Usage

```
/aka:check
/aka:check --quick
/aka:check --json
```

## Steps

1. Run from project root (or aka-kit repo root if diagnosing kit itself):

```bash
aka-kit doctor
aka-kit doctor --quick    # skip MCP spawn checks
aka-kit doctor --json     # machine-readable
```

2. Parse output:
   - **Exit 0** — all checks passed
   - **Exit 1** — warnings (report, suggest fixes)
   - **Exit 2** — errors (block work until fixed)

3. Summarize for user:

| Category  | What it checks                                      |
| --------- | --------------------------------------------------- |
| Runtime   | Node version, required binaries (rtk, gh, uv, etc.) |
| MCP       | `.mcp.json` / Codex config parse, env vars          |
| Installed | Skills frontmatter, orphan permissions              |

4. For failures, suggest concrete fixes:
   - Missing binary → install command or `aka-kit install` deps
   - Bad SKILL.md → fix frontmatter `name:` field
   - Missing MCP key → set env var from `.env.example`

## Rules

- Always run the command — don't simulate output
- If `aka-kit` not in PATH → `npx --package=github:suhoangan/aka-kit aka-kit doctor` or `npm install -g github:suhoangan/aka-kit`
- `--fix` not yet implemented — manual fixes only

## Related

- **After install:** run check to verify preset
- **Bootstrap step 9:** suggest `/aka:check`
