# CLI Diff Command Specification

## Purpose

The `openspec diff` command provides developers with a visual comparison between proposed spec changes and the current deployed specs.

## Command Syntax

```bash
openspec diff [change-name]
```
## Requirements
### Requirement: Without Arguments

The command SHALL provide an interactive selection when no change is specified.

#### Scenario: Running without arguments

- **WHEN** running `openspec diff` without arguments
- **THEN** list all available changes in the `changes/` directory (excluding archive)
- **AND** prompt user to select a change

### Requirement: With Change Name

The command SHALL compare specs when a specific change is provided.

#### Scenario: Running with change name

- **WHEN** running `openspec diff <change-name>`
- **THEN** compare all spec files in `changes/<change-name>/specs/` with corresponding files in `specs/`

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

### Requirement: Color Support

The command SHALL enhance readability with colors when supported.

#### Scenario: Terminal with color support

- **WHEN** terminal supports colors
- **THEN** display:
  - Removed lines in red
  - Added lines in green
  - File headers in bold
  - Context lines in default color

### Requirement: Error Handling

The command SHALL provide clear error messages for various failure conditions.

#### Scenario: Change not found

- **WHEN** specified change doesn't exist
- **THEN** display error "Change '<name>' not found"

#### Scenario: No specs in change

- **WHEN** no specs directory in change
- **THEN** display "No spec changes found for '<name>'"

#### Scenario: Missing changes directory

- **WHEN** changes directory doesn't exist
- **THEN** display "No OpenSpec changes directory found"

### Requirement: Validation

The command SHALL validate that changes can be applied successfully.

#### Scenario: Invalid delta references

- **WHEN** delta references non-existent requirement
- **THEN** show error message with specific requirement
- **AND** continue showing other valid changes
- **AND** clearly mark failed changes in the output

### Requirement: Diff Command Enhancement

The diff command SHALL validate change structure before displaying differences.

#### Scenario: Validate before diff

- **WHEN** executing `openspec diff change-name`
- **THEN** validate change structure
- **AND** show validation warnings if present
- **AND** continue with diff display

## Examples

```bash
# View diff for specific change
$ openspec diff add-auth-feature

--- specs/user-auth/spec.md
+++ changes/add-auth-feature/specs/user-auth/spec.md
@@ -10,6 +10,8 @@
 Users SHALL authenticate with email and password.
 
+Users MAY authenticate with OAuth providers.
+
 WHEN credentials are valid THEN issue JWT token.

# List all changes and select
$ openspec diff
Available changes:
  1. add-auth-feature
  2. update-payment-flow
  3. add-status-command
Select a change (1-3): 
```