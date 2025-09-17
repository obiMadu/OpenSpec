<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec">
    <picture>
      <source srcset="assets/openspec_pixel_dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="assets/openspec_pixel_light.svg" media="(prefers-color-scheme: light)">
      <img src="assets/openspec_pixel_light.svg" alt="OpenSpec logo" height="64">
    </picture>
  </a>
  
</p>
<p align="center">Spec-driven development for AI coding assistants.</p>
<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@fission-ai/openspec"><img alt="npm version" src="https://img.shields.io/npm/v/@fission-ai/openspec?style=flat-square" /></a>
  <a href="https://nodejs.org/"><img alt="node version" src="https://img.shields.io/node/v/@fission-ai/openspec?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://conventionalcommits.org"><img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square" /></a>
</p>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec dashboard preview" width="90%">
</p>

<p align="center">
  Follow <a href="https://x.com/0xTab">@0xTab on X</a> for updates.
</p>

# OpenSpec

**Supported AI Tools:** ✅ Claude Code (custom slash commands) | ✅ Cursor (custom slash commands)

Any assistant that understands the [AGENTS.md](https://agents.md/) convention—such as Codex, Amp, Jules, OpenCode, Gemini CLI, or GitHub Copilot—can consume the OpenSpec instructions, though without the slash-command shortcuts.

**Custom Slash Commands:** Jump straight into any workflow step with the optional `/openspec` commands—no prompt engineering required:

- In Claude Code, type `/openspec:proposal` to draft a change, `/openspec:apply` to implement tasks, and `/openspec:archive` once it's deployed.
- In Cursor, use `/openspec-proposal`, `/openspec-apply`, and `/openspec-archive` for proposals, implementation, and archiving respectively.

You can still trigger every OpenSpec workflow step by chatting with your agent—the slash commands simply provide more precise control for tools that support custom commands.

Create **alignment** between humans and AI coding assistants through spec-driven development. **No API keys required.**

OpenSpec ensures you and your AI assistant agree on what to build before any code is written. By discussing and refining specifications first, you bring determinism to AI code generation, getting exactly what you want, not what the AI thinks you might want.

## Why OpenSpec?

**The Problem:** AI coding assistants are powerful but unpredictable. Without clear specifications, they generate code based on assumptions, often missing requirements or adding unwanted features. Teams waste time in review cycles because humans and AI aren't aligned on what to build.

**The Solution:** OpenSpec creates alignment BEFORE code is written:
- **Human-AI Alignment** - You and your AI agree on specifications before implementation
- **Deterministic, Predictable Output** - Clear specs lead to reliable, repeatable code generation
- **Team Alignment via Spec Reviews** - Everyone reviews intentions, not code surprises
- **Clear Feature Scope** - Know exactly what you're building—and what you're not
- **Progress Tracking** - See what's proposed, in progress, or completed at a glance
- **Living Documentation** - Specs evolve with your code as a natural byproduct
- **Universal Tool Support** - Works with any AI assistant (Claude Code, Cursor, and more)
- **No API Keys Required** - Integrates through context rules, not external services

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

# Select your AI tool:
# "Which AI tool do you use?"
#   > Claude Code (✅ OpenSpec custom slash commands available)
#       Use /openspec:proposal, /openspec:apply, and /openspec:archive in Claude Code to run proposals, apply tasks, and archive changes.
#     Cursor (✅ OpenSpec custom slash commands available)
#       Use /openspec-proposal, /openspec-apply, and /openspec-archive in Cursor for proposals, implementation, and archiving.
#     AGENTS.md (works with Codex, Amp, Copilot, …)
#       Creates/updates a root-level AGENTS.md block for tools that follow the AGENTS.md convention (Codex, Amp, Jules, OpenCode, Gemini CLI, GitHub Copilot, etc.)

# This creates:
# openspec/
#   ├── specs/       # Current specifications (truth)
#   ├── changes/     # Proposed changes
#   └── AGENTS.md    # AI instructions for your tool
```

### 2. Create Your First Change

Jump straight into creating a change proposal with your AI assistant (works with Claude Code, Cursor, or any AI tool):

```markdown
// Quick win - Add a simple new feature:
You: "I want to add a user profile API endpoint.
      Please create an OpenSpec change proposal for this."

AI: "I'll create an OpenSpec change proposal for the user profile API..."
    *Creates openspec/changes/add-user-profile-api/ with:*
    - proposal.md (why this feature is needed)
    - tasks.md (implementation checklist)
    - design.md (API design decisions)
    - specs/user-profile/spec.md (new requirements)

You: "The proposal looks good. Let's implement it."

AI: "Following the tasks in openspec/changes/add-user-profile-api/tasks.md:
     Task 1.1: Create user profile model..."
    *Implements each task systematically*
```

### 3. Track Your Work

```bash
# View active changes (what's being worked on)
openspec list

# Validate your changes are properly formatted
openspec validate add-2fa --strict

# After deployment, archive the completed change
openspec archive add-2fa
# This moves the change to archive/ and updates specs/
```

## Common Commands

```bash
# Most used:
openspec list              # See what changes you're working on
openspec archive <change>  # Mark a change as complete after deployment

# Also useful:
openspec validate <change> # Check formatting before committing
openspec show <change>     # View change details
```

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

## Understanding OpenSpec Files

### Delta Format

Deltas are "patches" that show how specs change:

- **`## ADDED Requirements`** - New capabilities
- **`## MODIFIED Requirements`** - Changed behavior (include complete updated text)
- **`## REMOVED Requirements`** - Deprecated features

**Format requirements:**
- Use `### Requirement: <name>` for headers
- Every requirement needs at least one `#### Scenario:` block
- Use SHALL/MUST in requirement text


## Why OpenSpec Works

OpenSpec creates **alignment** between you and your AI coding assistant:

1. **You describe** what you want to build
2. **AI creates specs** before writing any code
3. **You review and adjust** the specifications
4. **AI implements** exactly what was specified
5. **Everyone understands** what's being built through clear specs

**True Interoperability:** OpenSpec is designed to be universal. No API keys, no vendor lock-in. It works by adding context rules to ANY AI coding tool - whether you use Claude Code today, switch to Cursor tomorrow, or adopt the next breakthrough AI assistant. Your specs remain portable and your workflow stays consistent.


## How OpenSpec Compares

### vs. Kiro.dev
OpenSpec groups all changes for a feature in one place (`openspec/changes/feature-name/`), making it easy to track what needs to be done. Kiro spreads changes across multiple spec folders, making feature tracking harder.

### vs. No Specs
Without specs, AI coding assistants generate code based on vague prompts, often missing requirements or adding unwanted features. OpenSpec ensures alignment before any code is written.

## Team Adoption

### Getting Started with Your Team

1. **Initialize OpenSpec** - Run `openspec init` in your project
2. **Start with new features** - Use OpenSpec for your next change proposal
3. **Build incrementally** - Each new feature adds to your spec library
4. **Future capability** - We're working on tools to generate specs from existing code

**Tool Freedom:** Your team can use different AI assistants. One developer might use Claude Code while another uses Cursor - OpenSpec keeps everyone aligned through shared specifications. Run `openspec update` to configure for any supported tool without affecting others.


## Updating OpenSpec

1. **Upgrade the package**
   - Local dependency: `pnpm add @fission-ai/openspec@latest`
   - Global CLI: `npm install -g @fission-ai/openspec@latest`
2. **Refresh agent instructions**
   - Run `openspec update` inside each project to regenerate AI instructions, refresh the root `AGENTS.md`, and update slash-command bindings.

Run the update step after every version bump (or when switching tools) so your agents always pick up the latest guidance.


## Contributing

- Install dependencies: `pnpm install`
- Build: `pnpm run build`
- Test: `pnpm test`
- Develop CLI locally: `pnpm run dev` or `pnpm run dev:cli`
- Conventional commits (one-line): `type(scope): subject`

## License

MIT
