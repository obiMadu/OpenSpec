# Adopt Delta-Based Changes for Specifications

## Why

The current approach of storing complete future states in change proposals creates a poor review experience. When reviewing changes on GitHub, reviewers see entire spec files (often 100+ lines) as "added" in green, making it impossible to identify what actually changed. With the recent structured format adoption, we now have clear section boundaries that enable a better approach: storing only additions and modifications.

## What Changes

**Change Storage Convention**
- From: Store complete future state specifications in `changes/[name]/specs/`
- To: Store only ADDED, MODIFIED, or REMOVED requirements/scenarios
- Reason: GitHub diffs become readable, showing only actual changes
- Impact: Breaking change for existing tooling, but improves human review experience

**Change File Format**
- From: Clean markdown files matching future spec structure
- To: Structured sections clearly marking changes:
  - `## ADDED Requirements` - New capabilities
  - `## MODIFIED Requirements` - Changed behaviors  
  - `## REMOVED Requirements` - Deprecated capabilities
  - `## RENAMED Requirements` - Explicit requirement renames
- Reason: Explicit about what's changing vs what stays the same
- Impact: Non-breaking for manual processes, requires tooling updates

**Headers as Unique Identifiers**
- From: Headers are just formatting elements
- To: Headers (`### Requirement: [Name]`) serve as unique IDs for programmatic matching
- Reason: Enables reliable automated application of changes
- Impact: MODIFIED sections must use exact header text from current spec
- Key rules:
  - Exact character-for-character matching required
  - Renames must be explicit in RENAMED section
  - Validation ensures no duplicate headers within a spec

**Complex Changes Handling**
- From: No special handling for structural changes
- To: Support `## RESTRUCTURED Specification` marker for complete reorganizations
- Reason: Some changes genuinely need full state visibility
- Impact: Provides escape hatch for complex changes

**Archive Process**
- From: Manually copy future state to specs/ after deployment
- To: Programmatically apply ADDED/MODIFIED/REMOVED sections to current specs
- Reason: Less error-prone, automatable
- Impact: Requires enhancement to archive tooling

## Impact

- Affected specs: 
  - openspec-conventions: Core change to how changes are stored
  - cli-archive: Must parse and apply deltas instead of copying full states
  - cli-diff: Displays delta sections directly instead of comparing full states
- Affected code: 
  - Archive command implementation (critical - applies deltas programmatically)
  - Diff command implementation (shows delta format)
  - Other CLI commands may need minor updates (init, update, list)
  - Any automation that expects full future states
- Migration: Existing changes can remain as-is; new convention applies to new changes
- Benefits:
  - GitHub PRs show only actual changes (25 lines vs 100+)
  - Reviewers immediately understand what's changing
  - Conflicts are more apparent and easier to resolve
  - Enables better automation for applying changes

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

### Requirement: Session Management    # ← Must match current spec header EXACTLY
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

## Migration Timeline

**Phase 1 (Immediate)**: Both formats supported
- Archive command detects format automatically
- New changes encouraged to use delta format
- Existing full-state changes remain valid

**Phase 2 (After 3 months)**: Delta format required for new changes
- New changes must use delta format
- Existing full-state changes can remain but show deprecation warnings
- Documentation updated to only show delta examples

**Phase 3 (After 6 months)**: Full deprecation
- All changes must use delta format
- Migration tool provided to convert existing full-state changes
- Full-state support removed from CLI commands

## Conflict Resolution

Conflicts are naturally handled by Git's existing merge mechanisms:

**Scenario 1**: Two PRs modify the same requirement
- Both PRs have `### Requirement: Session Management` in their MODIFIED sections
- Git shows conflict in the delta file
- Developer resolves by choosing or combining the modifications

**Scenario 2**: One PR removes, another modifies
- PR A has requirement in REMOVED section
- PR B has same requirement in MODIFIED section
- Git shows conflict, human judgment required

This is actually BETTER than full-state storage where Git might silently merge incompatible changes.