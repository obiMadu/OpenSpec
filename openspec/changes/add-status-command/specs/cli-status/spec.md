# CLI Status Command Specification

## Purpose

The status command provides visibility into the state of all OpenSpec changes, showing which are ready to archive, which are in progress, and which were recently archived. It helps developers understand what needs attention and guides them toward appropriate next actions.

## Command Interface

### Basic Usage

```bash
# Show summary of all changes
openspec status

# Show detailed information
openspec status --detailed

# Output as JSON for tooling
openspec status --json

# Filter by category
openspec status --filter ready
openspec status --filter in-progress
```

### Options

- `--detailed, -d`: Show detailed task breakdowns and metadata
- `--json, -j`: Output in JSON format for programmatic use
- `--filter, -f <category>`: Filter by status category (ready, in-progress, archived)
- `--no-color`: Disable colored output
- `--no-archived`: Hide recently archived changes

## Behavior

### Change Discovery

WHEN the status command runs
THEN it SHALL:
1. Scan the `changes/` directory recursively
2. Identify all non-archived changes (exclude `archive/` subdirectory)
3. Locate and parse `tasks.md` in each change directory
4. Collect metadata (timestamps, file counts, spec presence)
5. Categorize changes based on task completion

### Task Parsing

WHEN parsing a `tasks.md` file
THEN the parser SHALL:
1. Identify task items using flexible patterns
2. Accept multiple checkbox formats as complete: `[x]`, `[X]`, `[✓]`, `[*]`
3. Accept multiple checkbox formats as incomplete: `[ ]`, `[]`
4. Skip tasks within code blocks (between ``` markers)
5. Skip tasks in example or documentation sections
6. Handle nested tasks with proper indentation recognition
7. Count total tasks and completed tasks

### Categorization Rules

#### Ready to Archive
A change is ready to archive when:
- ALL tasks are marked complete (no incomplete checkboxes)
- The change directory exists in `changes/` (not archived)
- At least one task exists in `tasks.md`

#### In Progress
A change is in progress when:
- At least ONE task is incomplete
- The change directory exists in `changes/` (not archived)

#### Recently Archived
A change is recently archived when:
- Located in `changes/archive/` directory
- Has a date prefix in the format `YYYY-MM-DD-`

### Output Format

#### Summary View (Default)

The summary view SHALL display:
1. A header with "OpenSpec Status Report"
2. Categorized sections for each status type
3. For each change: name, task completion ratio, age
4. Visual indicators (✓ for ready, ⚠ for in-progress, 📦 for archived)
5. Actionable tips at the bottom

Example output:
```
OpenSpec Status Report
═══════════════════════

Ready to Archive (2):
  ✓ feature-auth           15/15 tasks   3 days old
  ✓ fix-payment-bug        8/8 tasks     1 day old

In Progress (3):
  ⚠ add-user-profile       12/20 tasks   2 days old
  ⚠ refactor-api          3/10 tasks    5 days old
  ⚠ update-docs           0/5 tasks     today

Recently Archived (2):
  📦 2025-01-15-feature-deploy
  📦 2025-01-14-hotfix-prod

→ Run 'openspec archive' to archive completed changes
→ 2 changes are ready for archiving
```

#### Detailed View

WHEN `--detailed` flag is provided
THEN display for each change:
1. Full path to change directory
2. Complete task statistics with percentage
3. List of incomplete tasks (up to 5, then "... X more")
4. File and spec information
5. Suggested next action

#### JSON Output

WHEN `--json` flag is provided
THEN output a JSON object with:
```json
{
  "summary": {
    "ready_count": 2,
    "in_progress_count": 3,
    "archived_count": 2
  },
  "ready": [...],
  "in_progress": [...],
  "archived": [...]
}
```

### Task Format Recognition

The command SHALL recognize tasks in these formats:

#### Standard Formats (Always Supported)
```markdown
- [ ] Incomplete task
- [x] Complete task
- [X] Complete task (uppercase)
```

#### Extended Formats (Best Effort)
```markdown
- [✓] Complete with checkmark
- [*] Complete with asterisk
* [ ] Task with asterisk bullet
+ [x] Task with plus bullet
  - [ ] Indented subtask
    - [x] Nested subtask
```

### Error Handling

WHEN encountering errors
THEN the command SHALL:
1. Continue scanning other changes (don't fail entirely)
2. Display warnings for malformed files
3. Show partial results with clear error indicators
4. Exit with appropriate status codes

### Exit Codes

- `0`: Success - status displayed successfully
- `1`: Partial failure - some changes couldn't be scanned
- `2`: Total failure - unable to scan changes directory
- `3`: Invalid arguments

## Performance Requirements

The status command SHALL:
1. Complete scanning within 2 seconds for up to 100 changes
2. Use minimal memory (stream files, don't load entirely)
3. Cache results for rapid successive calls (5-second cache)
4. Display results progressively (show completed categories first)

## Visual Design

### Color Coding
- Green (✓): Ready to archive
- Yellow (⚠): In progress
- Blue (📦): Recently archived
- Red: Errors or warnings
- Gray: Metadata (age, counts)

### Icons/Symbols
- ✓ Checkmark: Complete/ready
- ⚠ Warning: In progress/attention needed
- 📦 Package: Archived
- → Arrow: Suggested action
- ├─ Tree: Hierarchical information

## Integration

### With Archive Command
The status command provides input for archive decisions:
- Identifies which changes are ready
- Can be piped to archive for automation
- Shares task parsing logic

### With Other Tools
The JSON output enables integration with:
- CI/CD pipelines
- Dashboard tools
- Automated notifications
- Custom scripts

## Configuration

### Supported Environment Variables
- `OPENSPEC_STATUS_NO_COLOR`: Disable colors
- `OPENSPEC_STATUS_DETAILED`: Default to detailed view
- `OPENSPEC_STATUS_ARCHIVED_LIMIT`: Number of archived items to show (default: 5)

### Future Configuration
Will support `.openspec/config.json`:
```json
{
  "status": {
    "defaultView": "summary|detailed",
    "showArchived": true,
    "archivedLimit": 5,
    "useEmoji": true,
    "colorScheme": "default|minimal|none"
  }
}
```