# CLI Diff Command - Changes

## MODIFIED Requirements

### Requirement: Diff Output

The command SHALL show a requirement-level comparison between current and future specs.

#### Scenario: Default side-by-side comparison

- **WHEN** running `openspec diff <change>`
- **THEN** apply deltas to generate future state
- **AND** display requirement-level side-by-side comparison:
  ```
  === specs/user-auth/spec.md ===
  
  CURRENT                                  | AFTER CHANGE
  ─────────────────────────────────────────┼─────────────────────────────────────────
  ### Requirement: Session Management      | ### Requirement: Session Management
  Sessions SHALL expire after 60 minutes   | Sessions SHALL expire after 30 minutes
  of inactivity.                          | of inactivity.
                                          |
                                          | ### Requirement: OAuth Support     [NEW]
                                          | Users SHALL authenticate via OAuth
                                          | providers including Google.
                                          |
  ### Requirement: Legacy Auth            | [REMOVED]
  Support for legacy authentication.      |
  ```

#### Scenario: Showing only changes with --changes-only flag

- **WHEN** running `openspec diff <change> --changes-only`
- **THEN** hide unchanged requirements
- **AND** show only added, modified, or removed requirements

#### Scenario: Traditional diff with --unified flag

- **WHEN** running `openspec diff <change> --unified`
- **THEN** show traditional unified diff format
- **AND** useful for CI/CD tools expecting standard diff output

### Requirement: Change Format Handling

The command SHALL handle both delta and full-state change formats.

#### Scenario: Processing delta format

- **WHEN** change uses delta format (ADDED/MODIFIED/REMOVED sections)
- **THEN** apply deltas to current spec to generate future state
- **AND** show requirement-level comparison

#### Scenario: Processing full-state format

- **WHEN** change contains complete future state
- **THEN** parse both current and future specs
- **AND** show requirement-level comparison

### Requirement: Validation

The command SHALL validate that deltas can be applied successfully.

#### Scenario: Invalid delta references

- **WHEN** delta references non-existent requirement
- **THEN** show error message with specific requirement
- **AND** continue showing other valid changes
- **AND** mark failed changes in output:
  ```
  ### Requirement: Nonexistent Feature    | [ERROR: Not found in current spec]
  ```