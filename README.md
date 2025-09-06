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

### 1. Initialize Your Project

```bash
# Create a new project or navigate to existing one
mkdir my-project && cd my-project

# Initialize OpenSpec
openspec init

# This creates:
# openspec/
#   ├── specs/       # Your specifications
#   ├── changes/     # Proposed changes
#   └── README.md    # Instructions for your team
```

### 2. Create Your First Spec

```bash
# Create a capability spec
mkdir -p openspec/specs/user-auth
echo "# User Authentication Specification

## Purpose
Handle user authentication and session management.

## Requirements
### Requirement: User Login
The system SHALL authenticate users with email and password.

#### Scenario: Valid credentials
- WHEN a user submits valid credentials
- THEN return a JWT token with 24-hour expiry" > openspec/specs/user-auth/spec.md

# Validate the spec
openspec validate --specs
```

### 3. Propose a Change

```bash
# When you need to add two-factor authentication:
mkdir -p openspec/changes/add-2fa/specs/user-auth

# Create the proposal
echo "## Why
Improve security by requiring a second authentication factor.

## What Changes
- Add OTP-based two-factor authentication
- Require 2FA for admin accounts

## Impact
- Affected specs: user-auth
- Affected code: auth service, login UI" > openspec/changes/add-2fa/proposal.md

# Create the delta (what's being added)
echo "## ADDED Requirements
### Requirement: Two-Factor Authentication
The system SHALL require OTP verification after password authentication.

#### Scenario: OTP verification required
- WHEN a user submits valid credentials
- THEN prompt for OTP code
- AND verify code before issuing JWT" > openspec/changes/add-2fa/specs/user-auth/spec.md

# See what changes
openspec diff add-2fa
```

### 4. Track Implementation

```bash
# View active changes
openspec list

# Show change details
openspec show add-2fa

# After implementing, archive the change
openspec archive add-2fa
```

## Minimal Example

Directory structure:

```
openspec/
├── specs/
│   └── auth/
│       └── spec.md
└── changes/
    └── add-2fa/
        ├── proposal.md
        └── specs/
            └── auth/
                └── spec.md   # delta format
```

Spec format (`openspec/specs/auth/spec.md`):

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

Change delta format (`openspec/changes/add-2fa/specs/auth/spec.md`):

```markdown
# Delta for Auth

## ADDED Requirements
### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- WHEN a user submits valid credentials
- THEN an OTP challenge is required
```

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

OpenSpec is designed to work seamlessly with AI coding assistants like Claude, GitHub Copilot, and Cursor.

### How AI Assistants Use OpenSpec

1. **Context Loading** - AI reads specs to understand current capabilities
2. **Change Creation** - AI creates properly formatted proposals and deltas
3. **Task Execution** - AI follows tasks.md to implement changes systematically
4. **Validation** - AI uses CLI to validate changes before committing

### Setting Up AI Integration

```bash
# Update AI configuration files (only modifies existing files)
openspec update

# This updates:
# - openspec/README.md with latest conventions
# - CLAUDE.md (if exists) with Claude-specific instructions
# - .cursorrules (if exists) with Cursor rules
# - Other AI config files as needed
```

### Example AI Workflow

```markdown
// Tell your AI assistant:
"We use OpenSpec for spec-driven development. 
Before making changes, check openspec/specs/ for current state.
Create proposals in openspec/changes/ for new features."

// AI will then:
1. Run `openspec list --specs` to see capabilities
2. Read relevant specs with `openspec show <spec>`
3. Create change proposal if needed
4. Implement following the tasks.md checklist
5. Validate with `openspec validate --strict`
```

### Best Practices for AI Development

- Always have AI read specs before implementing
- Use `openspec validate` to catch formatting issues
- Let AI create proposals for complex changes
- Archive changes only after deployment

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
