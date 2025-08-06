# Implementation Tasks

## 1. Update Command Implementation
- [ ] 1.1 Create `src/cli/update.ts` with UpdateCommand class
- [ ] 1.2 Check if openspec directory exists
- [ ] 1.3 Get README template and write to `openspec/README.md`
- [ ] 1.4 Get CLAUDE.md template and write to `CLAUDE.md`
- [ ] 1.5 Display success message

## 2. CLI Integration
- [ ] 2.1 Register update command in `src/cli/index.ts`
- [ ] 2.2 Add command description
- [ ] 2.3 Handle errors (missing openspec directory)

## 3. Testing
- [ ] 3.1 Test update replaces both files correctly
- [ ] 3.2 Test error when openspec directory missing
- [ ] 3.3 Test success message displays properly