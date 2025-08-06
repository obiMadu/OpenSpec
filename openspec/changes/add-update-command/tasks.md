# Implementation Tasks

## 1. Version Management
- [ ] 1.1 Create `src/utils/version.ts` with version tracking utilities
- [ ] 1.2 Add function to read package version from package.json
- [ ] 1.3 Add function to read/write project version from `.openspec/version`
- [ ] 1.4 Update init command to save version during initialization

## 2. Template Updates
- [ ] 2.1 Update `getClaudeMdTemplate()` to use OpenSpec markers
- [ ] 2.2 Add function to update content between OpenSpec markers
- [ ] 2.3 Ensure templates support version parameters

## 3. Update Command Implementation
- [ ] 3.1 Create `src/cli/update.ts` with UpdateCommand class
- [ ] 3.2 Implement version comparison logic
- [ ] 3.3 Add `--force` flag support
- [ ] 3.4 Implement file update logic for `openspec/README.md`
- [ ] 3.5 Implement CLAUDE.md update logic (preserve user content)
- [ ] 3.6 Add appropriate success/status messages

## 4. CLI Integration
- [ ] 4.1 Register update command in `src/cli/index.ts`
- [ ] 4.2 Add command description and options
- [ ] 4.3 Ensure proper error handling and exit codes

## 5. Testing
- [ ] 5.1 Test update with matching versions (should skip)
- [ ] 5.2 Test update with different versions (should update)
- [ ] 5.3 Test --force flag bypasses version check
- [ ] 5.4 Test CLAUDE.md content preservation
- [ ] 5.5 Test error handling when openspec directory missing