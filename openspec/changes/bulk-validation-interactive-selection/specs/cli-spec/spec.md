# CLI Spec Command Spec

## ADDED Requirements

### Requirement: Interactive spec validation

The spec validate command SHALL support interactive selection when no spec-id is provided.

#### Scenario: Interactive spec selection for validation

- **WHEN** executing `openspec spec validate` without arguments
- **THEN** display an interactive list of available specs
- **AND** allow the user to select a spec to validate
- **AND** validate the selected spec
- **AND** maintain all existing validation options (--strict, --json)

### Requirement: Interactive spec show

The spec show command SHALL support interactive selection when no spec-id is provided.

#### Scenario: Interactive spec selection for show

- **WHEN** executing `openspec spec show` without arguments
- **THEN** display an interactive list of available specs
- **AND** allow the user to select a spec to show
- **AND** display the selected spec content
- **AND** maintain all existing show options (--json, --requirements, --no-scenarios, -r)