# OpenSpec

[![CI](https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg)](https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@fission-ai/openspec)](https://www.npmjs.com/package/@fission-ai/openspec)
[![node](https://img.shields.io/node/v/@fission-ai/openspec)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

AI-native system for spec-driven development. Keep living specifications alongside code, propose changes as deltas, and archive once reality matches the spec.

## Overview

- Specs are the current truth stored in `openspec/specs/<capability>/spec.md`.
- Changes are proposals stored in `openspec/changes/<name>/` with delta-formatted spec updates.
- The CLI favors verb-first commands: `list`, `show`, `validate`, `diff`, `archive`.

## Prerequisites

- Node.js >= 20.19.0
- pnpm (project standard)

## Installation

- Global: `pnpm add -g @fission-ai/openspec`
- Local (per project):
  - `pnpm add -D @fission-ai/openspec`
  - Run with `pnpm exec openspec ...`

## Quick Start

```bash
# Initialize OpenSpec in your project
openspec init

# Update OpenSpec instructions (team-friendly)
openspec update

# List items (IDs only). Use --specs to list specs
openspec list                 # defaults to changes
openspec list --specs

# Show an item (raw text by default)
openspec show <item>
openspec show <item> --json   # automation-friendly output

# Validate
openspec validate --changes --strict
openspec validate --specs --json

# See diffs between a change and current specs
openspec diff <change-id>

# Archive a completed change
openspec archive <change-id> [--skip-specs]
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

Critical formatting rules:
- Use `### Requirement: <name>` for requirement headers.
- Every requirement MUST include at least one `#### Scenario:` block.
- Use SHALL/MUST in ADDED/MODIFIED requirement text.

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

## Team Workflow

- `openspec update` is team-friendly: it updates `openspec/README.md` and only modifies AI config files that already exist (e.g., CLAUDE.md), never forcing tools on teammates.
- Multiple AI tools can co-exist without conflicts.

## Deprecation Note

Noun-first commands (`openspec spec ...`, `openspec change ...`) are available but deprecated. Prefer verb-first commands: `openspec list`, `openspec show`, `openspec validate`.

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

- Use pnpm: `pnpm install`, `pnpm run build`, `pnpm test`.
- Develop CLI locally: `pnpm dev` or `pnpm dev:cli`.
- Conventional commits (one-line): `type(scope): subject`.

## License

MIT
