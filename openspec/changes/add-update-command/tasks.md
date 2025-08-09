# Implementation Tasks

## 1. Update Command Implementation
- [ ] 1.1 Create `src/core/update.ts` with `UpdateCommand` class
- [ ] 1.2 Check if `openspec` directory exists (use `FileSystemUtils.directoryExists`)
- [ ] 1.3 Write `readmeTemplate` to `openspec/README.md` using `FileSystemUtils.writeFile`
- [ ] 1.4 Update `CLAUDE.md` using markers via `FileSystemUtils.updateFileWithMarkers` and `TemplateManager.getClaudeTemplate()`
- [ ] 1.5 Display ASCII-safe success message: `Updated OpenSpec instructions`

## 2. CLI Integration
- [ ] 2.1 Register `update` command in `src/cli/index.ts`
- [ ] 2.2 Add command description: `Update OpenSpec instruction files`
- [ ] 2.3 Handle errors with `ora().fail(...)` and exit code 1 (missing `openspec` directory, file write errors)

## 3. Testing
- [ ] 3.1 Verify `openspec/README.md` is fully replaced with latest template
- [ ] 3.2 Verify `CLAUDE.md` OpenSpec block updates without altering user content outside markers
- [ ] 3.3 Verify idempotency (running twice yields identical files, no duplicate markers)
- [ ] 3.4 Verify error when `openspec` directory is missing with friendly message
- [ ] 3.5 Verify success message displays properly in ASCII-only terminals