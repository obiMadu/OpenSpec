# OpenSpec Format Specification

This specification defines the standard format for writing OpenSpec specifications to ensure consistency, readability, and parseability.

## Purpose

OpenSpec specifications need a consistent structure that:
- Makes similar sections visually identifiable across different specs
- Enables reliable programmatic parsing
- Provides clear visual hierarchy
- Works well in both raw markdown and rendered views

## Format Structure

### Requirement: Section Headers

All specifications SHALL use structured headers with consistent prefixes to identify section types.

#### Scenario: Writing a new requirement section

- **WHEN** defining a new requirement in a specification
- **THEN** the section SHALL start with a level-3 heading using the format `### Requirement: [Name]`
- **AND** the requirement name SHALL be descriptive and concise
  - Use title case for the requirement name
  - Keep names under 50 characters when possible

#### Scenario: Documenting core behavior

- **WHEN** documenting the core behavior of a requirement
- **THEN** a SHALL statement MUST immediately follow the requirement heading
- **AND** the SHALL statement SHALL describe the fundamental behavior
  - Use present tense
  - Be specific and unambiguous
  - Focus on observable behavior

### Requirement: Scenario Documentation

Each requirement SHALL include scenario sections that describe specific behaviors and conditions.

#### Scenario: Adding a scenario to a requirement

- **WHEN** documenting a specific use case or condition
- **THEN** use a level-4 heading with format `#### Scenario: [Description]`
- **AND** the description SHALL be in natural language
  - Describe the context or situation being tested
  - Use present tense
  - Be specific about the conditions

#### Scenario: Writing scenario steps

- **WHEN** documenting the steps within a scenario
- **THEN** use bullet points for each step
- **AND** begin each bullet with a bold keyword:
  - **WHEN** for conditions or triggers
  - **THEN** for expected outcomes
  - **AND** for additional outcomes or conditions
  - **GIVEN** for initial state (optional)

#### Scenario: Adding detailed information

- **WHEN** a step requires additional detail or clarification
- **THEN** use sub-bullets under the main step
- **AND** maintain consistent indentation
  - Sub-bullets provide examples or specifics
  - Keep sub-bullets concise

### Requirement: Keyword Usage

Keywords SHALL be consistently formatted to provide visual structure and enable parsing.

#### Scenario: Formatting behavior keywords

- **WHEN** using behavior keywords in scenarios
- **THEN** the keywords SHALL be in bold using markdown syntax `**KEYWORD**`
- **AND** only these keywords SHALL be bolded at the start of bullets:
  - GIVEN
  - WHEN
  - THEN
  - AND
  - BUT
  - OR

#### Scenario: Using SHALL statements

- **WHEN** defining mandatory behavior
- **THEN** use SHALL in uppercase
- **AND** SHALL statements SHALL appear:
  - Immediately after requirement headings
  - Within THEN clauses when defining requirements

### Requirement: Document Structure

Specifications SHALL follow a consistent overall structure for maintainability.

#### Scenario: Creating a new specification file

- **WHEN** creating a new OpenSpec specification
- **THEN** the document SHALL include:
  - A level-1 heading with the specification title
  - An optional introduction section explaining purpose
  - Multiple requirement sections following the format
- **AND** requirements SHALL be ordered logically
  - Group related requirements together
  - Order from general to specific
  - Consider dependencies between requirements

#### Scenario: Organizing complex specifications

- **WHEN** a specification covers multiple domains or components
- **THEN** use level-2 headings to group related requirements
- **AND** maintain the requirement format within each group
  - Each group represents a logical boundary
  - Groups can have their own introduction text

## Migration Guide

### Requirement: Updating Existing Specifications

Existing specifications SHALL be updated to follow the new format when modified.

#### Scenario: Converting an existing specification

- **WHEN** making changes to a specification not using the new format
- **THEN** update the affected sections to follow the structured format
- **AND** ensure all requirements in the modified section are converted
  - Add "Requirement:" prefix to section headers
  - Add "Scenario:" prefix to use case descriptions
  - Bold the behavior keywords
  - Ensure SHALL statements follow requirement headings

#### Scenario: Gradual migration

- **WHEN** a specification is too large to convert at once
- **THEN** convert sections incrementally as they are modified
- **AND** add a comment indicating partial conversion status
  - Note which sections have been converted
  - Track migration progress in change documentation