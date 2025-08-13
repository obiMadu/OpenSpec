# Update Command Specification

## Purpose

As a developer using OpenSpec, I want to update the OpenSpec instructions in my project when new versions are released, so that I can benefit from improvements to AI agent instructions.

## Core Requirements

### Requirement: Update Behavior

The update command SHALL update OpenSpec instruction files to the latest templates.

#### Scenario: Running update command

- **WHEN** a user runs `openspec update`
- **THEN** the command SHALL:
  - Check if the `openspec` directory exists
  - Replace `openspec/README.md` with the latest template (complete replacement)
  - Update the OpenSpec-managed block in `CLAUDE.md` using markers
    - Preserve user content outside markers
    - Create `CLAUDE.md` if missing
  - Display ASCII-safe success message: "Updated OpenSpec instructions"

### Requirement: Prerequisites

The command SHALL require an existing OpenSpec structure before allowing updates.

#### Scenario: Checking prerequisites

- **GIVEN** the command requires an existing `openspec` directory (created by `openspec init`)
- **WHEN** the `openspec` directory does not exist
- **THEN** display error: "No OpenSpec directory found. Run 'openspec init' first."
- **AND** exit with code 1

### Requirement: File Handling

The update command SHALL handle file updates in a predictable and safe manner.

#### Scenario: Updating files

- **WHEN** updating files
- **THEN** completely replace `openspec/README.md` with the latest template
- **AND** update only the OpenSpec-managed block in `CLAUDE.md` using markers
- **AND** use the default directory name `openspec`
- **AND** be idempotent (repeated runs have no additional effect)

## Edge Cases

### Requirement: Error Handling

The command SHALL handle edge cases gracefully.

#### Scenario: File permission errors

- **WHEN** file write fails
- **THEN** let the error bubble up naturally with file path

#### Scenario: Missing CLAUDE.md

- **WHEN** CLAUDE.md doesn't exist
- **THEN** create it with the template content

#### Scenario: Custom directory names

- **WHEN** considering custom directory names
- **THEN** not supported in this change
- **AND** the default directory name `openspec` SHALL be used

## Success Criteria

Users SHALL be able to:
- Update OpenSpec instructions with a single command
- Get the latest AI agent instructions
- See clear confirmation of the update

The update process SHALL be:
- Simple and fast (no version checking)
- Predictable (same result every time)
- Self-contained (no network required)