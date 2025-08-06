# Add Update Command

## Why

Users need a way to update their local OpenSpec instructions (README.md and CLAUDE.md) when the OpenSpec package releases new versions with improved AI agent instructions or structural conventions.

## What Changes

- Add new `openspec update` CLI command that updates OpenSpec instructions
- Replace `openspec/README.md` with latest template
- Replace CLAUDE.md with latest template (complete replacement)
- Display success message after update

## Impact

- Affected specs: cli-update (new capability)
- Affected code: 
  - `src/cli/update.ts` (new file)
  - `src/cli/index.ts` (register new command)