# Intent Detection Logic

Detect user intent from natural language and route to the appropriate workflow.

## Detection Algorithm

```
FUNCTION detectMode(input):
  # Priority 1: Explicit flags (override all)
  IF input contains "--interactive": RETURN "interactive"
  IF input contains "--fast": RETURN "fast"
  IF input contains "--parallel": RETURN "parallel"
  IF input contains "--auto": RETURN "auto"
  IF input contains "--no-test": RETURN "no-test"
  # "--tdd" is composable and does not change mode selection

  # Priority 2: Plan path detection
  IF input matches path pattern (./plans/*, plan.md, phase-*.md):
    RETURN "code"

  # Priority 3: Keyword detection (case-insensitive)
  keywords = lowercase(input)
  IF keywords contains ["fast", "quick", "rapidly", "asap"]:     RETURN "fast"
  IF keywords contains ["trust me", "auto", "yolo", "just do it"]: RETURN "auto"
  IF keywords contains ["no test", "skip test", "without test"]:  RETURN "no-test"

  # Priority 4: Complexity detection
  features = extractFeatures(input)  # comma-separated or "and"-joined items
  IF count(features) >= 3 OR keywords contains "parallel":
    RETURN "parallel"

  # Default
  RETURN "interactive"
```

## Feature Extraction

```
"implement auth, payments, and notifications" → ["auth", "payments", "notifications"]
"add login + signup + password reset"        → ["login", "signup", "password reset"]
"create dashboard with charts and tables"    → single feature (dashboard)
```

**Parallel trigger:** 3+ distinct features = parallel mode.

## Mode Behaviors

| Mode | Skip Research | Skip Test | Review Gates | Auto-Approve | Parallel Exec |
|------|---------------|-----------|--------------|--------------|---------------|
| interactive | ✗ | ✗ | **Yes (stops)** | ✗ | ✗ |
| auto | ✗ | ✗ | Low-risk only | ✓ | ✓ (low-risk phases) |
| fast | ✓ | ✗ | Yes (stops) | ✗ | ✗ |
| parallel | Optional | ✗ | Yes (stops) | ✗ | ✓ |
| no-test | ✗ | ✓ | Yes (stops) | ✗ | ✗ |
| code | ✓ | ✗ | Yes (stops) | Per plan | Per plan |

**Review Gates:** Human approval checkpoints between major steps (see `workflow-steps.md`). All modes EXCEPT low-risk `auto` stop at review gates. `auto` runs continuously only for low-risk, review-passing work.

## Examples

```
"/aka:cook implement user auth"                          → interactive (default)
"/aka:cook plans/260120-auth/phase-02-api.md"            → code (path detected)
"/aka:cook quick fix for the login bug"                  → fast ("quick" keyword)
"/aka:cook implement auth, payments, notifications, shipping" → parallel (4 features)
"/aka:cook implement dashboard --fast"                   → fast (explicit flag)
"/aka:cook refactor auth middleware --tdd"               → interactive + tests-first behavior
"/aka:cook implement everything --auto"                  → auto (continuous for low-risk only)
"/aka:cook implement dashboard trust me"                 → auto ("trust me" keyword)
```

**Note:** Only `--auto` flag or "trust me"/"auto"/"yolo" keywords enable continuous execution.

## Conflict Resolution

When multiple signals are detected, priority order:
1. Explicit flags (`--fast`, `--auto`, etc.)
2. Path detection (plan files)
3. Keywords in text
4. Feature count analysis
5. Default (interactive)
