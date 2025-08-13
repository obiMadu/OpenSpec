# Implementation Tasks

## 1. Update Update Command
- [ ] Remove hardcoded CLAUDE.md update from `src/core/update.ts`
- [ ] Add logic to check for existing AI tool configuration files
- [ ] Update only existing files using their appropriate configurators
- [ ] Iterate through all registered configurators to check for existing files

## 2. Update Configurator Registry
- [ ] Add method to get all configurators for update command
- [ ] Ensure each configurator can check if its file exists

## 3. Add Tests
- [ ] Test update command with only CLAUDE.md present
- [ ] Test update command with no AI tool files present
- [ ] Test update command with multiple AI tool files present
- [ ] Test that update never creates new AI tool files

## 4. Update Documentation
- [ ] Update README to clarify team-friendly behavior
- [ ] Document that update only modifies existing files