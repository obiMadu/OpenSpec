## openspec change vs spec: behavior differences and recommendations

This document compares how `openspec change` and `openspec spec` behave today (focused on `show` and `list`) and recommends a raw-first, minimal standard to keep behavior simple and predictable before adding smarter formatting later.

## Summary of key differences and recommendations

| Area | Current: change | Current: spec | Recommendation |
|---|---|---|---|
| Invocation (show) | `openspec change show [change-name]` auto-picks when only one active change | `openspec spec show <spec-id>` requires id | Require explicit IDs for both. If `change-name` is omitted, print available IDs and a short hint (e.g., use `openspec change list`) and exit non-zero. No auto-pick. No interactive picker. |
| Default text output (show) | Raw `proposal.md` content | Formatted summary | Default both to RAW: print the underlying Markdown file as-is. Provide a future `--pretty` flag (non-default) for formatted output. |
| Filtering flags (show) | `--requirements-only` affects text and JSON | `--requirements`, `--no-scenarios`, `-r/--requirement` | Raw-first: in TEXT mode, no filtering. All filtering applies only to JSON output. Deprecate text-mode filters. Keep minimal JSON filters only. |
| JSON shape (show) | Full change object; `--requirements-only` can return an array | Filtered object | Always return an OBJECT. Minimal, stable shape. Change: `{ id, title, deltaCount, deltas, taskStatus? }`. Spec: `{ id, title, overview, requirementCount, requirements, metadata }`. No top-level arrays. |
| Text output (list) | "Active Changes" with progress | "Available Specifications" with teaser | Default both to RAW/minimal: print IDs only by default. Add `--long` to show `id + title` and minimal details (counts). No teasers. |
| JSON shape (list) | `[{ name, title, deltas, taskStatus }]` | `[{ id, title, overview, requirementCount }]` | Unify minimal keys: `id`, `title`, counts only. Change: `deltaCount`, `taskStatus`. Spec: `requirementCount`. Drop `overview` from list JSON. Sort by `id`. |
| Error/exit policy | Spinner + `process.exit(1)` in some paths | `exitCode` in others | Raw-first: no spinners in errors. Use `console.error` + `process.exitCode = 1` consistently. |
| Empty states (list) | Graceful | Errors if specs missing | Raw-first: graceful empty state everywhere. Print "No items found" and exit 0. |
| Multi-selection (change show) | Auto-pick single; error when multiple | N/A | Keep auto-pick single. If multiple, print IDs inline and exit non-zero. No interactive prompts. |
| Colors/TTY | Mixed | Chalk only | Raw-first: minimal color; honor `NO_COLOR` and add `--no-color`. |

## Detailed guidance

### 1) Unify flags and semantics (raw-first)
- Text mode: no filters; just raw file content.
- JSON mode: allow minimal filters only.
  - Specs: `--json` returns the structured spec. Optional: `-r/--requirement <n>` and `--requirements-only` apply to JSON only.
  - Changes: `--json` returns the structured change. Optional: `--deltas-only` applies to JSON only.
- Deprecate text-mode filtering flags across both commands.
- Optional future: `--pretty` (text formatting) as a non-default enhancement.

### 2) Normalize JSON contracts (minimal and stable)
- Show (change): `{ id, title, deltaCount, deltas: [...], taskStatus?: { total, completed } }`
- Show (spec): `{ id, title, overview, requirementCount, requirements: [...], metadata: { format, version } }`
- List (change): `[{ id, title, deltaCount, taskStatus }]`
- List (spec): `[{ id, title, requirementCount }]`
- Notes:
  - No top-level arrays for filtered show responses; always objects.
  - Avoid derived/pretty fields (e.g., teasers, percentages). Counts only.

### 3) Standardize text UI (minimal)
- Show: print raw Markdown file contents.
- List (default): print IDs only, one per line.
- List (`--long`): print `id: title` plus minimal counts where relevant.
- Keep colors minimal; support `--no-color` and respect `NO_COLOR`.

### 4) Consistent error handling and empty states
- Use `console.error` + `process.exitCode = 1`. Avoid `process.exit(1)`.
- No spinners (`ora`) in raw-first mode.
- Empty states print a simple message and exit 0.

### 5) Discoverability and UX
- No `change-name` provided: print IDs inline and a short hint; exit non-zero. No auto-pick. No interactive prompts.
- Add `--no-color` for deterministic logs and pipelines.

### 6) Backwards compatibility and deprecation
- Keep legacy flags as aliases for one minor release.
- Print a clear deprecation warning when a legacy flag is used.
- Update CLI docs/README/specs to reflect raw-first behavior.

### 7) Test coverage updates
- Add tests asserting raw text outputs (file passthrough) for `show`.
- Add tests for minimal list outputs (IDs by default, `--long` for details).
- Add JSON contract tests asserting minimal, stable shapes and JSON-only filtering.

### 8) Library alignment with existing commands
- No new dependencies.
- Do not use `@inquirer/prompts` in `change`/`spec` show/list (keep non-interactive). Interaction remains limited to `init`, `diff`, and `archive` where already in use.
- Do not use `ora` in `change`/`spec` (including validate). Use `console.error` and `process.exitCode`.
- Use `chalk` minimally; support `--no-color` and respect `NO_COLOR`.
- Keep using the shared `Validator` where applicable.
- Do not introduce `jest-diff` into `change`/`spec` (remains specific to `diff`).

## Why this approach
- Keeps the system raw and predictable; easy to compose in scripts.
- Minimizes UI/formatting logic until real needs emerge.
- Stabilizes JSON for tooling and avoids top-level arrays.
- Simple to extend later with `--pretty` and richer filtering if needed.
