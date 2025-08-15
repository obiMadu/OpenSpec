# Implementation Tasks (Foundation Phase)

## 1. Core Schemas
- [ ] 1.1 Add zod dependency to package.json
- [ ] 1.2 Create src/core/schemas/base.schema.ts with ScenarioSchema and RequirementSchema
- [ ] 1.3 Create src/core/schemas/spec.schema.ts with SpecSchema
- [ ] 1.4 Create src/core/schemas/change.schema.ts with DeltaSchema and ChangeSchema
- [ ] 1.5 Create src/core/schemas/index.ts to export all schemas

## 2. Parser Implementation
- [ ] 2.1 Create src/core/parsers/markdown-parser.ts
- [ ] 2.2 Implement heading extraction (##, ###, ####)
- [ ] 2.3 Implement content capture between headings
- [ ] 2.4 Add tests for parser edge cases

## 3. Validation Infrastructure
- [ ] 3.1 Create src/core/validation/types.ts with ValidationLevel, ValidationIssue, ValidationReport types
- [ ] 3.2 Create src/core/validation/rules.ts with enhanced validation rules
- [ ] 3.3 Create src/core/validation/validator.ts with SpecValidator and ChangeValidator classes

## 4. Enhanced Validation Rules
- [ ] 4.1 Add RequirementValidation refinements (must have scenarios, must contain SHALL)
- [ ] 4.2 Add SpecValidation refinements (must have requirements)
- [ ] 4.3 Add ChangeValidation refinements (must have deltas, why section length)
- [ ] 4.4 Implement custom error messages for each rule

## 5. JSON Converter
- [ ] 5.1 Create src/core/converters/json-converter.ts
- [ ] 5.2 Implement spec-to-JSON conversion
- [ ] 5.3 Implement change-to-JSON conversion
- [ ] 5.4 Add metadata fields (version, format, sourcePath)

## 6. Archive Command Enhancement
- [ ] 6.1 Add pre-archive validation check using new validators
- [ ] 6.2 Add --no-validate flag with required confirmation prompt and warning message: "⚠️  WARNING: Skipping validation may archive invalid specs. Continue? (y/N)"
- [ ] 6.3 Display validation errors before aborting
- [ ] 6.4 Log all --no-validate usages to console with timestamp and affected files
- [ ] 6.5 Add tests for validation scenarios including --no-validate confirmation flow

## 7. Diff Command Enhancement
- [ ] 7.1 Add validation check before diff using new validators
- [ ] 7.2 Show validation warnings (non-blocking)
- [ ] 7.3 Continue with diff even if warnings present

## 8. Testing
- [ ] 8.1 Unit tests for all schemas
- [ ] 8.2 Unit tests for parser
- [ ] 8.3 Unit tests for validation rules
- [ ] 8.4 Integration tests for validation reports
- [ ] 8.5 Test various invalid spec/change formats
- [ ] 8.6 Test strict mode behavior
- [ ] 8.7 Test pre-archive validation
- [ ] 8.8 Test validation report JSON output

## 9. Documentation
- [ ] 9.1 Document schema structure and validation rules
- [ ] 9.2 Update CLI help for archive (document --no-validate flag and its warnings)
- [ ] 9.3 Update CLI help for diff (document validation warnings behavior)
- [ ] 9.4 Create migration guide for future command integration