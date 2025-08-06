# Add Status Command to OpenSpec CLI

## Why

Developers need visibility into the state of their OpenSpec changes to know what needs attention. Currently, there's no easy way to see which changes are ready for archiving, which are in progress, or which have incomplete tasks. A status command would provide immediate visibility and guide developers on next actions.

## What Changes

- Add `openspec status` command to show the state of all changes
- Display changes categorized as: ready to archive, in progress, and recently archived
- Parse `tasks.md` files to detect task completion status (supports `[x]`, `[X]`, `[ ]` patterns)
- Show actionable information: task counts, age of changes, suggested next steps
- Support both summary and detailed views with `--detailed` flag
- Include smart detection of common task format variations for robustness
- Skip false positives in code blocks and example sections

## Impact

- Affected specs: New capability `cli-status` will be added
- Affected code:
  - `src/cli/index.ts` - Add status command registration
  - `src/core/status.ts` - New file with status detection logic
  - `src/utils/task-parser.ts` - New file for robust task parsing
  - `src/utils/file-system.ts` - Extend with directory scanning utilities