# OpenSpec Change Validation Report

This report lists all active changes (`openspec change list`) and validates each with strict mode (`openspec change validate <id> --strict`). A change is valid only if it has no errors and no warnings in strict mode.

## Summary

- add-change-commands: INVALID (warnings: 3)
- add-skip-specs-archive-option: INVALID (errors: 1)
- add-spec-commands: INVALID (warnings: 2)
- add-zod-validation: INVALID (errors: 4, warnings: 7)
- adopt-delta-based-changes: INVALID (errors: 1)
- fix-update-tool-selection: INVALID (errors: 1)
- structured-spec-format: INVALID (errors: 1)

## Details

### add-change-commands
- valid: false
- summary: { errors: 0, warnings: 3, info: 0 }
- issues:
  - WARNING deltas[0].requirements: ADDED Delta should include requirements
  - WARNING deltas[1].requirements: ADDED Delta should include requirements
  - WARNING deltas[2].requirements: MODIFIED Delta should include requirements
- To fix:
  - Add `requirements` for each delta flagged above with at least one requirement item.

### add-skip-specs-archive-option
- valid: false
- summary: { errors: 1, warnings: 0, info: 0 }
- issues:
  - ERROR deltas: Change must have at least one delta
- To fix:
  - Add at least one `delta` describing the change, including `spec`, `operation`, `description`, and `requirements` (as appropriate).

### add-spec-commands
- valid: false
- summary: { errors: 0, warnings: 2, info: 0 }
- issues:
  - WARNING deltas[0].requirements: ADDED Delta should include requirements
  - WARNING deltas[1].requirements: ADDED Delta should include requirements
- To fix:
  - Add `requirements` for the above `ADDED` deltas.

### add-zod-validation
- valid: false
- summary: { errors: 4, warnings: 7, info: 0 }
- issues:
  - ERROR deltas.4.requirement.text: Requirement must contain SHALL or MUST keyword
  - ERROR deltas.4.requirement.scenarios: Requirement must have at least one scenario
  - ERROR deltas.8.requirement.text: Requirement must contain SHALL or MUST keyword
  - ERROR deltas.8.requirement.scenarios: Requirement must have at least one scenario
  - WARNING deltas[0].requirements: MODIFIED Delta should include requirements
  - WARNING deltas[1].requirements: MODIFIED Delta should include requirements
  - WARNING deltas[2].requirements: MODIFIED Delta should include requirements
  - WARNING deltas[3].requirements: MODIFIED Delta should include requirements
  - WARNING deltas[5].requirements: ADDED Delta should include requirements
  - WARNING deltas[6].requirements: MODIFIED Delta should include requirements
  - WARNING deltas[7].requirements: MODIFIED Delta should include requirements
- To fix:
  - For deltas 4 and 8: ensure the embedded requirement text includes SHALL or MUST and add at least one scenario.
  - Provide `requirements` arrays for all flagged deltas.

### adopt-delta-based-changes
- valid: false
- summary: { errors: 1, warnings: 0, info: 0 }
- issues:
  - ERROR file: Change must have a Why section
- To fix:
  - Add a `Why` section with at least 50 characters explaining the rationale.

### fix-update-tool-selection
- valid: false
- summary: { errors: 1, warnings: 0, info: 0 }
- issues:
  - ERROR deltas: Change must have at least one delta
- To fix:
  - Add at least one `delta` describing the change.

### structured-spec-format
- valid: false
- summary: { errors: 1, warnings: 0, info: 0 }
- issues:
  - ERROR deltas: Change must have at least one delta
- To fix:
  - Add at least one `delta` describing the change.

