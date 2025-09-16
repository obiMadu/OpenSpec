# CLI Init Specification

## Purpose

The `openspec init` command SHALL create a complete OpenSpec directory structure in any project, enabling immediate adoption of OpenSpec conventions with support for multiple AI coding assistants.

## Requirements

### Requirement: Progress Indicators

The command SHALL display progress indicators during initialization to provide clear feedback about each step.

#### Scenario: Displaying initialization progress

- **WHEN** executing initialization steps
- **THEN** validate environment silently in background (no output unless error)
- **AND** display progress with ora spinners:
  - Show spinner: "⠋ Creating OpenSpec structure..."
  - Then success: "✔ OpenSpec structure created"
  - Show spinner: "⠋ Configuring AI tools..."
  - Then success: "✔ AI tools configured"

### Requirement: Directory Creation

The command SHALL create the complete OpenSpec directory structure with all required directories and files.

#### Scenario: Creating OpenSpec structure

- **WHEN** `openspec init` is executed
- **THEN** create the following directory structure:
```
openspec/
├── project.md
├── AGENTS.md
├── specs/
└── changes/
    └── archive/
```

### Requirement: File Generation

The command SHALL generate required template files with appropriate content for immediate use.

#### Scenario: Generating template files

- **WHEN** initializing OpenSpec
- **THEN** generate `AGENTS.md` containing complete OpenSpec instructions for AI assistants
- **AND** generate `project.md` with project context template

### Requirement: AI Tool Configuration

The command SHALL configure AI coding assistants with OpenSpec instructions based on user selection.

#### Scenario: Prompting for AI tool selection

- **WHEN** run interactively
- **THEN** prompt user to select AI tools to configure:
  - Claude Code (updates/creates CLAUDE.md with OpenSpec markers)
  - Cursor (future)
  - Aider (future)

### Requirement: AI Tool Configuration Details

The command SHALL properly configure selected AI tools with OpenSpec-specific instructions using a marker system.

#### Scenario: Configuring Claude Code

- **WHEN** Claude Code is selected
- **THEN** create or update `CLAUDE.md` in the project root directory (not inside openspec/)

#### Scenario: Creating new CLAUDE.md

- **WHEN** CLAUDE.md does not exist
- **THEN** create new file with OpenSpec content wrapped in markers:
```markdown
<!-- OPENSPEC:START -->
# OpenSpec Project

This document provides instructions for AI coding assistants on how to use OpenSpec conventions for spec-driven development. Follow these rules precisely when working on OpenSpec-enabled projects.

This project uses OpenSpec for spec-driven development. Specifications are the source of truth.

See @openspec/AGENTS.md for detailed conventions and guidelines.
<!-- OPENSPEC:END -->
```

#### Scenario: Updating existing CLAUDE.md

- **WHEN** CLAUDE.md already exists
- **THEN** preserve all existing content
- **AND** insert OpenSpec content at the beginning of the file using markers
- **AND** ensure markers don't duplicate if they already exist

#### Scenario: Managing content with markers

- **WHEN** using the marker system
- **THEN** use `<!-- OPENSPEC:START -->` to mark the beginning of managed content
- **AND** use `<!-- OPENSPEC:END -->` to mark the end of managed content
- **AND** allow OpenSpec to update its content without affecting user customizations
- **AND** preserve all content outside the markers intact

WHY use markers:
- Users may have existing CLAUDE.md instructions they want to keep
- OpenSpec can update its instructions in future versions
- Clear boundary between OpenSpec-managed and user-managed content

### Requirement: Interactive Mode

The command SHALL provide an interactive menu for AI tool selection with clear navigation instructions.

#### Scenario: Displaying interactive menu

- **WHEN** run
- **THEN** prompt user with: "Which AI tool do you use?"
- **AND** show single-select menu with available tools:
  - Claude Code
- **AND** show disabled options as "coming soon" (not selectable):
  - Cursor (coming soon)
  - Aider (coming soon)  
  - Continue (coming soon)

#### Scenario: Navigating the menu

- **WHEN** user is in the menu
- **THEN** allow arrow keys to move between options
- **AND** allow Enter key to select the highlighted option

### Requirement: Safety Checks

The command SHALL perform safety checks to prevent overwriting existing structures and ensure proper permissions.

#### Scenario: Detecting existing initialization

- **WHEN** `openspec/` directory already exists
- **THEN** display error with ora fail indicator:
  - "✖ Error: OpenSpec seems to already be initialized. Use 'openspec update' to update the structure."

#### Scenario: Checking write permissions

- **WHEN** checking initialization feasibility
- **THEN** verify write permissions in the target directory silently
- **AND** only display error if permissions are insufficient

### Requirement: Success Output

The command SHALL provide clear, actionable next steps upon successful initialization.

#### Scenario: Displaying success message

- **WHEN** initialization completes successfully
- **THEN** display actionable prompts for AI-driven workflow:
```
✔ OpenSpec initialized successfully!

Next steps - Copy these prompts to Claude:

────────────────────────────────────────────────────────────
1. Populate your project context:
   "Please read openspec/project.md and help me fill it out
    with details about my project, tech stack, and conventions"

2. Create your first change proposal:
   "I want to add [YOUR FEATURE HERE]. Please create an
    OpenSpec change proposal for this feature"

3. Learn the OpenSpec workflow:
   "Please explain the OpenSpec workflow from openspec/AGENTS.md
    and how I should work with you on this project"
────────────────────────────────────────────────────────────
```

The prompts SHALL:
- Be copy-pasteable for immediate use with AI tools
- Guide users through the AI-driven workflow
- Replace placeholder text ([YOUR FEATURE HERE]) with actual features

### Requirement: Exit Codes

The command SHALL use consistent exit codes to indicate different failure modes.

#### Scenario: Returning exit codes

- **WHEN** the command completes
- **THEN** return appropriate exit code:
  - 0: Success
  - 1: General error (including when OpenSpec directory already exists)
  - 2: Insufficient permissions (reserved for future use)
  - 3: User cancelled operation (reserved for future use)

## Why

Manual creation of OpenSpec structure is error-prone and creates adoption friction. A standardized init command ensures:
- Consistent structure across all projects
- Proper AI instruction files are always included
- Quick onboarding for new projects
- Clear conventions from the start