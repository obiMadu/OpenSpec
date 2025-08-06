# Update Command Specification

## Purpose

As a developer using OpenSpec, I want to update the OpenSpec instructions in my project when new versions are released, so that I can benefit from improvements to AI agent instructions.

## Core Requirements

### Update Behavior

The update command SHALL replace OpenSpec instruction files with the latest templates.

WHEN a user runs `openspec update` THEN the command SHALL:
- Check if the openspec directory exists
- Replace `openspec/README.md` with the latest template
- Replace `CLAUDE.md` with the latest template
- Display success message: "✓ Updated OpenSpec instructions"

### Prerequisites

The command SHALL require:
- An existing openspec directory (created by `openspec init`)

IF the openspec directory does not exist THEN:
- Display error: "No OpenSpec directory found. Run 'openspec init' first."
- Exit with code 1

### File Handling

The update command SHALL:
- Completely replace both files with latest templates
- Use the configured directory name in templates
- Not preserve any existing content (clean replacement)

## Edge Cases

### File Permissions
IF file write fails THEN let the error bubble up naturally with file path.

### Missing CLAUDE.md
IF CLAUDE.md doesn't exist THEN create it with the template content.

### Custom Directory Name
The command SHALL use the directory name from `.openspec/config.json` if it exists.

## Success Criteria

Users SHALL be able to:
- Update OpenSpec instructions with a single command
- Get the latest AI agent instructions
- See clear confirmation of the update

The update process SHALL be:
- Simple and fast (no version checking)
- Predictable (same result every time)
- Self-contained (no network required)