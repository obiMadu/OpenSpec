# Implementation Tasks

## 1. Core Implementation
- [ ] 1.1 Create `src/core/archive.ts` with ArchiveCommand class
  - [ ] 1.1.1 Implement change selection (interactive if not provided)
  - [ ] 1.1.2 Implement incomplete task checking from tasks.md
  - [ ] 1.1.3 Implement confirmation prompt for incomplete tasks
  - [ ] 1.1.4 Implement archive move with date prefixing

## 2. CLI Integration
- [ ] 2.1 Add archive command to `src/cli/index.ts`
  - [ ] 2.1.1 Import ArchiveCommand
  - [ ] 2.1.2 Register command with commander
  - [ ] 2.1.3 Add proper error handling

## 3. Error Handling
- [ ] 3.1 Handle missing openspec/changes/ directory
- [ ] 3.2 Handle change not found
- [ ] 3.3 Handle archive target already exists
- [ ] 3.4 Handle user cancellation

## 4. Testing
- [ ] 4.1 Test with fully completed change
- [ ] 4.2 Test with incomplete tasks (warning shown)
- [ ] 4.3 Test interactive selection mode
- [ ] 4.4 Test duplicate archive prevention

## 5. Build and Validation
- [ ] 5.1 Ensure TypeScript compilation succeeds
- [ ] 5.2 Test command execution