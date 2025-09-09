# Remove Diff Command - Tasks

## 1. Remove Core Implementation
- [ ] Delete `/src/core/diff.ts`
- [ ] Remove DiffCommand import from `/src/cli/index.ts`
- [ ] Remove diff command registration from CLI

## 2. Remove Specifications
- [ ] Delete `/openspec/specs/cli-diff/spec.md`
- [ ] Archive the spec for historical reference if needed

## 3. Update Dependencies
- [ ] Remove jest-diff from package.json dependencies
- [ ] Run pnpm install to update lock file

## 4. Update Documentation
- [ ] Update main README.md to remove diff command references
- [ ] Update openspec/README.md to remove diff command from command list
- [ ] Update CLAUDE.md template if it mentions diff command
- [ ] Update any example workflows that use diff command

## 5. Update Related Files
- [ ] Search and update any remaining references to "openspec diff" in:
  - Template files
  - Test files (if any exist for diff command)
  - Archive documentation
  - Change proposals

## 6. Add Deprecation Notice (Optional Phase)
- [ ] Consider adding a deprecation warning before full removal
- [ ] Provide helpful message directing users to `openspec show` command

## 7. Testing
- [ ] Ensure all tests pass after removal
- [ ] Verify CLI help text no longer shows diff command
- [ ] Test that show command provides adequate replacement functionality

## 8. Documentation of Alternative Workflows
- [ ] Document how to use `openspec show` for viewing changes
- [ ] Document how to use git diff for file comparisons
- [ ] Add migration guide to help text or documentation