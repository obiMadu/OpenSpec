## Why
Need a command to archive completed changes to the archive folder with proper date prefixing, following OpenSpec conventions. Currently changes must be manually moved and renamed.

## What Changes
- Add new `archive` command to CLI that moves changes to `changes/archive/YYYY-MM-DD-[change-name]/`
- Check for incomplete tasks before archiving and warn user
- Allow interactive selection of change to archive
- Prevent archiving if target directory already exists

## Impact
- Affected specs: cli-archive (new)
- Affected code: src/cli/index.ts, src/core/archive.ts (new)