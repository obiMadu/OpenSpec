# OpenSpec Conventions - Changes

## ADDED Requirements

### Requirement: Header-Based Requirement Identification

Requirement headers SHALL serve as unique identifiers for programmatic matching between current specs and proposed changes.

#### Scenario: Matching requirements programmatically

- **WHEN** processing delta changes
- **THEN** use the `### Requirement: [Name]` header as the unique identifier
- **AND** match requirements by exact header text comparison
- **AND** treat headers as case-sensitive identifiers

#### Scenario: Handling requirement renames

- **WHEN** renaming a requirement
- **THEN** use a special `## RENAMED Requirements` section
- **AND** specify both old and new names explicitly:
  ```markdown
  ## RENAMED Requirements
  - FROM: `### Requirement: Old Name`
  - TO: `### Requirement: New Name`
  ```
- **AND** include the renamed requirement under MODIFIED if content also changes

#### Scenario: Validating header uniqueness

- **WHEN** creating or modifying requirements
- **THEN** ensure no duplicate headers exist within a spec
- **AND** validation tools SHALL flag duplicate headers as errors

## MODIFIED Requirements

### Requirement: Change Storage Convention

Change proposals SHALL store only the additions, modifications, and removals to specifications, not complete future states.

#### Scenario: Creating change proposals with additions

- **WHEN** creating a change proposal that adds new requirements
- **THEN** include only the new requirements under `## ADDED Requirements`
- **AND** each requirement SHALL be complete and self-contained
- **AND** use the standard structured format for requirements and scenarios

#### Scenario: Creating change proposals with modifications  

- **WHEN** creating a change proposal that modifies existing requirements
- **THEN** include the modified requirements under `## MODIFIED Requirements`
- **AND** use the EXACT same header text as in the current spec
- **AND** include the complete modified requirement (not a diff)
- **AND** optionally annotate what changed with inline comments like `← (was X)`

#### Scenario: Creating change proposals with removals

- **WHEN** creating a change proposal that removes requirements
- **THEN** list them under `## REMOVED Requirements`
- **AND** use the exact header text for identification
- **AND** include reason for removal
- **AND** document any migration path if applicable

#### Scenario: Handling structural reorganization

- **WHEN** a change completely restructures a specification
- **THEN** use `## RESTRUCTURED Specification` marker
- **AND** include the complete new structure
- **AND** document in proposal.md why complete restructuring is necessary

The `changes/[name]/specs/` directory SHALL contain:
- Delta files showing only what changes
- Sections for ADDED, MODIFIED, REMOVED, and RENAMED requirements
- Exact header matching for requirement identification
- Self-contained requirements using the structured format
- Clear indication of change type for each requirement

### Requirement: Archive Process Enhancement

The archive process SHALL programmatically apply delta changes to current specifications using header-based matching.

#### Scenario: Archiving changes with deltas

- **WHEN** archiving a completed change
- **THEN** the archive command SHALL:
  1. Parse RENAMED sections first and apply renames
  2. Parse REMOVED sections and remove by exact header match
  3. Parse MODIFIED sections and replace by exact header match
  4. Parse ADDED sections and append new requirements
- **AND** validate that all MODIFIED/REMOVED headers exist in current spec
- **AND** validate that ADDED headers don't already exist
- **AND** generate the updated spec in the main specs/ directory

#### Scenario: Handling conflicts during archive

- **WHEN** delta changes conflict with current spec state
- **THEN** the archive command SHALL report specific conflicts
- **AND** require manual resolution before proceeding
- **AND** provide clear guidance on resolving conflicts

## REMOVED Requirements

### Requirement: Future State Storage

**Reason for removal**: Replaced by delta-based change storage which provides better review experience and clearer change tracking.

**Migration path**: Existing changes using full future states remain valid. New changes should use delta format. The archive command supports both formats during transition.