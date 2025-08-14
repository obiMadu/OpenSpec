# CLI Diff Command - Changes

## MODIFIED Requirements

### Requirement: Diff Output

The command SHALL generate appropriate diff output for delta-based changes.

#### Scenario: Displaying delta changes

- **WHEN** change uses delta format (contains ADDED/MODIFIED/REMOVED/RENAMED sections)
- **THEN** display the delta sections directly with syntax highlighting:
  ```
  === specs/user-auth/spec.md ===
  
  ADDED Requirements:
  + ### Requirement: OAuth Support
  + Users SHALL authenticate via OAuth providers
  
  MODIFIED Requirements:
  ~ ### Requirement: Session Management
  ~ Sessions SHALL expire after 30 minutes (was 60)
  
  RENAMED Requirements:
  → ### Requirement: Basic Auth → Email Authentication
  
  REMOVED Requirements:
  - ### Requirement: Legacy Auth
  - Reason: Deprecated in favor of OAuth
  ```
- **AND** use symbols and colors:
  - `+` ADDED (green)
  - `~` MODIFIED (yellow)
  - `-` REMOVED (red)
  - `→` RENAMED (cyan)

#### Scenario: Backward compatibility with full state

- **WHEN** change uses full future state format (no delta sections)
- **THEN** fall back to traditional diff comparison
- **AND** show unified diff between full states

#### Scenario: Showing applied result

- **WHEN** user runs `openspec diff <change> --preview`
- **THEN** apply deltas to current spec in memory
- **AND** show unified diff of current vs result
- **AND** note this is a preview of the applied changes

### Requirement: Validation Display

The command SHALL validate and display issues with delta changes.

#### Scenario: Showing validation errors

- **WHEN** delta references non-existent requirements
- **THEN** display validation errors:
  ```
  Validation errors in specs/user-auth/spec.md:
    ✗ MODIFIED requirement not found: ### Requirement: Nonexistent
    ✗ REMOVED requirement not found: ### Requirement: Missing
  ```
- **AND** continue showing other changes despite errors
- **AND** exit with non-zero status