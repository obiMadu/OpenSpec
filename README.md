# OpenSpec

[![CI](https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg)](https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@fission-ai/openspec)](https://www.npmjs.com/package/@fission-ai/openspec)
[![node](https://img.shields.io/node/v/@fission-ai/openspec)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

AI-native system for spec-driven development. Keep living specifications alongside code, propose changes as deltas, and archive once reality matches the spec.

OpenSpec turns specifications into living documentation that drives development. Your specs and code stay in sync—propose changes, track implementation, and know exactly when features are complete. No more outdated docs or unclear requirements.

## Why OpenSpec?

**The Problem:** Documentation drifts from code. Requirements get lost in tickets. AI assistants lack context. Teams struggle to track what's actually built versus what's planned.

**The Solution:** OpenSpec makes specifications the single source of truth:
- **Living Documentation** - Specs stay next to code and evolve together
- **Change Proposals** - Delta-based changes show exactly what's being modified
- **AI-Friendly** - Structured format that AI assistants understand and follow
- **Clear Workflow** - Know what's proposed, what's built, and what's archived
- **Team Alignment** - Everyone sees the same requirements and changes

## How It Works

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│    SPECS    │       │   CHANGES   │       │   ARCHIVE    │
│   (Truth)   │◀──────│ (Proposals) │──────▶│ (Completed)  │
└─────────────┘       └─────────────┘       └──────────────┘
      ▲                      │                      │
      │                      ▼                      │
      │               ┌─────────────┐               │
      └───────────────│    CODE     │◀──────────────┘
                      └─────────────┘

1. SPECS define current capabilities (what IS built)
2. CHANGES propose modifications using deltas (what SHOULD change)  
3. CODE implements the changes following tasks
4. ARCHIVE preserves completed changes after deployment
```

## Overview

- Specs are the current truth stored in `openspec/specs/<capability>/spec.md`.
- Changes are proposals stored in `openspec/changes/<name>/` with delta-formatted spec updates.
- The CLI favors verb-first commands: `list`, `show`, `validate`, `diff`, `archive`.

## Installation

### Prerequisites

- Node.js >= 20.19.0

### Install OpenSpec

- Global: `npm install -g @fission-ai/openspec`
- Local (per project):
  - `npm install --save-dev @fission-ai/openspec`
  - Run with `npx openspec ...`

## Getting Started

### 1. Initialize OpenSpec in Your Project

```bash
# Navigate to your project
cd my-project

# Initialize OpenSpec
openspec init

# You'll be asked:
# "Which AI tool do you use?"
#   > Claude Code
#     Cursor (coming soon)
#     Aider (coming soon)
#     Continue (coming soon)

# This creates:
# openspec/
#   ├── specs/       # Current specifications (truth)
#   ├── changes/     # Proposed changes
#   └── README.md    # AI instructions
```

### 2. Start Working with Your AI Assistant

After initialization, copy these prompts to your AI assistant (Claude Code, Cursor, etc.):

```markdown
// First, establish project context:
"Please read openspec/project.md and help me fill it out
with details about my project, tech stack, and conventions"

// Then create your first change proposal:
"I want to add user authentication with JWT tokens.
Please create an OpenSpec change proposal for this feature"

// Your AI will:
// 1. Create openspec/changes/add-user-auth/
// 2. Write proposal.md explaining why and what
// 3. Create tasks.md with implementation steps
// 4. Generate spec deltas showing what's being added
// 5. Implement the code following the tasks
```

### 3. AI-Driven Development Workflow

```markdown
// When starting a new feature:
You: "I need to add two-factor authentication to our auth system"

AI: "I'll create an OpenSpec change proposal for 2FA. Let me first
     check the current auth specs..."
     *reads openspec/specs/user-auth/spec.md*
     *creates openspec/changes/add-2fa/ with:*
       - proposal.md (why and impact)
       - tasks.md (implementation checklist)
       - design.md (technical decisions)
       - specs/user-auth/spec.md (ADDED requirements)

You: "Great, let's implement it"

AI: "Following the tasks in openspec/changes/add-2fa/tasks.md:
     Task 1.1: Create OTP model..."
     *implements each task, marking complete*
```

### 4. Track and Complete Changes

```bash
# View active changes (what's being worked on)
openspec list

# See the difference between proposed and current specs
openspec diff add-2fa

# Validate your changes are properly formatted
openspec validate add-2fa --strict

# After deployment, archive the completed change
openspec archive add-2fa
# This moves the change to archive/ and updates specs/
```

### Key Points

- **You don't write spec files manually** - Your AI assistant creates them
- **Specs are living documentation** - They evolve with your code
- **Changes are proposals** - They show what will be modified before implementation
- **AI follows the specs** - Ensuring consistent, documented development

## Example: How AI Creates OpenSpec Files

When you ask your AI assistant to "add two-factor authentication", it creates:

```
openspec/
├── specs/
│   └── auth/
│       └── spec.md           # Current auth spec (if exists)
└── changes/
    └── add-2fa/              # AI creates this entire structure
        ├── proposal.md       # Why and what changes
        ├── tasks.md          # Implementation checklist
        ├── design.md         # Technical decisions (optional)
        └── specs/
            └── auth/
                └── spec.md   # Delta showing additions
```

### AI-Generated Spec (created in `openspec/specs/auth/spec.md`):

```markdown
# Auth Specification

## Purpose
Authentication and session management.

## Requirements
### Requirement: User Authentication
The system SHALL issue a JWT on successful login.

#### Scenario: Valid credentials
- WHEN a user submits valid credentials
- THEN a JWT is returned
```

### AI-Generated Change Delta (created in `openspec/changes/add-2fa/specs/auth/spec.md`):

```markdown
# Delta for Auth

## ADDED Requirements
### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- WHEN a user submits valid credentials
- THEN an OTP challenge is required
```

### AI-Generated Tasks (created in `openspec/changes/add-2fa/tasks.md`):

```markdown
## 1. Database Setup
- [ ] 1.1 Add OTP secret column to users table
- [ ] 1.2 Create OTP verification logs table

## 2. Backend Implementation  
- [ ] 2.1 Add OTP generation endpoint
- [ ] 2.2 Modify login flow to require OTP
- [ ] 2.3 Add OTP verification endpoint

## 3. Frontend Updates
- [ ] 3.1 Create OTP input component
- [ ] 3.2 Update login flow UI
```

**Important:** You don't create these files manually. Your AI assistant generates them based on your requirements and the existing codebase.

### Understanding Delta Format

Deltas describe how specifications change using operation headers:

- **`## ADDED Requirements`** - New capabilities being introduced
- **`## MODIFIED Requirements`** - Changes to existing behavior (include the complete modified text)
- **`## REMOVED Requirements`** - Features being deprecated (include reason and migration path)
- **`## RENAMED Requirements`** - Simple name changes

Each delta operation contains complete requirement blocks that will be merged into the main spec. Think of deltas as "patches" that transform your current specifications into the desired state.

**Critical formatting rules:**
- Use `### Requirement: <name>` for requirement headers
- Every requirement MUST include at least one `#### Scenario:` block
- Use SHALL/MUST in ADDED/MODIFIED requirement text
- MODIFIED sections must contain the complete updated requirement, not just the changes

## Core Commands

- init: Initialize OpenSpec in the project.
- update: Update OpenSpec instructions (team-friendly; only updates existing files, always refreshes `openspec/README.md`).
- list: List changes (default) or specs with `--specs`.
- show: Show a change or spec (raw text). Use `--json` for structured output; pass `--type change|spec` if ambiguous.
- validate: Validate changes/specs. Supports `--changes`, `--specs`, `--all`, `--strict`, `--json`.
- diff: Show unified diff between a change’s deltas and current specs.
- archive: Apply deltas to specs and move the change to `openspec/changes/archive/`. Supports `--skip-specs`.

## JSON for Automation

Specs:

```bash
openspec show auth --json --no-scenarios
```

Outputs shape:

```json
{
  "id": "auth",
  "title": "Auth Specification",
  "overview": "...",
  "requirementCount": 1,
  "requirements": [{ "text": "...", "scenarios": [] }],
  "metadata": { "version": "1.0.0", "format": "openspec" }
}
```

Changes:

```bash
openspec show add-2fa --json --deltas-only
```

Outputs shape:

```json
{
  "id": "add-2fa",
  "title": "Add 2FA",
  "deltaCount": 1,
  "deltas": [{ "spec": "auth", "operation": "ADDED", "name": "Two-Factor Authentication", "raw": "..." }]
}
```

## AI Integration

OpenSpec is built for AI-driven development. Your AI assistant creates and manages all specs and changes.

### The AI Workflow

1. **You describe what you want** - "Add user authentication" or "Improve performance"
2. **AI creates the change proposal** - Generates proposal.md, tasks.md, and spec deltas
3. **AI implements following specs** - Works through tasks.md systematically
4. **You deploy and archive** - Once deployed, archive the change to update specs

### How Your AI Assistant Works with OpenSpec

```markdown
// Starting a new feature:
You: "Add password reset functionality"

AI: "I'll create an OpenSpec change proposal. Let me check the current auth specs first..."
    *Runs: openspec list --specs*
    *Reads: openspec/specs/auth/spec.md*
    *Creates: openspec/changes/add-password-reset/*
    
// AI automatically:
- Checks existing specs to understand current state
- Creates properly structured change proposals
- Generates spec deltas showing what's being added/modified
- Implements code following the tasks checklist
- Validates changes with openspec validate
```

### Setting Up Your AI Assistant

```bash
# After running 'openspec init', your AI is configured
# The init command:
# 1. Asks which AI tool you use (Claude Code, Cursor, etc.)
# 2. Creates the appropriate configuration files
# 3. Sets up AI-specific instructions

# To update AI configurations later:
openspec update
```

### What Makes OpenSpec AI-Native

- **Structured Format** - AI understands the exact format for specs and changes
- **Clear Conventions** - Requirements use SHALL/MUST, scenarios follow patterns
- **Validation Tools** - AI can verify its work with `openspec validate`
- **Task Tracking** - AI marks tasks complete as it implements
- **Context Aware** - AI reads existing specs before making changes

### Common AI Commands

```markdown
// Creating changes:
"Create an OpenSpec change proposal for [feature]"
"Add a new capability for [functionality]"
"Modify the [spec-name] spec to include [enhancement]"

// Implementation:
"Implement the tasks in openspec/changes/[change-name]/tasks.md"
"Continue with the next task"
"Mark task 2.1 as complete"

// Validation:
"Validate the current change with openspec"
"Check if the spec formatting is correct"
"Show me the diff for this change"
```

## Comparison with Alternatives

### OpenSpec vs Kiro.dev

| Aspect | OpenSpec | Kiro |
|--------|----------|------|
| **Approach** | CLI tool, works with any editor/IDE | Full IDE with built-in agents |
| **Workflow** | Specs → Changes (deltas) → Archive | Requirements → Design → Tasks |
| **File Format** | Markdown with specific headers | EARS notation for requirements |
| **Change Tracking** | Delta-based proposals | Direct spec modification |
| **AI Integration** | Works with any AI assistant | Built-in AI agents with hooks |
| **Version Control** | Git-native, PR-friendly | Git-based with IDE integration |
| **Learning Curve** | Simple CLI commands | New IDE and workflow |
| **Team Adoption** | Drop into existing projects | Requires IDE adoption |

### OpenSpec vs Traditional Docs

| Aspect | OpenSpec | README/Wiki/Tickets |
|--------|----------|--------------------|
| **Location** | Next to code in repo | Separate systems |
| **Drift Prevention** | Specs validated with code | Manual sync required |
| **Change Process** | Structured proposals | Ad-hoc updates |
| **AI Readability** | Structured, parseable | Varies widely |
| **Completeness Tracking** | Archive shows when done | Manual status updates |

## Team Adoption

### Introducing to Existing Projects

1. **Start Small** - Begin with one capability (e.g., authentication)
2. **Document Current State** - Create specs for what exists today
3. **Use for Next Feature** - Create your first change proposal
4. **Iterate** - Refine the process based on team feedback

### Migration Strategy

```bash
# Step 1: Initialize OpenSpec
openspec init

# Step 2: Create specs for existing features
mkdir -p openspec/specs/existing-feature
# Document current behavior in spec.md

# Step 3: All new features use changes
mkdir -p openspec/changes/new-feature
# Team creates proposals before coding

# Step 4: Gradually migrate docs
# Move requirements from tickets/wikis to specs
```

### Team Workflow

- **Product/PM** - Write requirements in proposal.md
- **Engineers** - Create technical specs and implement
- **AI Assistants** - Follow specs for consistent implementation
- **QA** - Test against scenarios in specs
- **Documentation** - Specs ARE the documentation

`openspec update` is team-friendly: it updates instruction files without forcing tools on teammates. Multiple AI assistants can coexist without conflicts.


## Troubleshooting

- "Change must have at least one delta" → Ensure `## ADDED|MODIFIED|REMOVED|RENAMED Requirements` sections exist in `openspec/changes/<name>/specs/.../spec.md`.
- "Requirement must have at least one scenario" → Add at least one `#### Scenario:` block under each requirement.
- Missing SHALL/MUST in ADDED/MODIFIED → Add SHALL/MUST to requirement text.
- Debug:
  - `openspec validate <change-id> --strict --json`
  - `openspec change show <change-id> --json --deltas-only`
  - `openspec spec show <spec-id> --json -r 1`
- Output control: `--no-color` disables ANSI (respects `NO_COLOR`).

## Contributing

- Install dependencies: `npm install`
- Build: `npm run build`
- Test: `npm test`
- Develop CLI locally: `npm run dev` or `npm run dev:cli`
- Conventional commits (one-line): `type(scope): subject`

## License

MIT

## Deprecation Note

Noun-first commands (`openspec spec ...`, `openspec change ...`) are available but deprecated. Prefer verb-first commands: `openspec list`, `openspec show`, `openspec validate`.
