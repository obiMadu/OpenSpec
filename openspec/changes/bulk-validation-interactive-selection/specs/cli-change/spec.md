# CLI Change Command Spec

## ADDED Requirements

### Requirement: Interactive validation selection

The change validate command SHALL support interactive selection when no change name is provided.

#### Scenario: Interactive change selection for validation

- **WHEN** executing `openspec change validate` without arguments
- **THEN** display an interactive list of available changes
- **AND** allow the user to select a change to validate
- **AND** validate the selected change

### Requirement: Interactive show selection  

The change show command SHALL support interactive selection when no change name is provided.

#### Scenario: Interactive change selection for show

- **WHEN** executing `openspec change show` without arguments
- **THEN** display an interactive list of available changes
- **AND** allow the user to select a change to show
- **AND** display the selected change content