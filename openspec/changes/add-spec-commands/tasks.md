# Implementation Tasks

## 1. Core Schema Setup
- [ ] 1.1 Add zod dependency to package.json
- [ ] 1.2 Create src/core/schemas/spec.schema.ts with Zod schemas
- [ ] 1.3 Define ScenarioSchema, RequirementSchema, and SpecSchema types

## 2. Parser Implementation
- [ ] 2.1 Create src/core/parsers/markdown-parser.ts
- [ ] 2.2 Implement heading extraction (##, ###, ####)
- [ ] 2.3 Implement content capture between headings
- [ ] 2.4 Add tests for parser edge cases

## 3. Command Implementation
- [ ] 3.1 Create src/commands/spec.ts
- [ ] 3.2 Implement show subcommand with JSON output
- [ ] 3.3 Implement list subcommand
- [ ] 3.4 Implement validate subcommand
- [ ] 3.5 Add filtering options (--requirements, --no-scenarios, -r)

## 4. JSON Converter
- [ ] 4.1 Create src/core/converters/json-converter.ts
- [ ] 4.2 Implement spec-to-JSON conversion
- [ ] 4.3 Add metadata fields (version, format, sourcePath)

## 5. Integration
- [ ] 5.1 Register spec command in src/cli/index.ts
- [ ] 5.2 Add integration tests for all subcommands
- [ ] 5.3 Test JSON output validation
- [ ] 5.4 Update CLI help documentation