# CLI Archive Command - Changes

## MODIFIED Requirements

### Requirement: Spec Update Process

Before moving the change to archive, the command SHALL apply delta changes to main specs to reflect the deployed reality.

#### Scenario: Applying delta changes

- **WHEN** archiving a change with delta-based specs
- **THEN** parse the change's spec files for ADDED/MODIFIED/REMOVED/RENAMED sections
- **AND** apply changes in this order:
  1. Process RENAMED sections - update requirement headers
  2. Process REMOVED sections - delete requirements by normalized header match
  3. Process MODIFIED sections - replace requirements by normalized header match
  4. Process ADDED sections - append new requirements to spec
- **AND** validate all operations before applying

#### Scenario: Validating delta changes

- **WHEN** processing delta changes
- **THEN** validate:
  - All MODIFIED requirements exist in current spec (by normalized header match)
  - All REMOVED requirements exist in current spec
  - All ADDED requirements don't already exist
  - RENAMED source headers exist in current spec
- **AND** if validation fails, show specific errors and abort

#### Scenario: Backward compatibility

- **WHEN** a change uses full future state format (no delta sections)
- **THEN** fall back to copying the entire spec file

#### Scenario: Conflict detection

- **WHEN** applying deltas would create duplicate requirement headers
- **THEN** abort with error message showing the conflict
- **AND** suggest manual resolution

### Requirement: Display Output

The command SHALL provide clear feedback about delta operations.

#### Scenario: Showing delta application

- **WHEN** applying delta changes
- **THEN** display for each spec:
  - Number of requirements added
  - Number of requirements modified
  - Number of requirements removed
  - Number of requirements renamed
- **AND** example output:
  ```
  Applying changes to specs/user-auth/spec.md:
    + 2 added
    ~ 3 modified
    - 1 removed
    → 1 renamed
  ```