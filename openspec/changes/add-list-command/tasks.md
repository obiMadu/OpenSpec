# Implementation Tasks

## 1. Core Implementation
- [ ] 1.1 Create `src/core/list.ts` with list logic
  - [ ] 1.1.1 Implement directory scanning (exclude archive/)
  - [ ] 1.1.2 Implement task counting from tasks.md files
  - [ ] 1.1.3 Format output as simple table
- [ ] 1.2 Add list command to CLI in `src/cli/index.ts`
  - [ ] 1.2.1 Register `openspec list` command
  - [ ] 1.2.2 Connect to list.ts implementation

## 2. Error Handling
- [ ] 2.1 Handle missing openspec/changes/ directory
- [ ] 2.2 Handle changes without tasks.md files
- [ ] 2.3 Handle empty changes directory

## 3. Testing
- [ ] 3.1 Add tests for list functionality
  - [ ] 3.1.1 Test with multiple changes
  - [ ] 3.1.2 Test with completed changes
  - [ ] 3.1.3 Test with no changes
  - [ ] 3.1.4 Test error conditions

## 4. Documentation
- [ ] 4.1 Update CLI help text with list command
- [ ] 4.2 Add list command to README if applicable