# Update Command Specification

## Purpose

As a developer using OpenSpec, I want to update the OpenSpec conventions and instructions in my project when new versions are released, so that I can benefit from improvements to AI agent instructions without losing my project-specific content.

## Core Requirements

### Update Behavior

The update command SHALL update OpenSpec instructions while preserving user-created content.

WHEN a user runs `openspec update` THEN the command SHALL:
- Check if the openspec directory exists
- Compare installed package version with project version
- Replace `openspec/README.md` with the latest template
- Update CLAUDE.md OpenSpec section (between markers) if file exists
- Save the new version to `.openspec/version`
- Display appropriate status message

### Version Tracking

The system SHALL track OpenSpec versions:
- WHEN initializing a project THEN save current version to `.openspec/version`
- WHEN updating THEN compare package version with project version
- IF versions match THEN inform user "Already up to date (vX.X.X)"
- IF versions differ THEN perform update
- IF `--force` flag used THEN skip version check and always update

### Content Preservation

WHEN updating files:
- `openspec/README.md` SHALL be completely replaced with latest template
- `CLAUDE.md` SHALL preserve all user content outside OpenSpec markers
- OpenSpec content SHALL be between `<!-- OPENSPEC:START -->` and `<!-- OPENSPEC:END -->`
- IF markers don't exist in CLAUDE.md THEN append new section with markers

### Command Options

The update command SHALL support:
- `--force` or `-f`: Force update regardless of version

### User Communication

The command SHALL provide clear feedback:
- "✓ Updated OpenSpec instructions to vX.X.X" on success
- "✓ Already up to date (vX.X.X)" when no update needed
- "No OpenSpec directory found. Run 'openspec init' first." when prerequisites missing
- Include file paths in error messages for permission issues

## Edge Cases

### Missing Version File
IF `.openspec/version` doesn't exist THEN treat as version 0.0.0 and proceed with update.

### Missing CLAUDE.md
IF `CLAUDE.md` doesn't exist THEN skip updating it and only update README.md.

### Malformed Versions
IF version format is invalid THEN treat as needing update.

### File Permissions
IF file write fails THEN display clear error with file path and exit with code 1.

## Success Criteria

Users SHALL be able to:
- Update OpenSpec instructions with a single command
- Preserve all their custom content in CLAUDE.md
- Force updates for testing or development
- Understand exactly what was updated

The update process SHALL be:
- Fast and reliable
- Non-destructive to user content
- Clear in its communication
- Require no network access (templates bundled)