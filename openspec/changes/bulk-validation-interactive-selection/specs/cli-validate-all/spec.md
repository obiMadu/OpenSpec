# CLI Validate-All Command Spec

## ADDED Requirements

### Requirement: Bulk validation command

The CLI SHALL provide a `validate-all` command that validates all changes and specs simultaneously.

#### Scenario: Validate all items

- **WHEN** executing `openspec validate-all`
- **THEN** validate all changes in openspec/changes/ (excluding archive)
- **AND** validate all specs in openspec/specs/
- **AND** display a summary showing passed/failed items
- **AND** exit with code 1 if any validation fails

### Requirement: Strict mode support

The `validate-all` command SHALL support a `--strict` flag for strict validation.

#### Scenario: Strict validation of all items

- **WHEN** executing `openspec validate-all --strict`
- **THEN** apply strict validation to all items
- **AND** treat warnings as errors
- **AND** fail if any item has warnings or errors

### Requirement: JSON output support

The `validate-all` command SHALL support a `--json` flag for structured output.

#### Scenario: JSON formatted bulk validation

- **WHEN** executing `openspec validate-all --json`
- **THEN** output validation results as JSON
- **AND** include detailed issues for each item
- **AND** include summary statistics

### Requirement: Progress indication

The `validate-all` command SHALL display progress during validation.

#### Scenario: Display validation progress

- **WHEN** validating many items
- **THEN** show progress indicator or status updates
- **AND** indicate which item is currently being validated