# Technical Design

## Architecture Decisions

### Simplicity First
- No version tracking - always update when commanded
- Complete file replacement - no content merging
- Templates bundled with package - no network required
- Minimal error handling - only check prerequisites

### Template Strategy
- Use existing template functions from `src/core/templates.ts`
- `getOpenSpecReadmeTemplate()` for README.md
- `getClaudeMdTemplate()` for CLAUDE.md
- Pass directory name parameter from config

### File Operations
- Simple synchronous writes using `fs.writeFileSync`
- No atomic operations needed - users have git
- Check directory existence before proceeding

## Implementation

### Update Command (`src/cli/update.ts`)
```typescript
export class UpdateCommand {
  async execute(): Promise<void> {
    // 1. Get config (directory name)
    const config = await getConfig();
    const openspecDir = path.join(process.cwd(), config.directoryName);
    
    // 2. Check openspec directory exists
    if (!fs.existsSync(openspecDir)) {
      console.error(`No OpenSpec directory found. Run 'openspec init' first.`);
      process.exit(1);
    }
    
    // 3. Update README.md
    const readmePath = path.join(openspecDir, 'README.md');
    const readmeContent = getOpenSpecReadmeTemplate(config.directoryName);
    fs.writeFileSync(readmePath, readmeContent);
    
    // 4. Update CLAUDE.md
    const claudePath = path.join(process.cwd(), 'CLAUDE.md');
    const claudeContent = getClaudeMdTemplate(config.directoryName);
    fs.writeFileSync(claudePath, claudeContent);
    
    // 5. Success message
    console.log('✓ Updated OpenSpec instructions');
  }
}
```

## Why This Approach

### Benefits
- **Dead simple**: ~30 lines of code total
- **Fast**: No version checks, no parsing, just write
- **Predictable**: Same result every time
- **Maintainable**: Almost nothing to break

### Trade-offs Accepted
- No content preservation (users should not customize these files)
- No version tracking (unnecessary complexity)
- Always overwrites (idempotent operation)

## Error Handling

Only handle critical errors:
- Missing openspec directory → Tell user to run init first
- File write failures → Let Node.js error bubble up

## Testing Strategy

Manual testing is sufficient:
1. Run `openspec init` in test project
2. Modify both files
3. Run `openspec update`
4. Verify files replaced
5. Test with missing openspec directory