# Implementation Tasks

## 1. CLI Commands
- [ ] 1.1 Update archive command to parse and apply delta changes
- [ ] 1.2 Update diff command to display delta format
- [ ] 1.3 Update list command to show change types
- [ ] 1.4 Update init command to generate delta format

## 2. Testing
- [ ] 2.1 Add tests for delta format detection
- [ ] 2.2 Add tests for header normalization (trim whitespace)
- [ ] 2.3 Add tests for applying deltas in correct order
- [ ] 2.4 Add tests for validation edge cases

## 3. Documentation
- [ ] 3.1 Update README.md with delta-based conventions
- [ ] 3.2 Update examples to use delta format
- [ ] 3.3 Create migration guide for existing changes

## Notes
- Archive command is critical path - must work reliably
- Both delta and full-state formats remain supported