## Summary

<!-- What changed and why -->

## Type

- [ ] fix
- [ ] feat
- [ ] docs
- [ ] chore (release / CI)

## Checklist

- [ ] `node bin/aka-kit.js install --nextjs --dry-run` passes locally
- [ ] `node scripts/prepublish-check.mjs` passes (or `aka-kit doctor --quick` with no errors)
- [ ] `CHANGELOG.md` updated under `[Unreleased]` if user-facing
- [ ] No secrets or `.env` files committed

## Test plan

```bash
cd aka-kit
npm ci
node scripts/prepublish-check.mjs
```
