# Implementation Tasks

## 1. Core Schema Setup
- [ ] 1.1 Create src/core/schemas/change.schema.ts with Zod schemas
- [ ] 1.2 Define DeltaOperationSchema for ADDED/MODIFIED/REMOVED/RENAMED
- [ ] 1.3 Define ChangeProposalSchema with metadata
- [ ] 1.4 Reuse RequirementSchema and ScenarioSchema from spec implementation

## 2. Change Parser Implementation
- [ ] 2.1 Create src/core/parsers/change-parser.ts
- [ ] 2.2 Parse proposal structure (Why, What Changes sections)
- [ ] 2.3 Extract ADDED/MODIFIED/REMOVED/RENAMED sections
- [ ] 2.4 Parse delta operations within each section
- [ ] 2.5 Add tests for change parser

## 3. Command Implementation
- [ ] 3.1 Create src/commands/change.ts
- [ ] 3.2 Implement show subcommand with JSON output
- [ ] 3.3 Implement list subcommand
- [ ] 3.4 Implement validate subcommand
- [ ] 3.5 Add --deltas filtering option

## 4. Legacy Compatibility
- [ ] 4.1 Update src/core/list.ts to add deprecation notice
- [ ] 4.2 Ensure existing list command continues to work
- [ ] 4.3 Add console warning for deprecated command usage

## 5. Integration
- [ ] 5.1 Register change command in src/cli/index.ts
- [ ] 5.2 Add integration tests for all subcommands
- [ ] 5.3 Test JSON output for changes
- [ ] 5.4 Test legacy compatibility
- [ ] 5.5 Update CLI help documentation