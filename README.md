# OpenSpec

A specification-driven development system for maintaining living documentation alongside your code.

## Installation

```bash
npm install -g openspec
```

## Quick Start

```bash
# Initialize OpenSpec in your project
openspec init

# Update existing OpenSpec instructions (team-friendly)
openspec update

# List all specifications
openspec list

# Show differences between specs and proposed changes
openspec diff [change-name]

# Archive completed changes
openspec archive [change-name]
```

## Commands

### `openspec init`

Initializes OpenSpec in your project by creating:
- `openspec/` directory structure
- `openspec/README.md` with OpenSpec instructions
- AI tool configuration files (based on your selection)

### `openspec update`

Updates OpenSpec instructions to the latest version. This command is **team-friendly** and only updates files that already exist:

- Always updates `openspec/README.md` with the latest OpenSpec instructions
- **Only updates existing AI tool configuration files** (e.g., CLAUDE.md, CURSOR.md)
- **Never creates new AI tool configuration files**
- Preserves content outside of OpenSpec markers in AI tool files

This allows team members to use different AI tools without conflicts. Each developer can maintain their preferred AI tool configuration file, and `openspec update` will respect their choice.

### `openspec list`

Lists all specifications and pending changes in your project:
- Shows current specifications in `openspec/specs/`
- Shows pending changes in `openspec/changes/`
- Shows archived changes in `openspec/changes/archive/`

### `openspec diff [change-name]`

Shows the differences between current specs and proposed changes:
- Displays a unified diff format
- Helps review what will change before implementation
- Useful for pull request reviews

### `openspec archive [change-name]`

Archives a completed change:
- Moves change from `openspec/changes/` to `openspec/changes/archive/`
- Adds a date prefix to the archived change
- Updates specs to reflect the new state
- Use `--skip-specs` to archive without updating specs (for abandoned changes)

## Team Collaboration

OpenSpec is designed for team collaboration:

1. **AI Tool Flexibility**: Each team member can use their preferred AI assistant (Claude, Cursor, etc.)
2. **Non-Invasive Updates**: The `update` command only modifies existing files, never forcing tools on team members
3. **Specification Sharing**: The `openspec/` directory contains shared specifications that all team members work from
4. **Change Tracking**: Proposed changes are visible to all team members for review before implementation

## Contributing

See `openspec/specs/` for the current system specifications and `openspec/changes/` for pending improvements.

## License

MIT