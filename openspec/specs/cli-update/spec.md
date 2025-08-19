# Update Command Specification

## Purpose

As a developer using OpenSpec, I want to update the OpenSpec instructions in my project when new versions are released, so that I can benefit from improvements to AI agent instructions.
## Requirements
### Requirement: Update Behavior

The update command SHALL update OpenSpec instruction files to the latest templates in a team-friendly manner.

#### Scenario: Running update command

- **WHEN** a user runs `openspec update`
- **THEN** the command SHALL:
  - Check if the `openspec` directory exists
  - Replace `openspec/README.md` with the latest template (complete replacement)
  - Update **only existing** AI tool configuration files (e.g., CLAUDE.md)
    - Check each registered AI tool configurator
    - For each configurator, check if its file exists
    - Update only files that already exist using their markers
    - Preserve user content outside markers
    - **Never create new AI tool configuration files**
  - Display success message listing updated files

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
- **AND** update only the OpenSpec-managed blocks in **existing** AI tool files using markers
- **AND** use the default directory name `openspec`
- **AND** be idempotent (repeated runs have no additional effect)
- **AND** respect team members' AI tool choices by not creating unwanted files

### Requirement: Tool-Agnostic Updates

The update command SHALL update only existing AI tool configuration files and SHALL NOT create new ones.

#### Scenario: Updating existing tool files

- **WHEN** a user runs `openspec update`
- **THEN** update each AI tool configuration file that exists (e.g., CLAUDE.md, COPILOT.md)
- **AND** do not create missing tool configuration files
- **AND** preserve user content outside OpenSpec markers

### Requirement: Core Files Always Updated

The update command SHALL always update the core OpenSpec files and display an ASCII-safe success message.

#### Scenario: Successful update

- **WHEN** the update completes successfully
- **THEN** replace `openspec/README.md` with the latest template
- **AND** update existing AI tool configuration files within markers
- **AND** display the message: "Updated OpenSpec instructions"

## Edge Cases

### Requirement: Error Handling

The command SHALL handle edge cases gracefully.

#### Scenario: File permission errors

- **WHEN** file write fails
- **THEN** let the error bubble up naturally with file path

#### Scenario: Missing AI tool files

- **WHEN** an AI tool configuration file doesn't exist
- **THEN** skip updating that file
- **AND** do not create it

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