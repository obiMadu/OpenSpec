# Implementation Tasks

## 1. Update OpenSpec Conventions
- [ ] 1.1 Modify openspec-conventions spec to document delta-based approach
- [ ] 1.2 Add examples showing ADDED/MODIFIED/REMOVED sections
- [ ] 1.3 Document when to use RESTRUCTURED marker
- [ ] 1.4 Update README.md with new conventions

## 2. Create Migration Guide
- [ ] 2.1 Document how to convert existing full-state changes
- [ ] 2.2 Provide examples of common patterns
- [ ] 2.3 Add FAQ for edge cases

## 3. Update Archive Command
- [ ] 3.1 Enhance to parse ADDED/MODIFIED/REMOVED/RENAMED sections
- [ ] 3.2 Implement header-based matching for requirement identification
- [ ] 3.3 Apply changes in order: RENAMED → REMOVED → MODIFIED → ADDED
- [ ] 3.4 Validate headers exist before MODIFY/REMOVE operations
- [ ] 3.5 Validate headers don't exist before ADD operations
- [ ] 3.6 Support RESTRUCTURED marker for full replacements
- [ ] 3.7 Add tests for delta application logic with exact header matching

## 4. Update Other CLI Commands
- [ ] 4.1 Update `diff` command to understand delta format
- [ ] 4.2 Update `list` command to show change types (additions vs modifications)
- [ ] 4.3 Ensure `init` command generates proposals in new format

## 5. Documentation and Examples
- [ ] 5.1 Update all examples in documentation to use delta approach
- [ ] 5.2 Create comprehensive example showing complex multi-requirement change
- [ ] 5.3 Document rollback/revert procedures

## 6. Tooling Validation
- [ ] 6.1 Add validation to ensure ADDED requirements don't already exist (by header)
- [ ] 6.2 Validate MODIFIED requirements reference existing requirements (exact match)
- [ ] 6.3 Check for orphaned scenarios in modifications
- [ ] 6.4 Validate no duplicate headers within a spec
- [ ] 6.5 Enforce exact header matching (case-sensitive, whitespace-sensitive)
- [ ] 6.6 Validate RENAMED sections specify valid FROM headers
- [ ] 6.7 Check that renamed requirements aren't also in ADDED section

## Notes
- Start with conventions update to establish the pattern
- Archive command is critical path - must work reliably
- Consider backward compatibility for existing changes
- May need phased rollout: support both approaches initially