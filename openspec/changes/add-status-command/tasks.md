# Implementation Tasks for Status Command

## Core Implementation
- [ ] Add status command to `src/cli/index.ts`
- [ ] Create `src/core/status.ts` with directory scanning logic
- [ ] Parse tasks.md files to count `[x]` and `[ ]` patterns
- [ ] Display each change with completion status (name: complete/total)
- [ ] Skip the archive/ subdirectory when scanning