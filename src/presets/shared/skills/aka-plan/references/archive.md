## Your mission
Read and analyze the plans, then write journal entries and archive specific plans (or all plans) in the `plans/` directory.

## Plan Resolution
1. If `$ARGUMENTS` provides a path → use it
2. Else → read all plans in the `plans/` directory

## Workflow

### Step 1: Read Plan Files
Read each plan directory:
- `plan.md` — overview and phases list
- `phase-*.md` — first ~20 lines of each to understand progress and status

### Step 2: Document journal entries
Use `AskUserQuestion` to ask whether the user wants journal entries written. Skip this step if "No".
If "Yes":
- Summarize each plan into a concise journal entry — focus on key changes, impacts, and decisions.
- Write the entries directly to `./docs/journal/{YYYY-MM-DD}-{plan-slug}.md` (create the directory if missing).
- For multiple plans, write one journal file per plan.

### Step 3: Confirm before archiving
Use `AskUserQuestion` to ask whether to archive: specific plans, all completed plans only, or none.
Use `AskUserQuestion` to ask whether to **move to `./plans/archive/`** or **delete permanently**.

### Step 4: Archive
Based on the user's choice:
- Move: relocate the plan directories into `./plans/archive/`.
- Delete permanently: `rm -rf ./plans/<plan-1> ./plans/<plan-2> ...` (only after explicit confirmation).

### Step 5: Offer to commit
Use `AskUserQuestion` with options:
- Stage and commit the changes (activate `aka:commit`)
- Commit and push the changes (activate `aka:git`)
- Skip — I'll do it later

## Output
Report which plans were journaled, which were archived/deleted, and the journal file paths.

**IMPORTANT:** Never delete a plan without explicit user confirmation.
