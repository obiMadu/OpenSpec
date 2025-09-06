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

Install globally:

```bash
npm install -g @fission-ai/openspec
```

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

# This creates:
# openspec/
#   ├── specs/       # Current specifications (truth)
#   ├── changes/     # Proposed changes
#   └── README.md    # AI instructions
```

### 2. Create Your First Change Proposal

After initialization, tell your AI assistant (Claude Code, Cursor, etc.):

```markdown
// Step 1: Create the change proposal
"I want to add user authentication with JWT tokens.
Please create an OpenSpec change proposal for this feature"

// Your AI will:
// 1. Create openspec/changes/add-user-auth/
// 2. Write proposal.md explaining why and what  
// 3. Create design.md with technical decisions (optional)
// 4. Generate spec deltas showing what's being added
// 5. Create tasks.md with implementation checklist

// Step 2: Review the proposal
// Look at the generated files and ensure they match your vision
// Make any adjustments needed to the proposal or specs

// Step 3: When ready, implement the change
"The proposal looks good. Let's implement the user authentication 
change following the tasks in openspec/changes/add-user-auth/tasks.md"

// AI will then work through each task systematically,
// marking them complete as it implements the feature
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


## Comparison with Kiro.dev

The key difference between OpenSpec and Kiro is **change management**:

- **OpenSpec**: Groups all changes for a feature in one place (`openspec/changes/feature-name/`). You can see exactly what specs, tasks, and code need to be modified for a single feature.

- **Kiro**: Changes affect multiple specs and create tasks across different folders. When implementing a feature that touches multiple capabilities, it's harder to track what needs to be done to complete that specific feature.

This makes OpenSpec better for tracking feature completion and understanding the full scope of changes.

## Team Adoption

### Getting Started with Your Team

1. **Initialize OpenSpec** - Run `openspec init` in your project
2. **Start with new features** - Use OpenSpec for your next change proposal
3. **Build incrementally** - Each new feature adds to your spec library
4. **Future capability** - We're working on tools to generate specs from existing code

`openspec update` is team-friendly: it updates instruction files without forcing tools on teammates. Multiple AI assistants can coexist without conflicts.


## Contributing

- Install dependencies: `npm install`
- Build: `npm run build`
- Test: `npm test`
- Develop CLI locally: `npm run dev` or `npm run dev:cli`
- Conventional commits (one-line): `type(scope): subject`

## License

MIT

