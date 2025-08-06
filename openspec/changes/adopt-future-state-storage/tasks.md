# Implementation Tasks

## 1. Update Core Documentation
- [ ] 1.1 Update openspec/README.md section on "Creating a Change Proposal"
  - [ ] Replace `patches/` with `specs/` in directory structure
  - [ ] Update step 3 to show storing complete future state
  - [ ] Remove diff syntax instructions (+/- prefixes)

## 2. Migrate Existing Change
- [ ] 2.1 Convert add-init-command change to new format
  - [ ] Create `specs/cli-init/spec.md` with clean content (no diff markers)
  - [ ] Delete old `patches/` directory
- [ ] 2.2 Test that the migrated change is clear and reviewable

## 3. Update Documentation Examples
- [ ] 3.1 Update docs/PRD.md
  - [ ] Fix directory structure examples (lines 376-382)
  - [ ] Update archive examples (lines 778-783)
  - [ ] Ensure consistency throughout
- [ ] 3.2 Update docs/openspec-walkthrough.md
  - [ ] Replace diff examples with future state examples
  - [ ] Ensure the walkthrough reflects new approach

## 4. Create New Spec
- [ ] 4.1 Finalize openspec-conventions spec in main specs/ directory
  - [ ] Document the future state storage approach
  - [ ] Include examples of good proposals
  - [ ] Make it the source of truth for conventions

## 5. Validation
- [ ] 5.1 Verify all documentation is consistent
- [ ] 5.2 Test creating a new change with the new approach
- [ ] 5.3 Ensure GitHub PR view shows diffs clearly

## 6. Deployment
- [ ] 6.1 Get approval for this change
- [ ] 6.2 Implement all tasks above
- [ ] 6.3 After deployment, archive this change with completion date