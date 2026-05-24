# File Reading Rules

## Document Files: Use markitdown

**ALWAYS** use the `markitdown` CLI to convert document files to markdown before reading them. Do NOT use the native `Read` tool directly on these formats.

### Applies to

- PDF: `.pdf`
- Word: `.docx`, `.doc`
- PowerPoint: `.pptx`, `.ppt`
- Excel: `.xlsx`, `.xls`
- Other: `.odt`, `.ods`, `.odp`, `.epub`, `.rtf`

### Usage

```bash
markitdown path/to/file.pdf
# or pipe to file then read
markitdown path/to/file.docx > /tmp/out.md
```

Then read the converted markdown output.

### Does NOT apply to

- Plain text: `.md`, `.txt`, `.json`, `.yaml`, `.toml`, `.csv`
- Source code files
- Images (use vision/multimodal tools)

**Why:** Consistent clean markdown across Office formats; better fidelity than raw extraction.

## Markdown Files: Use QMD

**ALWAYS** use `qmd` to find/search markdown files instead of Grep/Glob/Read for discovery.

### Usage

```bash
qmd query "search terms" -c <collection>     # semantic + keyword search
qmd get path/to/file.md                       # retrieve single doc
qmd multi_get "journals/2025-*.md"            # batch retrieve by glob
```

### When

- Finding markdown files by topic or content
- Searching notes, docs, plans, knowledge bases
- Locating relevant `.md` across collections

### Fallback

Use Grep/Glob only when:

- QMD unavailable
- Need exact regex match on a known file path

## Code Search: Graph First, Then Serena

**Order of preference for code search/navigation:**

1. **code-review-graph MCP** — structural graph (callers, callees, imports, tests, blast radius). Use first for "who calls X?", "impact of changing Y?", "architecture overview".
2. **graphify MCP** — full graph including docs/images/concepts (only if `graphify-out/graph.json` exists for the project).
3. **Serena** symbol tools — symbol-level navigation when the graph isn't built, OR for symbolic _edits_ (rename, insert, replace symbol body — code-review-graph is read-only).
4. **Grep/Read** — last resort, exact string matches only.

### code-review-graph (preferred)

- `query_graph` (callers_of, callees_of, imports_of, tests_for) — relationship traversal
- `semantic_search_nodes` — find function/class/module by keyword
- `get_impact_radius` / `get_affected_flows` — blast-radius analysis
- `detect_changes` / `get_review_context` — code review

### Serena (fallback / edits)

- `find_symbol` — locate function/class/method by name
- `find_referencing_symbols` — find callers/usages
- `replace_symbol_body` / `insert_before_symbol` / `insert_after_symbol` — **symbolic edits**

### Decision matrix

| Question                                 | Tool                                        |
| ---------------------------------------- | ------------------------------------------- |
| Who calls X? Impact of change?           | code-review-graph                           |
| Where is X defined? (graph built)        | code-review-graph (`semantic_search_nodes`) |
| Where is X defined? (no graph)           | Serena (`find_symbol`)                      |
| Rename / move / edit by symbol           | Serena (only option)                        |
| Architecture overview                    | code-review-graph or graphify               |
| Exact literal match (error string, flag) | Grep                                        |
