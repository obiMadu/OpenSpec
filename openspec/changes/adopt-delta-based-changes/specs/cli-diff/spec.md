# CLI Diff Command - Changes

## REMOVED Requirements

### Requirement: Display Format

**Reason for removal**: The standard unified diff format is replaced by requirement-level side-by-side comparison that better shows semantic changes rather than line-by-line text differences.

## MODIFIED Requirements

### Requirement: Diff Output

The command SHALL show a requirement-level comparison displaying only changed requirements.

#### Scenario: Side-by-side comparison of changes

- **WHEN** running `openspec diff <change>`
- **THEN** display only requirements that have changed
- **AND** show them in a side-by-side format that:
  - Clearly shows the current version on the left
  - Shows the future version on the right
  - Indicates new requirements (not in current)
  - Indicates removed requirements (not in future)
  - Aligns modified requirements for easy comparison

### Requirement: Validation

The command SHALL validate that changes can be applied successfully.

#### Scenario: Invalid delta references

- **WHEN** delta references non-existent requirement
- **THEN** show error message with specific requirement
- **AND** continue showing other valid changes
- **AND** clearly mark failed changes in the output