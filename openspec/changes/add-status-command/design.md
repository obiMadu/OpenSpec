# Status Command Technical Design

## Overview

The status command provides visibility into the state of OpenSpec changes, helping developers understand what needs attention and guiding them toward appropriate actions.

## Command Interface

```bash
# Default summary view
openspec status

# Detailed view with task breakdowns
openspec status --detailed

# JSON output for tooling integration
openspec status --json

# Filter by status
openspec status --filter ready
openspec status --filter in-progress
```

## Architecture

### Core Components

1. **Task Parser** (`src/utils/task-parser.ts`)
   - Robust regex patterns for various checkbox formats
   - Context-aware parsing to avoid false positives
   - Format validation and normalization

2. **Status Scanner** (`src/core/status.ts`)
   - Directory traversal and change discovery
   - Metadata collection (timestamps, file counts)
   - Categorization and sorting logic

3. **Display Formatter**
   - Terminal-friendly output with colors
   - Progress bars and visual indicators
   - Actionable tips and suggestions

### Task Detection Strategy

#### Supported Checkbox Formats
```regex
Complete:   /^\s*[-*+]\s*\[[xX✓✗*]\s*\]/
Incomplete: /^\s*[-*+]\s*\[\s*\]/
```

#### Context-Aware Parsing
- Skip content within code blocks (```)
- Ignore example/documentation sections
- Handle nested tasks with indentation
- Validate task numbering schemes

### Data Flow

```
CLI Command → Status Scanner → Change Discovery
                                    ↓
                              Task Parser (per change)
                                    ↓
                              Categorization
                                    ↓
                              Format & Display
```

## Categorization Logic

### Ready to Archive
- All tasks marked complete (`[x]`)
- No incomplete tasks (`[ ]`)
- Change exists in `changes/` (not archive/)
- Optional: Age threshold (e.g., > 1 day old)

### In Progress
- Has at least one incomplete task
- May have some completed tasks
- Active development (recent modifications)

### Recently Archived
- Located in `changes/archive/`
- Show last 5-10 by date
- Provides context of recent completions

## Output Design

### Summary View (Default)
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

Recently Archived:
  📦 2025-01-15-deploy-feature
  📦 2025-01-14-hotfix-prod

→ Run 'openspec archive' to archive completed changes
```

### Detailed View
```
openspec status --detailed

✅ READY: feature-auth
├─ Location: changes/feature-auth
├─ Tasks: 15/15 complete (100%)
├─ Age: 3 days since last update
├─ Size: 5 files, 2 specs affected
└─ Action: Ready to archive

⚠️ IN PROGRESS: add-user-profile
├─ Location: changes/add-user-profile
├─ Tasks: 12/20 complete (60%)
├─ Remaining:
│  - [ ] 3.2 Add validation logic
│  - [ ] 4.1 Write unit tests
│  ... (6 more)
├─ Age: 2 days since last update
└─ Action: Complete remaining tasks
```

### JSON Output
```json
{
  "ready": [
    {
      "name": "feature-auth",
      "path": "changes/feature-auth",
      "tasks": { "complete": 15, "total": 15 },
      "age_days": 3,
      "has_specs": true
    }
  ],
  "in_progress": [...],
  "archived": [...]
}
```

## Robustness Features

### Format Tolerance
- Accept common variations (`[X]`, `[x]`, `[✓]`)
- Handle different bullet styles (`-`, `*`, `+`)
- Normalize whitespace variations
- Support indented sub-tasks

### Error Recovery
- Gracefully handle missing `tasks.md`
- Skip malformed files with warnings
- Continue scanning despite individual errors
- Provide helpful error messages

### Performance
- Lazy file reading (scan headers first)
- Parallel directory scanning
- Cache results for repeated calls
- Minimal memory footprint

## Integration Points

### With Archive Command
- Status provides visibility for archive decisions
- Archive command could auto-detect from status
- Shared task parsing logic

### With Future Commands
- Status sets patterns for change discovery
- Reusable categorization logic
- Foundation for change management

## Configuration

### Environment Variables
- `OPENSPEC_STATUS_DETAILED` - Default to detailed view
- `OPENSPEC_STATUS_ARCHIVED_LIMIT` - Number of archived items to show
- `OPENSPEC_STATUS_NO_COLOR` - Disable colored output

### Future Config File
```json
{
  "status": {
    "showArchived": true,
    "archivedLimit": 5,
    "readyThresholdDays": 1,
    "useEmoji": true
  }
}
```

## Testing Strategy

### Unit Tests
- Task parser with various formats
- Categorization logic
- Age calculations
- Format normalization

### Integration Tests
- Full directory scanning
- Multiple change scenarios
- Error conditions
- Output formatting

### Test Cases
1. Standard format tasks
2. Mixed format tasks
3. Nested tasks
4. Code blocks with fake tasks
5. Missing tasks.md
6. Empty directories
7. Large numbers of changes

## Future Enhancements

1. **Git Integration**
   - Show merge status
   - Display last commit info
   - Check deployment tags

2. **Interactive Mode**
   - Select changes to archive
   - Mark tasks complete
   - Quick actions menu

3. **Notifications**
   - Desktop notifications for stale changes
   - Slack/Discord webhooks
   - Email summaries

4. **Analytics**
   - Average time to archive
   - Task completion velocity
   - Change lifecycle metrics