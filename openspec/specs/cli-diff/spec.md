# CLI Diff Command Specification

## Purpose

The `openspec diff` command provides developers with a visual comparison between proposed spec changes and the current deployed specs.

## Command Syntax

```bash
openspec diff [change-name]
```

## Behavior

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

The command SHALL generate appropriate diff output for all spec changes.

#### Scenario: Comparing existing files

- **WHEN** file exists in both locations
- **THEN** show unified diff

#### Scenario: New files

- **WHEN** file only exists in change
- **THEN** show as new file (all lines with +)

#### Scenario: Deleted files

- **WHEN** file only exists in current specs
- **THEN** show as deleted (all lines with -)

### Requirement: Display Format

The command SHALL use standard unified diff format for consistency with existing tools.

#### Scenario: Formatting diff output

- **WHEN** displaying diff output
- **THEN** use standard unified diff format:
  - Lines prefixed with `-` for removed content
  - Lines prefixed with `+` for added content
  - Lines without prefix for unchanged context
  - File headers showing the paths being compared

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