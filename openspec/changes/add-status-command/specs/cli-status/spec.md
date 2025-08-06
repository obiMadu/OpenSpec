# CLI Status Command Specification

## Purpose

The status command shows which OpenSpec changes are ready to archive by displaying task completion status for each change.

## Command Interface

```bash
# Show status of all changes
openspec status
```

## Behavior

WHEN the status command runs:
1. Scan the `openspec/changes/` directory
2. Skip the `archive/` subdirectory
3. For each change directory with a `tasks.md` file:
   - Count tasks marked with `[x]` (case-insensitive)
   - Count tasks marked with `[ ]`
   - Display the change name and completion status

## Output Format

```
add-auth-feature: 15/15
fix-payment-bug: 8/8
refactor-api: 3/10
update-docs: 0/5
```

Or with checkmark for fully complete:

```
add-auth-feature: ✓
fix-payment-bug: ✓  
refactor-api: 3/10
update-docs: 0/5
```

## Task Detection

The command recognizes these patterns as tasks:
- `- [ ]` Incomplete task
- `- [x]` Complete task (lowercase)
- `- [X]` Complete task (uppercase)

## Error Handling

- If no `tasks.md` exists, skip that change
- If `tasks.md` is empty or has no tasks, skip that change
- Continue scanning even if individual files have errors

## Exit Codes

- `0`: Success - status displayed
- `1`: Error - unable to scan changes directory