# Add Update Command

## Why

Users need a way to update their local OpenSpec instructions (README.md and CLAUDE.md) when the OpenSpec package releases new versions with improved AI agent instructions or structural conventions, without losing their existing specs and project-specific content.

## What Changes

- Add new `openspec update` CLI command that updates OpenSpec instructions
- Track OpenSpec version in `.openspec/version` file during init
- Update `openspec/README.md` with latest template while preserving user specs
- Update CLAUDE.md OpenSpec section (between markers) while preserving user content
- Add `--force` flag to bypass version checking for development
- Display clear success/status messages

## Impact

- Affected specs: cli-update (new capability)
- Affected code: 
  - `src/cli/update.ts` (new file)
  - `src/cli/index.ts` (register new command)
  - `src/cli/init.ts` (save version during init)
  - `src/core/templates.ts` (update CLAUDE.md template handling)
  - `src/utils/version.ts` (new file for version management)