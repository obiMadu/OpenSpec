# Implementation Tasks

## 1. Validation Infrastructure
- [ ] 1.1 Create src/core/validation/types.ts with ValidationLevel, ValidationIssue, ValidationReport types
- [ ] 1.2 Create src/core/validation/rules.ts with enhanced validation rules
- [ ] 1.3 Create src/core/validation/validator.ts with SpecValidator and ChangeValidator classes

## 2. Enhanced Validation Rules
- [ ] 2.1 Add RequirementValidation refinements (must have scenarios, must contain SHALL)
- [ ] 2.2 Add SpecValidation refinements (must have requirements)
- [ ] 2.3 Add ChangeValidation refinements (must have deltas, why section length)
- [ ] 2.4 Implement custom error messages for each rule

## 3. Spec Command Enhancement
- [ ] 3.1 Update spec validate subcommand to use new validator
- [ ] 3.2 Add --strict mode support
- [ ] 3.3 Implement JSON validation report output
- [ ] 3.4 Add validate --all functionality

## 4. Change Command Enhancement
- [ ] 4.1 Update change validate subcommand to use new validator
- [ ] 4.2 Add --strict mode support
- [ ] 4.3 Implement JSON validation report output
- [ ] 4.4 Add validate --all functionality

## 5. Archive Command Enhancement
- [ ] 5.1 Add pre-archive validation check
- [ ] 5.2 Add --no-validate flag for unsafe mode
- [ ] 5.3 Display validation errors before aborting
- [ ] 5.4 Add tests for validation scenarios

## 6. Diff Command Enhancement
- [ ] 6.1 Add validation check before diff
- [ ] 6.2 Show validation warnings (non-blocking)
- [ ] 6.3 Continue with diff even if warnings present

## 7. Testing
- [ ] 7.1 Unit tests for validation rules
- [ ] 7.2 Integration tests for validation reports
- [ ] 7.3 Test various invalid spec/change formats
- [ ] 7.4 Test strict mode behavior
- [ ] 7.5 Test pre-archive validation
- [ ] 7.6 Test validation report JSON output