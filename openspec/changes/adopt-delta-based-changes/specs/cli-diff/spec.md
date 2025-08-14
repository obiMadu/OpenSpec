# CLI Diff Command - Changes

## MODIFIED Requirements

### Requirement: Diff Output

The command SHALL show a requirement-level comparison displaying only changed requirements.

#### Scenario: Side-by-side comparison of changes

- **WHEN** running `openspec diff <change>`
- **THEN** display only requirements that have changed
- **AND** show them in side-by-side format:
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

### Requirement: Validation

The command SHALL validate that changes can be applied successfully.

#### Scenario: Invalid delta references

- **WHEN** delta references non-existent requirement
- **THEN** show error message with specific requirement
- **AND** continue showing other valid changes
- **AND** mark failed changes in output:
  ```
  ### Requirement: Nonexistent Feature    | [ERROR: Not found in current spec]
  ```