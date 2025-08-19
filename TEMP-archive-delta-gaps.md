## Archive Command (Delta-Based) — Gaps and Clarifications

### 1) New spec creation behavior (non-existent target spec)
- **Decision needed**: When a change adds requirements for a capability that does not yet exist in `openspec/specs/[capability]/spec.md`.
  - Option A: Require the change to include a full spec file (legacy copy) for brand-new capabilities.
  - Option B: Auto-generate a spec skeleton and insert ADDED requirements.
- If Option B:
  - Define default title and Purpose text.
  - Confirm skeleton format: `# [Capability] Specification`, `## Purpose`, `## Requirements`.

#### Recommendation
- Adopt Option B for new specs: auto-generate a minimal skeleton and insert ADDED requirements.
- Skeleton: `# [Spec Name] Specification`, `## Purpose` with "TBD — created by archiving change [changeName]. Update Purpose after archive.", `## Requirements`.
- For non-existent specs, only ADDED operations are allowed; if MODIFIED/REMOVED/RENAMED appear, abort with a clear message to create via ADDED-only first.

### 2) Requirement identification and parsing
- Use the exact header text as the unique key: `### Requirement: [Name]`.
- Normalize using trim-only: `normalize(header) = trim(header)`; compare with case-sensitive equality after normalization.
- Implement a requirement-block extractor that preserves the exact header string and captures the full block (including scenarios) for both main specs and delta files.
- Note: Current parser may derive requirement text from the first content line; do not use that for matching.

#### Recommendation
- Implement a dedicated extractor using regex for headers: `^###\s*Requirement:\s*(.+)$` and capture until next `###` (or higher) header.
- Match on the exact captured header string after trim; do not derive from body text.
- Use the same extractor for both main specs and delta files to ensure consistency.

### 3) Application order and atomicity
- Confirm order: **RENAMED → REMOVED → MODIFIED → ADDED**.
- Validate all deltas first; apply changes in-memory; write once per spec file.
- On any validation error, abort without writing partial results (all-or-nothing per spec and overall archive step).

#### Recommendation
- Keep the specified order.
- Stage updates in-memory per spec; if any spec fails validation, abort the entire operation with no writes.
- If all pass, write each affected spec once.

### 4) Validation matrix (complete set)
- MODIFIED/REMOVED headers must exist in the current spec (post-rename mapping where applicable).
- ADDED headers must not already exist in the target spec (consider post-rename state).
- RENAMED: `FROM` must exist; `TO` must not exist (including collisions with ADDED names).
- No duplicate requirement headers within a spec after applying all operations.
- A requirement cannot appear in conflicting sections (e.g., both MODIFIED and REMOVED; RENAMED and REMOVED; RENAMED and ADDED for the same logical item).

#### Recommendation
- Enforce all listed checks.
- Add cross-section conflict detection and evaluate header availability after applying rename mapping.
- Fail fast with a consolidated list of validation errors before any writes.

### 5) Idempotency and reruns
- Define behavior if deltas are applied more than once (e.g., CI reruns):
  - Option A: Detect no-ops and report zero operations.
  - Option B: Abort with a clear message (already applied) when preconditions fail (e.g., ADDED already exists).

#### Recommendation
- Keep it simple: choose Option B. Abort on precondition failure with explicit error messages. No no-op detection in v1.

### 6) Whitespace normalization scope
- Confirm normalization is strictly leading/trailing trim on headers.
- Internal whitespace and case are preserved; header comparisons are case-sensitive.

#### Recommendation
- Trim-only normalization; preserve case and internal whitespace. Do not alter content formatting.

### 7) Output and UX
- Per-spec counts using standard symbols: `+` added, `~` modified, `-` removed, `→` renamed.
- Show explicit conflict/error messages with the exact requirement headers involved.
- Confirm final output format and wording (example provided in conventions/specs).

#### Recommendation
- Print one block per spec with counts and symbols as defined; follow with a short aggregated totals line.
- Keep messages concise and actionable; no interactive diffs.

### 8) Multi-spec change sets
- Each spec is processed independently; validations consider the per-spec state after preceding operations (rename impacts subsequent operations for that spec).
- Provide an aggregated summary across all specs at the end (optional).

#### Recommendation
- Validate all specs first; if any fail, show grouped errors per spec and abort.
- On success, write all specs and print per-spec counts plus an aggregated summary.

### 9) Rename + modify interplay
- When a requirement is renamed and modified in the same change, modification should reference the NEW header; confirm this as the standard.

#### Recommendation
- Require MODIFIED entries to reference the NEW header when a rename exists for the same item in the change. If MODIFIED references the old name, fail with guidance to use the new header.

### 10) Error messaging
- Errors should be actionable and specific (e.g., "MODIFIED requirement not found: '### Requirement: X' in cli-archive").
- On abort, no files are written; clearly state that nothing changed.

#### Recommendation
- Standardize: `[spec] [operation] failed for header "### Requirement: X" — reason`.
- Conclude with: `Aborted. No files were changed.`

### 11) Testing coverage expectations
- Header normalization (trim-only) matching tests.
- Correct application order (RENAMED → REMOVED → MODIFIED → ADDED).
- Validation edge cases (missing headers, duplicates, rename collisions, conflicting sections).
- Rename+modify within the same change.
- New spec creation behavior (per decision in §1).
- Multi-spec mixed operations with cross-file independence.
- Optional: idempotent rerun behavior.

#### Recommendation
- Implement the minimal critical set: normalization, order, missing/duplicate/rename collision, rename+modify, new spec creation, and multi-spec success.
- Defer idempotent rerun tests until/if behavior expands.

### 12) Performance and file handling
- Process in-memory; write once per affected spec file.
- Preserve unrelated sections and original formatting outside requirement blocks as-is.

#### Recommendation
- Build updated files by splicing requirement blocks into the original text; avoid reformatting unrelated sections.
- Single write per spec using UTF-8.

### 13) Backward compatibility and enforcement
- All new changes must use delta format (per proposal). Clarify behavior if a change includes a full future-state spec instead of deltas:
  - Option: reject with guidance to convert to delta.
  - Option: fall back to legacy full-copy for brand-new specs only.

#### Recommendation
- Reject full future-state files for existing specs with a clear error and migration guidance to delta format.
- Allow ADDED-only deltas to create brand-new specs via skeleton (per §1). No legacy fallback.

### 14) Optional: dry-run mode
- Decide whether to support a `--dry-run` flag to show planned operations and conflicts without writing files.

#### Recommendation
- Defer. Do not implement `--dry-run` in v1 to keep scope lean. Consider later if users request preview capability.


