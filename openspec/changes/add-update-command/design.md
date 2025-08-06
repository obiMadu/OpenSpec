# Technical Design

## Architecture Decisions

### Template Storage Strategy
- Templates remain embedded as TypeScript functions in `src/core/templates.ts`
- Templates support dynamic parameters (directory name, version)
- No network access required - templates bundled with package

### Version Management
- Package version read from `package.json` at runtime
- Project version stored as plain text in `.openspec/version`
- Simple string comparison for version checking
- Force flag bypasses all version checks

### Content Preservation Strategy
- **openspec/README.md**: Full replacement with latest template
- **CLAUDE.md**: Surgical update using markers
  - Content between `<!-- OPENSPEC:START -->` and `<!-- OPENSPEC:END -->` gets replaced
  - All other content preserved exactly
  - If markers don't exist, append new section with markers

### File Operations
- Use Node.js `fs.promises` for async operations
- Atomic writes via write-then-rename pattern
- Check file existence before operations
- Clear error messages for missing prerequisites

## Implementation Details

### Version Utilities (`src/utils/version.ts`)
```typescript
export async function getPackageVersion(): Promise<string>
export async function getProjectVersion(): Promise<string | null>
export async function saveProjectVersion(version: string): Promise<void>
export async function compareVersions(v1: string, v2: string): boolean
```

### Update Command Flow
```typescript
class UpdateCommand {
  async execute(options: { force?: boolean }) {
    // 1. Verify openspec directory exists
    // 2. Get package and project versions
    // 3. Check if update needed (or forced)
    // 4. Update openspec/README.md
    // 5. Update CLAUDE.md if it exists
    // 6. Save new version to .openspec/version
    // 7. Report success with version info
  }
}
```

### CLAUDE.md Update Logic
```typescript
function updateClaudeMd(content: string, newTemplate: string): string {
  const START = '<!-- OPENSPEC:START -->';
  const END = '<!-- OPENSPEC:END -->';
  
  if (content.includes(START)) {
    // Replace existing section
    const regex = new RegExp(`${START}[\\s\\S]*?${END}`, 'g');
    return content.replace(regex, `${START}\n${newTemplate}\n${END}`);
  } else {
    // Append new section
    return content + `\n\n${START}\n${newTemplate}\n${END}`;
  }
}
```

## Trade-offs

### Simplicity vs Features
- No diff preview (users have git for comparison)
- No selective updates (all-or-nothing approach)
- No rollback mechanism (users rely on git)
- No network updates (must upgrade package first)

### Backward Compatibility
- Gracefully handle missing `.openspec/version` (treat as v0.0.0)
- Support projects without CLAUDE.md (skip that update)
- Preserve all user content outside managed sections

## Error Handling

### Expected Errors
- No openspec directory → "Run 'openspec init' first"
- File permission issues → Include file path in error
- Invalid version format → Treat as needing update

### Recovery Strategy
- Never partially update files
- Verify all preconditions before any writes
- Use try-catch at command level, not in utilities

## Testing Strategy

### Unit Tests
- Mock file system for version utilities
- Test marker-based content replacement
- Test version comparison logic

### Integration Tests
- Create temp directories for real file operations
- Test full update flow with various scenarios
- Verify content preservation in CLAUDE.md
- Test force flag behavior