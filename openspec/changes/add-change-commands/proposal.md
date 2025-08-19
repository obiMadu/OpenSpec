# Change: Add Change Commands with JSON Output

## Why

OpenSpec change proposals currently can only be viewed as markdown files, creating the same programmatic access limitations as specs. Additionally, the current `openspec list` command only lists changes, which is inconsistent with the new resource-based command structure.

## What Changes

- **cli-change:** Add new command for managing change proposals with show, list, and validate subcommands
- **cli-list:** Add deprecation notice for legacy list command to guide users to the new change list command

## ADDED Requirements

### Requirement: Change Command

The system SHALL provide a `change` command with subcommands for displaying, listing, and validating change proposals.

#### Scenario: Show change as JSON

- **WHEN** executing `openspec change show <name> --json`
- **THEN** parse the markdown change file
- **AND** extract change structure and deltas
- **AND** output valid JSON to stdout

#### Scenario: List all changes

- **WHEN** executing `openspec change list`
- **THEN** scan the openspec/changes directory
- **AND** return list of all pending changes
- **AND** support JSON output with `--json` flag

#### Scenario: Validate change structure

- **WHEN** executing `openspec change validate <name>`
- **THEN** parse the change file
- **AND** validate against Zod schema
- **AND** ensure deltas are well-formed

## Impact

- **Affected specs**: cli-list (modify to add deprecation notice)
- **Affected code**:
  - src/cli/index.ts (register new command)
  - src/core/list.ts (add deprecation notice)