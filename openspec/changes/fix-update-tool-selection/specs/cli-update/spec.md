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
  - For each supported AI tool configuration file:
    - Check if the file exists (e.g., CLAUDE.md, COPILOT.md)
    - If it exists, update it using appropriate markers
    - If it doesn't exist, skip it (do NOT create)
    - Preserve user content outside markers
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
- **AND** update only the AI tool configuration files that already exist
- **AND** use the default directory name `openspec`
- **AND** be idempotent (repeated runs have no additional effect)

### Requirement: Tool-Agnostic Updates

The update command SHALL work for any team member regardless of their AI tool choice.

#### Scenario: Team member using Claude

- **GIVEN** a team member has CLAUDE.md in their project
- **WHEN** running `openspec update`
- **THEN** update the CLAUDE.md file with the latest template
- **AND** preserve user content outside OpenSpec markers
- **AND** NOT create files for other tools

#### Scenario: Team member using different tool

- **GIVEN** a team member has COPILOT.md but no CLAUDE.md
- **WHEN** running `openspec update`
- **THEN** update the COPILOT.md file if implementation exists
- **AND** NOT create CLAUDE.md
- **AND** preserve user content outside OpenSpec markers

#### Scenario: Mixed team environment

- **GIVEN** a repository with both CLAUDE.md and COPILOT.md (different team members)
- **WHEN** any team member runs `openspec update`
- **THEN** update all existing AI tool configuration files
- **AND** NOT create new AI tool configuration files
- **AND** each team member's preferred tool remains configured

## Edge Cases

### Requirement: Error Handling

The command SHALL handle edge cases gracefully.

#### Scenario: File permission errors

- **WHEN** file write fails
- **THEN** let the error bubble up naturally with file path

#### Scenario: No AI tool files exist

- **GIVEN** no AI tool configuration files exist
- **WHEN** running update
- **THEN** only update openspec/README.md
- **AND** display success message

#### Scenario: Custom directory names

- **WHEN** considering custom directory names
- **THEN** not supported in this change
- **AND** the default directory name `openspec` SHALL be used

## Success Criteria

Users SHALL be able to:
- Update OpenSpec instructions with a single command
- Get the latest AI agent instructions for their existing tools
- Work in teams where members use different AI tools
- NOT have unwanted AI tool configuration files created

The update process SHALL be:
- Simple and fast (no version checking)
- Predictable (same result every time)
- Self-contained (no network required)
- Team-friendly (respects individual tool choices)