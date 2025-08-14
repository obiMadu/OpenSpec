# Implementation Tasks

## 1. Update Specifications
- [ ] 1.1 Update openspec-conventions spec with delta-based approach
- [ ] 1.2 Add Header-Based Requirement Identification to conventions
- [ ] 1.3 Update cli-archive spec with delta processing behavior
- [ ] 1.4 Update cli-diff spec with requirement-level comparison display

## 2. CLI Commands
- [ ] 2.1 Update archive command to parse and apply delta changes
- [ ] 2.2 Implement normalized header matching (trim whitespace)
- [ ] 2.3 Apply changes in order: RENAMED → REMOVED → MODIFIED → ADDED
- [ ] 2.4 Update diff command to show requirement-level side-by-side comparison (changes only)
  - [ ] 2.4.1 Parse specs into requirement-level structures
  - [ ] 2.4.2 Apply deltas to generate future state
  - [ ] 2.4.3 Implement side-by-side comparison view for changed requirements only

## 3. Validation
- [ ] 3.1 Validate MODIFIED/REMOVED requirements exist
- [ ] 3.2 Validate ADDED requirements don't already exist
- [ ] 3.3 Validate RENAMED FROM headers exist, TO headers don't
- [ ] 3.4 Check for duplicate headers within specs
- [ ] 3.5 Ensure renamed requirements aren't also in ADDED

## 4. Testing
- [ ] 4.1 Add tests for header normalization
- [ ] 4.2 Add tests for applying deltas in correct order
- [ ] 4.3 Add tests for validation edge cases
- [ ] 4.4 Add tests for diff command requirement-level comparison
- [ ] 4.5 Add tests for diff command side-by-side view formatting

## 5. Documentation
- [ ] 5.1 Update README.md with delta-based conventions
- [ ] 5.2 Update examples to use delta format
- [ ] 5.3 Document standard output symbols
- [ ] 5.4 Document diff command side-by-side comparison view

## Notes
- Archive command is critical path - must work reliably
- All new changes must use delta format
- Header normalization: normalize(header) = trim(header)
- Diff command shows only changed requirements in side-by-side comparison