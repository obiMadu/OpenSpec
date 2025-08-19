# CLI Validate Command Spec

## ADDED Requirements

### Requirement: Interactive validation command

The CLI SHALL provide a top-level `validate` command with interactive selection.

#### Scenario: Interactive validation type selection

- **WHEN** executing `openspec validate` without arguments
- **THEN** prompt user to select validation type (all, changes, specs)
- **AND** if "all" is selected, perform bulk validation like validate-all
- **AND** if "changes" is selected, show list of changes to validate
- **AND** if "specs" is selected, show list of specs to validate
- **AND** perform validation on selected items

### Requirement: Support validation options

The interactive `validate` command SHALL support standard validation options.

#### Scenario: Strict mode with interactive selection

- **WHEN** executing `openspec validate --strict`
- **THEN** apply strict mode to the validation
- **AND** maintain interactive selection flow

#### Scenario: JSON output with interactive selection

- **WHEN** executing `openspec validate --json`
- **THEN** output results in JSON format
- **AND** maintain interactive selection flow