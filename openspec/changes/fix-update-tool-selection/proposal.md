# Fix Update Command Tool Selection

## Problem

The `openspec update` command currently forces the creation/update of CLAUDE.md regardless of which AI tool was selected during initialization. This violates the tool-agnostic design principle and creates confusion for users who selected different AI assistants.

Additionally, different team members may use different AI tools, so we cannot rely on a shared configuration file.

## Solution

Modify the update command to:
1. Only update AI tool configuration files that already exist
2. Never create new AI tool configuration files
3. Always update the core OpenSpec files (README.md, etc.)

## Implementation

- Remove hardcoded CLAUDE.md update from update command
- Implement file existence check before updating any AI tool config
- Update each existing AI tool config file with its appropriate markers
- No configuration file needed (avoids team conflicts)

## Success Criteria

- Update command only modifies existing AI tool configuration files
- No new AI tool files created during update
- Team members can use different AI tools without conflicts
- Existing projects continue to work (backward compatibility)

## Why

Users need predictable, tool-agnostic behavior from `openspec update`. Creating or forcing updates for AI tool files that a project does not use causes confusion and merge conflicts. Restricting updates to existing files and always updating core OpenSpec files keeps the workflow consistent for mixed-tool teams.

## What Changes

- **cli-update:** Modify update behavior to update only existing AI tool configuration files and never create new ones; always update core OpenSpec files and display an ASCII-safe success message.

## ADDED Requirements

### Requirement: Tool-Agnostic Update Behavior

The update command SHALL update only existing AI tool configuration files and SHALL NOT create new ones.

#### Scenario: Update only existing tool files

- **WHEN** running `openspec update`
- **THEN** update each AI tool configuration file that exists
- **AND** do not create missing tool configuration files

### Requirement: Preserve OpenSpec Files

The update command SHALL always update core OpenSpec files and display a clear, ASCII-safe success message.

#### Scenario: Successful update

- **WHEN** the update completes successfully
- **THEN** replace `openspec/README.md`
- **AND** update existing AI tool configuration files within markers
- **AND** display the message: "Updated OpenSpec instructions"