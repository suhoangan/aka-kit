# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

**Do not** open a public GitHub issue for security bugs.

1. Email or DM the maintainer via [GitHub](https://github.com/suhoangan) with subject `aka-kit security`.
2. Include steps to reproduce, impact, and affected version/tag.
3. Expect an initial response within **7 days**.

We will confirm the issue, prepare a fix, and coordinate disclosure before publishing a patched release.

## Scope

**In scope**

- `aka-kit` CLI (`bin/`, `src/`)
- Bundled install scripts under `src/presets/**/scripts/`
- Default MCP / plugin wiring in `preset.json`
- GitHub Actions workflows in `.github/`

**Out of scope**

- Third-party MCP servers, npm packages, or plugins pulled at install/runtime (see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md))
- User projects modified by `aka-kit install` (permissions, hooks, merged settings)

## Safe use

- Review changes with `aka-kit install --dry-run` before applying to production repos.
- Prefer tagged installs: `npm install -g github:suhoangan/aka-kit#vX.Y.Z`
- Keep API keys in `.env` only — never commit secrets.
- Run `aka-kit doctor --json` after install to verify environment.

See README → **Security & trust** for what the installer writes and which network scripts may run.
