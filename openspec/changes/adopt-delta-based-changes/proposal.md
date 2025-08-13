# Adopt Delta-Based Changes for Specifications

## Why

The current approach of storing complete future states in change proposals creates a poor review experience. When reviewing changes on GitHub, reviewers see entire spec files (often 100+ lines) as "added" in green, making it impossible to identify what actually changed. With the recent structured format adoption, we now have clear section boundaries that enable a better approach: storing only additions and modifications.

## What Changes

Store only the requirements that actually change, not complete future states:

- **ADDED Requirements**: New capabilities being introduced
- **MODIFIED Requirements**: Existing requirements being changed (must match current header)
- **REMOVED Requirements**: Deprecated capabilities
- **RENAMED Requirements**: Explicit header changes (e.g., `FROM: Old Name` → `TO: New Name`)

The archive command will programmatically apply these deltas using header matching (with whitespace normalization) instead of manually copying entire files.

## Impact

**Affected specs**: openspec-conventions, cli-archive, cli-diff

**Benefits**:
- GitHub diffs show only actual changes (25 lines instead of 150+)
- Reviewers immediately see what's being added, modified, or removed
- Conflicts are more apparent when two changes modify the same requirement
- Archive command can programmatically apply changes

**Compatibility**: Both formats supported - existing full-state changes remain valid.

## Example

Instead of storing a 150-line complete future spec, store only:

```markdown
# User Authentication - Changes

## ADDED Requirements

### Requirement: OAuth Support
Users SHALL authenticate via OAuth providers including Google and GitHub.

#### Scenario: OAuth login flow
- **WHEN** user selects OAuth provider
- **THEN** redirect to provider authorization
- **AND** exchange authorization code for tokens

## MODIFIED Requirements

### Requirement: Session Management
Sessions SHALL expire after 30 minutes of inactivity.

#### Scenario: Inactive session timeout  
- **WHEN** no activity for 30 minutes ← (was 60 minutes)
- **THEN** invalidate session token
- **AND** require re-authentication

## RENAMED Requirements
- FROM: `### Requirement: Basic Authentication`
- TO: `### Requirement: Email Authentication`
```

This makes reviews focused and changes explicit. The archive command can programmatically apply these changes by matching headers (with whitespace normalization).

## Conflict Resolution

Git naturally detects conflicts when two changes modify the same requirement header. This is actually better than full-state storage where Git might silently merge incompatible changes.