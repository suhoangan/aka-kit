# Code Review Cycle

Interactive review-fix cycle used in cook workflows.

## Risk Triggers

Add an adversarial-validation pass for:

| Trigger | Required Lens |
|---|---|
| `--auto` | adversarial validator |
| auth, secrets, payments | domain-risk reviewer |
| DB schema, migration | domain-risk reviewer |
| public API, exported contract | domain-risk reviewer |
| CI, deploy, release, production config | domain-risk reviewer |
| destructive filesystem operation | domain-risk reviewer |
| large diff or ship/push/PR/deploy | adversarial validator |

No majority vote. Any evidenced critical issue blocks.

## Interactive Cycle (max 3 cycles)

```
cycle = 0
LOOP:
  1. Spawn code-reviewer → score, decision, criticals, warnings
  2. If a risk trigger exists, spawn an adversarial/domain reviewer
  3. Display score, decision, criticals, warnings
  4. AskUserQuestion:
     IF critical_count > 0:
       - "Fix blocking issues" → fix, re-run tester, cycle++, LOOP
       - "Abort" → stop
     ELSE:
       - "Approve" → PROCEED
       - "Fix warnings/suggestions" → fix, cycle++, LOOP
       - "Abort" → stop
  5. IF cycle >= 3 AND user selects fix:
     → "3 review cycles completed. Final decision required."
     → AskUserQuestion: "Approve with noted risks" / "Abort workflow"
```

## Auto-Handling Cycle

```
cycle = 0
LOOP:
  1. Spawn code-reviewer → decision
  2. If auto/high-risk/large-diff/ship-like, spawn adversarial validator
  3. IF high-risk AND not human-approved:
     → STOP via AskUserQuestion before finalize/commit/ship
  4. IF decision == PASS AND no high-risk stop:
     → Auto-approve, PROCEED
  5. ELSE IF critical/blocking issue exists AND cycle < 3:
     → Auto-fix critical issues → re-run tester → cycle++, LOOP
  6. ELSE:
     → ESCALATE TO USER
```

Score is never sufficient for approval. `score >= 9.5` is only a confidence signal.

## Adversarial Validator Prompt

```
Disprove implementation claims for <phase>.
Scope: correctness, acceptance coverage, regression reachability, contracts.
Forbidden: style polish, broad rewrites, preference-only feedback.
Return:
- decision: PASS | PASS_WITH_RISK | BLOCKED
- disprovenClaims[]
- unverifiedClaims[]
- missingProof[]
- reachableRegressions[]
```

## Output Formats

- Waiting: `Step 5: Code reviewed — [decision] — WAITING`
- After fix: `Step 5: Fixed [N] blockers — Approved`
- Auto-approved: `Step 5: Review PASS — Auto-approved`
- High-risk stop: `Step 5: High-risk auto stop — human approval required before finalize`
