# CLI Archive Command Specification

## Purpose
The archive command moves completed changes from the active changes directory to the archive folder with date-based naming, following OpenSpec conventions.

## Command Syntax
```bash
openspec archive [change-name]
```

## Behavior

### Change Selection
WHEN no change-name is provided
THEN display interactive list of available changes (excluding archive/)
AND allow user to select one

WHEN change-name is provided
THEN use that change directly
AND validate it exists

### Task Completion Check
The command SHALL scan the change's tasks.md file for incomplete tasks (marked with `- [ ]`)

WHEN incomplete tasks are found
THEN display all incomplete tasks to the user
AND prompt for confirmation to continue
AND default to "No" for safety

WHEN all tasks are complete OR no tasks.md exists
THEN proceed with archiving without prompting

### Archive Process
The archive operation SHALL:
1. Create archive/ directory if it doesn't exist
2. Generate target name as `YYYY-MM-DD-[change-name]` using current date
3. Check if target directory already exists
4. Move the entire change directory to the archive location

WHEN target archive already exists
THEN fail with error message
AND do not overwrite existing archive

WHEN move succeeds
THEN display success message with archived name

## Error Handling

SHALL handle the following error conditions:
- Missing openspec/changes/ directory
- Change not found
- Archive target already exists
- File system permissions issues

## Why These Decisions

**Interactive selection**: Reduces typing and helps users see available changes
**Task checking**: Prevents accidental archiving of incomplete work
**Date prefixing**: Maintains chronological order and prevents naming conflicts
**No overwrite**: Preserves historical archives and prevents data loss