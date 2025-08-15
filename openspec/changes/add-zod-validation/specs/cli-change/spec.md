## ADDED Requirements

### Requirement: Change Validation

The system SHALL perform comprehensive runtime validation using Zod schemas for all change operations.

#### Scenario: Validate change with detailed errors

- **WHEN** executing `openspec change validate update`
- **THEN** parse and validate against Zod schema
- **AND** ensure deltas are well-formed
- **AND** provide specific validation errors