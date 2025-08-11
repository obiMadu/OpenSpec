# Add Status Command to OpenSpec CLI

## Why

Developers need to know which changes have all tasks completed and are ready to archive.

## What Changes

- Add `openspec status` command that scans the changes/ directory
- Parse each tasks.md file to count `[x]` (complete) and `[ ]` (incomplete) tasks
- Display each change with its completion status (e.g., "auth-feature: 5/5" or "auth-feature: ✓")
- Skip the archive/ subdirectory

## Impact

- Affected specs: New capability `cli-status` will be added
- Affected code:
  - `src/cli/index.ts` - Add status command
  - `src/core/status.ts` - New file with simple scanning and parsing logic (~50 lines)