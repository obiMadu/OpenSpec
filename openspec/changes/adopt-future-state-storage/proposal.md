# Adopt Future State Storage for OpenSpec Changes

## Why

The current approach of storing spec changes as diff files (`.spec.md.diff`) creates friction for both humans and AI. Diff syntax with `+` and `-` prefixes makes specs hard to read, AI tools struggle with the format when understanding future state, and GitHub can't show nice comparisons between current and proposed specs in different folders.

## What Changes

### OpenSpec Change Storage Convention

**Change File Structure**
- From: Store changes as diff files in `patches/[capability]/spec.md.diff`
- To: Store complete future state as clean markdown in `specs/[capability]/spec.md`
- Reason: Clean markdown is readable, AI-friendly, and tool-compatible
- Impact: Breaking - existing changes must be migrated to new format

**Proposal Documentation Requirements**
- From: Proposals can be brief since diffs show changes
- To: Proposals must explicitly document all behavioral changes with before/after
- Reason: Compensate for not having inline diffs by being explicit
- Impact: Non-breaking - improves clarity and review process

### File Updates Required

**openspec/README.md (AI Instructions)**
- Section: "Creating a Change Proposal" (lines 85-108)
- From: Instructions to create `patches/` directory with diff files
- To: Instructions to create `specs/` directory with complete future state
- Impact: Changes how AI assistants create proposals

**docs/PRD.md**
- Multiple sections showing directory structures (lines 376-382, 778-783)
- From: Examples showing `patches/*.diff` structure
- To: Examples showing `specs/*.md` structure
- Impact: Documentation consistency

**docs/openspec-walkthrough.md**
- Example change structure (lines 58-62, 112-126)
- From: Shows diff file examples
- To: Shows clean future state examples
- Impact: Tutorial accuracy

### New Capability: openspec-conventions

Adding a new spec that documents OpenSpec's own storage conventions, making them explicit and versionable. This meta-spec will serve as the source of truth for how OpenSpec changes should be structured.

## Impact Summary

- **Breaking changes**: Existing changes using diff format need migration
- **Affected systems**: 
  - AI assistants creating changes
  - Developers reviewing changes
  - Any tooling that processes change files
- **Migration required**: Yes - convert existing `add-init-command` change from diff to future state format

## Benefits

1. **AI-friendly**: AI tools can read and write normal markdown without diff syntax parsing
2. **Human-readable**: Reviewers see the intended end state clearly without mental diff processing
3. **Simple tooling**: Standard `diff` command or GitHub PR view shows changes
4. **Clean files**: No syntax pollution with `+` and `-` prefixes
5. **Better proposals**: Explicit change documentation improves review quality

## Migration Path

For the existing `add-init-command` change:
1. Apply the current diff to generate the complete future state
2. Store as `specs/cli-init/spec.md` (clean markdown)
3. Update proposal to be explicit about what's new
4. Remove old `patches/` directory

## Viewing Changes

With this approach, reviewers can see changes using:
- GitHub PR diff view (automatic when files change)
- Command line: `diff -u specs/user-auth/spec.md changes/[name]/specs/user-auth/spec.md`
- Any diff tool (VS Code, GitHub Desktop, etc.)

The key insight: we don't need to store diffs when tools can generate them on demand.