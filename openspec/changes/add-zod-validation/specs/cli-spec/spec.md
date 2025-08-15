## ADDED Requirements

### Requirement: Runtime Validation

The system SHALL perform comprehensive runtime validation using Zod schemas for all spec operations.

#### Scenario: Validate spec with detailed errors

- **WHEN** executing `openspec spec validate init`
- **THEN** parse and validate against Zod schema
- **AND** report specific field-level errors
- **AND** provide actionable error messages

#### Scenario: Validate in strict mode

- **WHEN** executing `openspec spec validate init --strict`
- **THEN** fail on both errors and warnings
- **AND** return non-zero exit code for warnings

#### Scenario: JSON validation report

- **WHEN** executing `openspec spec validate init -j`
- **THEN** output structured validation report
- **AND** include issue level, path, and message
- **AND** provide summary counts