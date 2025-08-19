# CLI Show Command Spec

## ADDED Requirements

### Requirement: Interactive show command

The CLI SHALL provide a top-level `show` command with interactive selection.

#### Scenario: Interactive item selection

- **WHEN** executing `openspec show` without arguments
- **THEN** prompt user to select item type (change or spec)
- **AND** show list of available items for selected type
- **AND** display selected item content

### Requirement: Support show options

The interactive `show` command SHALL support standard display options.

#### Scenario: JSON output with interactive selection

- **WHEN** executing `openspec show --json`
- **THEN** output the selected item in JSON format
- **AND** maintain all existing JSON formatting options for the item type