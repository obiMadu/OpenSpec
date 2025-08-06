# CLI Init Specification

## Purpose

The `openspec init` command SHALL create a complete OpenSpec directory structure in any project, enabling immediate adoption of OpenSpec conventions with support for multiple AI coding assistants.

## Behavior

### Directory Creation

WHEN `openspec init` is executed
THEN create the following directory structure:
```
openspec/
├── project.md
├── README.md
├── specs/
└── changes/
    └── archive/
```

WHEN `--dir <name>` flag is provided
THEN use custom directory name instead of "openspec"

### File Generation

The command SHALL generate:
- `README.md` containing complete OpenSpec instructions for AI assistants
- `project.md` with customizable project context template

### AI Tool Configuration

WHEN run interactively
THEN prompt user to select AI tools to configure:
- Claude Code (updates/creates CLAUDE.md with OpenSpec markers)
- Cursor (future)
- Aider (future)

WHEN updating existing AI configuration files
THEN preserve existing content using markers:
- Insert OpenSpec content between `<!-- OPENSPEC:START -->` and `<!-- OPENSPEC:END -->`
- Preserve all content outside markers

### Interactive Mode

WHEN run
THEN prompt user to select AI tools to configure (multiple choice):
- Claude Code (available)
- Cursor (coming soon)
- Aider (coming soon)
- Continue (coming soon)

### Safety Checks

WHEN `openspec/` directory already exists
THEN exit with error message: "OpenSpec seems to already be initialized. Use 'openspec update' to update the structure."

### Success Output

WHEN initialization completes successfully
THEN display next steps:
```
✅ OpenSpec initialized successfully!

Next steps:
1. Edit openspec/project.md to add your project-specific guidelines
2. Create your first change with: openspec change create <change-name>
3. Start building with spec-driven development!
```

### Exit Codes

- 0: Success
- 1: OpenSpec directory already exists
- 2: Insufficient permissions
- 3: User cancelled operation

## Why

Manual creation of OpenSpec structure is error-prone and creates adoption friction. A standardized init command ensures:
- Consistent structure across all projects
- Proper AI instruction files are always included
- Quick onboarding for new projects
- Clear conventions from the start