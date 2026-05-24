---
title: Token Efficiency Patterns
impact: HIGH
tags: tokens, efficiency, prompt-quality, anti-patterns
---

# Token Efficiency Patterns

Wasted tokens = slower responses, higher cost, and worse output quality.
Each pattern below shows the bloated form, why it wastes tokens, and the fix.

---

## Pattern 1: The Politeness Tax

**Impact: LOW waste, HIGH frequency**

Every filler phrase costs tokens and adds zero signal.

**Bad (28 tokens of waste):**
```
Could you please help me fix this issue? I need you to look at the file and
make sure you handle all edge cases properly. Feel free to refactor if needed.
```

**Good (11 tokens):**
```
Fix the null check in lib/parser.ts:42. Handle undefined input only.
```

**Strip list:**
`could you`, `please`, `I need you to`, `make sure`, `feel free to`, `properly`,
`as needed`, `as an expert`, `as an AI`, `I would like`, `note that`, `keep in mind`

---

## Pattern 2: The File Dump

**Impact: CRITICAL waste**

Pasting full file contents when Claude can read it.

**Bad (~2000 tokens):**
```
Here is my entire file:
[pastes 200 lines of code]

Now fix the bug on line 42.
```

**Why it's bad:**
- 200 lines × ~5 tokens/line = ~1000 tokens of context
- Claude already has file access via Read tool
- You're paying to tell Claude what it can discover itself

**Good (15 tokens):**
```
Fix bug in lib/parser.ts:42. Read the file first if needed.
```

**Rule:** Never paste file contents unless the file is < 20 lines OR the relevant
section is isolated and you're calling attention to a specific excerpt.

---

## Pattern 3: The Compound Request

**Impact: HIGH waste + quality degradation**

Asking for multiple unrelated things in one prompt forces the agent to context-switch,
increases scope leak, and produces lower quality on each task.

**Bad (one prompt, two tasks, unclear priority):**
```
Fix the failing test in auth.test.ts and also add the new user profile endpoint
and update the README with the new API docs. Also check if there are any security
issues while you're at it.
```

**Why it's bad:**
- 4 tasks = 4× scope for error
- Agent must hold all contexts simultaneously
- "While you're at it" is the most expensive phrase in prompting

**Good (3 sequential prompts, each focused):**

Prompt 1:
```
Fix failing test in __tests__/auth.test.ts:88. Do not modify auth.ts.
```

Prompt 2 (after P1 done):
```
Add POST /api/users/profile endpoint to app/api/users/profile/route.ts.
Schema: { bio: string, avatar_url: string }. Auth required via existing middleware.
```

Prompt 3 (after P2 done):
```
Update docs/api.md to document the new POST /api/users/profile endpoint added in
app/api/users/profile/route.ts. Match existing endpoint doc format.
```

---

## Pattern 4: The Vague Anchor

**Impact: HIGH waste + wrong output**

Describing code in prose instead of referencing it by path.

**Bad:**
```
In the scanner, when it processes the files, there's a function that calculates
the score — fix the off-by-one error in the loop.
```
Problems: "the scanner" could be 4 files, "a function" has no name, Claude must
search to find it — burning tokens on discovery you could have done yourself.

**Good:**
```
Fix off-by-one in calculateRiskScore() at lib/scanners/scan-orchestrator.ts:87.
The loop exits one iteration early, missing the last finding.
```

**Anchor formula:** `functionName() at path/to/file.ts:line`

---

## Pattern 5: The Open-Ended Improver

**Impact: CRITICAL waste + scope explosion**

Asking Claude to "improve", "enhance", or "make better" without constraints
always results in unwanted refactoring, new abstractions, and feature creep.

**Bad:**
```
This component is a bit messy. Can you improve it and make it more maintainable?
```

**What Claude hears:**
"Refactor the entire component, add types, add comments, extract hooks, rename
variables, split into subcomponents, add error handling, improve performance..."

**Good:**
```
In components/Scanner.tsx:23-45, extract the 3 inline styles into a styles const
above the component. No other changes.
```

**Rule:** Every "improve" request must name exactly what improvement and be bounded
by file + line range.

---

## Pattern 6: The Speculative Feature

**Impact: MEDIUM waste**

Describing future requirements the current task doesn't need.

**Bad:**
```
Add a settings page. Eventually we'll want to support themes, notifications,
API key management, user roles, and maybe plugin support in the future.
```
Problems: "eventually" and "maybe" = Claude will try to architect for all of it.

**Good:**
```
Add settings page at app/settings/page.tsx with one section: "Account".
Display user email (read-only) from useAuth() hook. No forms. No other sections.
```

**Rule:** Only describe what this specific task requires. Future requirements
belong in a roadmap doc, not a prompt.

---

## Pattern 7: The Redundant Explanation

**Impact: MEDIUM waste**

Explaining to Claude what Claude already knows.

**Bad:**
```
As you know, TypeScript is a strongly typed language. In React, components are
functions that return JSX. When we use hooks, we need to follow the rules of hooks.
Please keep these principles in mind when implementing the feature.
```

**Good:**
```
[nothing — Claude knows TypeScript and React]
```

**Rule:** Never explain the technology stack, language features, or framework
concepts. Only explain business context that is specific to your codebase.

---

## Pattern 8: The Trailing Summary Request

**Impact: LOW waste, HIGH annoyance**

Asking Claude to summarize what it just did wastes tokens on content the diff shows.

**Bad:**
```
After making the changes, provide a summary of everything you did and explain
why you made each decision.
```

**Good:**
```
[nothing — the diff is the summary]
```

Or, if you need a specific decision logged:
```
After editing, add one comment above the change explaining the null-guard reason.
```

---

## Token Budget Reference

| Pattern | Typical Waste | Frequency |
|---------|--------------|-----------|
| Politeness tax | 20-50 tokens | Very High |
| File dump | 500-5000 tokens | Medium |
| Compound request | 200-500 tokens + quality | Medium |
| Vague anchor | 100-300 tokens discovery | High |
| Open-ended improver | 500-2000 tokens scope | Medium |
| Speculative features | 100-400 tokens | Low |
| Redundant explanation | 50-200 tokens | Medium |
| Trailing summary | 100-300 tokens | High |

**Target prompt length:** 50-150 tokens for focused tasks. 150-400 for complex features.
Over 400 tokens = likely a compound request or file dump issue.
