# List Command Specification

## Purpose

The `openspec list` command SHALL provide developers with a quick overview of all active changes in the project, showing their names and task completion status.

## Requirements

### Requirement: Command Execution

The command SHALL scan and analyze all active changes to provide a comprehensive overview.

#### Scenario: Scanning for changes

- **WHEN** `openspec list` is executed
- **THEN** scan the `openspec/changes/` directory for change directories
- **AND** exclude the `archive/` subdirectory from results
- **AND** parse each change's `tasks.md` file to count task completion

### Requirement: Task Counting

The command SHALL accurately count task completion status using standard markdown checkbox patterns.

#### Scenario: Counting tasks in tasks.md

- **WHEN** parsing a `tasks.md` file
- **THEN** count tasks matching these patterns:
  - Completed: Lines containing `- [x]`
  - Incomplete: Lines containing `- [ ]`
- **AND** calculate total tasks as the sum of completed and incomplete

### Requirement: Output Format

The command SHALL display changes in a clear, readable table format with progress indicators.

#### Scenario: Displaying change list

- **WHEN** displaying the list
- **THEN** show a table with columns:
  - Change name (directory name)
  - Task progress (e.g., "3/5 tasks" or "✓ Complete")
- **AND** use status indicators:
  - `✓` for fully completed changes (all tasks done)
  - Progress fraction for partial completion

Example output:
```
Changes:
  add-auth-feature     3/5 tasks
  update-api-docs      ✓ Complete
  fix-validation       0/2 tasks
  add-list-command     1/4 tasks
```

### Requirement: Empty State

The command SHALL provide clear feedback when no active changes are present.

#### Scenario: Handling empty state

- **WHEN** no active changes exist (only archive/ or empty changes/)
- **THEN** display: "No active changes found."

### Requirement: Error Handling

The command SHALL gracefully handle missing files and directories with appropriate messages.

#### Scenario: Missing tasks.md file

- **WHEN** a change directory has no `tasks.md` file
- **THEN** display the change with "No tasks" status

#### Scenario: Missing changes directory

- **WHEN** `openspec/changes/` directory doesn't exist
- **THEN** display error: "No OpenSpec changes directory found. Run 'openspec init' first."
- **AND** exit with code 1

### Requirement: Sorting

The command SHALL maintain consistent ordering of changes for predictable output.

#### Scenario: Ordering changes

- **WHEN** displaying multiple changes
- **THEN** sort them in alphabetical order by change name

## Why

Developers need a quick way to:
- See what changes are in progress
- Identify which changes are ready to archive
- Understand the overall project evolution status
- Get a bird's-eye view without opening multiple files

This command provides that visibility with minimal effort, following OpenSpec's philosophy of simplicity and clarity.