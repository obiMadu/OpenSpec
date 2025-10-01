## ADDED Requirements
### Requirement: Scaffolding Command Registration
The CLI SHALL expose an `openspec scaffold <change-id>` command that validates the change identifier before generating files.

#### Scenario: Registering scaffold command
- **WHEN** a user runs `openspec scaffold add-user-notifications`
- **THEN** the CLI SHALL reject invalid identifiers (non kebab-case) before proceeding
- **AND** display usage documentation via `openspec scaffold --help`
- **AND** exit with code 0 after successful scaffolding

### Requirement: Change Directory Structure
The scaffold command SHALL create the standard change workspace with proposal, tasks, optional design, and delta directories laid out according to OpenSpec conventions.

#### Scenario: Generating change workspace
- **WHEN** scaffolding a new change with id `add-user-notifications`
- **THEN** create `openspec/changes/add-user-notifications/`
- **AND** generate `proposal.md`, `tasks.md`, and `design.md` (commented placeholder content) in that directory when missing
- **AND** create `openspec/changes/add-user-notifications/specs/` ready for capability-specific deltas

### Requirement: Template Content Guidance
The scaffold command SHALL populate generated Markdown files with OpenSpec-compliant templates so authors can copy, edit, and pass validation without reformatting.

#### Scenario: Populating proposal and tasks templates
- **WHEN** the scaffold command writes `proposal.md`
- **THEN** include the `## Why`, `## What Changes`, and `## Impact` headings with placeholder guidance text
- **AND** ensure `tasks.md` starts with `## 1. Implementation` and numbered checklist items using `- [ ]` syntax
- **AND** annotate optional sections (like `design.md`) with inline TODO comments so users understand when to keep or delete them

### Requirement: Delta Spec Creation
The scaffold command SHALL create at least one capability delta file with correctly formatted requirement and scenario placeholders that guide authors to enter the actual behavior.

#### Scenario: Creating spec delta skeleton
- **WHEN** scaffolding a change and the capability `cli-scaffold` is provided interactively or via flags
- **THEN** generate `openspec/changes/add-user-notifications/specs/cli-scaffold/spec.md`
- **AND** include `## ADDED Requirements` with at least one `### Requirement:` block and matching `#### Scenario:` entries that remind the author to replace placeholder text
- **AND** ensure the generated delta passes `openspec validate add-user-notifications --strict` until the author edits it

### Requirement: Idempotent Execution
The scaffold command SHALL be safe to rerun, preserving user edits while filling in any missing managed sections.

#### Scenario: Rerunning scaffold on existing change
- **WHEN** the command is executed again for an existing change directory containing user-edited files
- **THEN** leave existing content untouched except for managed placeholder regions or missing files that need creation
- **AND** update the filesystem summary to highlight which files were skipped, created, or refreshed
