# Change: Add Spec Commands with JSON Output

## Why

Currently, OpenSpec specs can only be viewed as markdown files. This makes programmatic access difficult and prevents integration with CI/CD pipelines, external tools, and automated processing.

## What Changes

- Add new `openspec spec` command with three subcommands: `show`, `list`, and `validate`
- Implement JSON output capability for specs using heading-based parsing
- Add Zod schemas for spec structure validation
- Enable content filtering options (requirements only, no scenarios, specific requirement)

## Impact

- **Affected specs**: None (new capability)
- **Affected code**: 
  - src/cli/index.ts (register new command)
  - package.json (add zod dependency)

## ADDED Requirements

### Requirement: Spec Command

The system SHALL provide a `spec` command with subcommands for displaying, listing, and validating specifications.

#### Scenario: Show spec as JSON

- **WHEN** executing `openspec spec show <name> --json`
- **THEN** parse the markdown spec file
- **AND** extract headings and content hierarchically
- **AND** output valid JSON to stdout

#### Scenario: List all specs

- **WHEN** executing `openspec spec list`
- **THEN** scan the openspec/specs directory
- **AND** return list of all available capabilities
- **AND** support JSON output with `--json` flag

#### Scenario: Validate spec structure

- **WHEN** executing `openspec spec validate <name>`
- **THEN** parse the spec file
- **AND** validate against Zod schema
- **AND** report any structural issues