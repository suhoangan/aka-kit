# RTK — Rust Token Killer

**Source:** https://github.com/rtk-ai/rtk

RTK is a token-optimized CLI proxy. It rewrites verbose tool outputs (git, fs, package managers, build logs, etc.) into compact summaries, cutting 60–90% of token consumption on dev operations — **without** the agent losing information.

## Must-use policy

- **MUST** invoke shell-heavy dev commands via `rtk` whenever the binary is available.
- If the project's Claude/Cursor hook auto-rewrites `git ...` → `rtk git ...` transparently, do nothing extra — just keep running commands normally.
- If the hook is **not** installed, prefix manually: `rtk git status`, `rtk npm install`, `rtk pnpm test`, etc.
- For commands RTK doesn't recognize, run them directly — RTK only intervenes on known token-heavy commands.

## Verification

```bash
rtk --version     # rtk X.Y.Z
which rtk         # confirm correct binary (avoid name collision with reachingforthejack/rtk)
rtk gain          # show savings analytics
```

If `rtk gain` fails but `rtk --version` works → you have the wrong RTK installed. Install the correct one from https://github.com/rtk-ai/rtk.

## Meta commands (always run raw, never wrapped)

| Command | Purpose |
| ------- | ------- |
| `rtk gain` | Show token savings analytics |
| `rtk gain --history` | Per-command usage + savings history |
| `rtk discover` | Analyze Claude Code history for missed opportunities |
| `rtk proxy <cmd>` | Bypass filtering (debugging) |

## Install (one-time)

Refer to the README at https://github.com/rtk-ai/rtk for the latest install command. After install:

1. Confirm `which rtk` resolves to the rtk-ai binary
2. Enable the Claude Code hook so `git`/`npm`/`pnpm` etc. are auto-rewritten
3. Verify with `rtk gain`

## When NOT to use rtk

- Interactive commands (`git rebase -i`, `vim`, REPLs) — pass through directly
- Commands with binary output (images, archives) — RTK summarizes text only
- Anything where you explicitly need the raw output for parsing — use `rtk proxy <cmd>`
