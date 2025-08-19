# Retrospective: Creating an OpenSpec Change Proposal

## Overview

This document captures the errors encountered and lessons learned while creating the `bulk-validation-interactive-selection` change proposal for the OpenSpec project. The process revealed several misconceptions about how OpenSpec's change validation system works, particularly around delta detection and spec file formatting.

## Errors Encountered

### Error 1: Misunderstanding Delta Structure
**Error Message:** `✗ [ERROR] deltas: Change must have at least one delta`

**What I Did Wrong:**
Initially attempted to define deltas directly in the `proposal.md` file using markdown sections like:
```markdown
### Delta: Add validate-all command
**Type**: Feature addition
**Effort**: Small (< 100 lines)
```

**Root Cause:**
Fundamental misunderstanding of how OpenSpec processes deltas. I assumed deltas were parsed from the proposal file itself, when in reality they are derived from spec files in the change's `specs/` directory.

**Discovery Process:**
- Examined the `ChangeParser` class in `/src/core/parsers/change-parser.ts`
- Found that `parseDeltaSpecs()` method looks for spec files in `specs/` subdirectory
- Learned that deltas are extracted by comparing spec files against existing specs

### Error 2: Missing Operation Prefix in Section Headers
**Error Message:** `✗ [ERROR] deltas: Change must have at least one delta`

**What I Did Wrong:**
Initially created new spec files (`cli-validate`, `cli-show`, `cli-validate-all`) with standard `## Requirements` headers instead of operation-prefixed headers.

**Root Cause:**
Failed to understand that ALL spec files in a change need operation prefixes (`ADDED`, `MODIFIED`, etc.) in their section headers, regardless of whether they're new specs or modifications. The system **does** support creating entirely new specs - they just need the `## ADDED Requirements` header to be recognized as deltas.

**Discovery Process:**
- Created new specs with `## Requirements` → No deltas detected
- Changed to `## ADDED Requirements` → Deltas detected successfully!
- Realized creating new specs works perfectly fine once properly formatted
- The confusion came from seeing `cli-change` and `cli-spec` in other changes and incorrectly assuming that was related to my issue

**Clarification:**
OpenSpec fully supports creating new specs. They appear as ADDED operations in the deltas. My initial analysis incorrectly suggested this was a limitation, but it was actually just a formatting issue.

### Error 3: Improper Scenario Formatting
**Error Message:** 
```
✗ [ERROR] deltas.0.requirements.0.scenarios: Requirement must have at least one scenario
✗ [ERROR] deltas.1.requirements.0.scenarios: Requirement must have at least one scenario
```

**What I Did Wrong:**
Formatted scenarios as bullet lists under a bold "Scenarios:" label:
```markdown
**Scenarios:**
- **WHEN** executing command
- **THEN** expected behavior
```

**Root Cause:**
OpenSpec's parser expects scenarios to be defined as level 4 headers (`####`) with specific formatting:
```markdown
#### Scenario: Descriptive scenario name

- **WHEN** executing command
- **THEN** expected behavior
```

**Discovery Process:**
- Checked parsed JSON output: `npx openspec change show bulk-validation-interactive-selection --json`
- Saw `"scenarios": []` empty array despite having scenario content
- Examined working spec files and found the `#### Scenario:` header pattern
- Updated all scenarios to use proper header format

### Error 4: File Path Confusion
**Initial Confusion:**
Wasn't clear whether to create specs that would become part of the main `openspec/specs/` or just define them in the change.

**Resolution:**
Learned that changes can:
1. Create new specs (they start in `changes/{change-name}/specs/` and move to `openspec/specs/` when archived)
2. Modify existing specs (by creating a spec file with the same name as one in `openspec/specs/`)
3. The validation system detects both patterns and creates appropriate deltas

## Key Learnings

### 1. OpenSpec's Delta Detection Algorithm
The system follows this process:
1. Scans `openspec/changes/{change-name}/specs/` directory
2. For each spec file found, parses for delta sections (`ADDED`, `MODIFIED`, `REMOVED`, `RENAMED`)
3. Creates delta objects with operation type, affected spec, and requirements
4. Validates that at least one delta exists for the change to be valid

**Important:** Creating entirely new specs is fully supported! New specs use `## ADDED Requirements` and appear as ADDED operations in the deltas. The system handles both new specs and modifications to existing specs seamlessly.

### 2. Spec File Structure Requirements
Valid spec files must follow this structure:
```markdown
# Spec Title

## [ADDED|MODIFIED|REMOVED|RENAMED] Requirements

### Requirement: Clear requirement statement

The requirement description using SHALL/SHOULD/MAY.

#### Scenario: Scenario name

- **WHEN** condition
- **THEN** expected outcome
- **AND** additional outcomes
```

### 3. Change Proposal Structure
A valid change must have:
- `## Why` section - explaining the motivation
- `## What Changes` section - summarizing the changes
- `specs/` directory with properly formatted spec files containing deltas
- Each delta must have at least one requirement with at least one scenario

### 4. Validation Command Is Your Friend
The validation command provides immediate feedback:
```bash
npx openspec change validate {change-name} --strict
```
Using `--strict` flag helps catch warnings that might cause issues later.

### 5. JSON Output for Debugging
When deltas aren't being recognized, use JSON output to debug:
```bash
npx openspec change show {change-name} --json | jq '.deltas'
```
This shows exactly what the parser is extracting from your files.

## Recommendations for Future Development

1. **Improve Error Messages**: The error "Change must have at least one delta" could be more helpful by explaining where deltas come from and how they're detected.

2. **Add Delta Detection Debugging**: A command like `openspec change debug-deltas {change-name}` that shows:
   - Which spec directories were scanned
   - Which delta sections were found
   - Why certain sections weren't recognized as deltas

3. **Documentation Enhancement**: Add a "Creating Your First Change" tutorial that walks through:
   - Creating the proposal.md file
   - Creating spec files with proper delta sections
   - Understanding how deltas are detected
   - Common pitfalls and how to avoid them

4. **Validation Hints**: When validation fails, provide hints about common issues:
   - "No deltas found. Check that your specs/ directory contains .md files with ADDED/MODIFIED/REMOVED Requirements sections"
   - "Scenarios not found. Ensure each scenario starts with #### Scenario: {name}"

5. **Template Generation**: Consider adding a command like `openspec change scaffold {change-name}` that creates:
   - Basic proposal.md with required sections
   - Example spec file with proper delta format
   - Empty tasks.md file

## Conclusion

Creating an OpenSpec change proposal requires understanding the intricate relationship between proposal files, spec files, and the delta detection system. The errors encountered during this process highlighted areas where the system's expectations weren't immediately clear from the documentation or error messages.

The key insight is that OpenSpec treats changes as collections of deltas (specific modifications to specifications), not as standalone documents. This delta-centric approach ensures changes are atomic, trackable, and can be validated against the existing specification structure.

The validation system, while strict, provides a robust framework for maintaining specification quality and consistency across a project's evolution. Understanding its requirements upfront saves significant debugging time and ensures changes follow the intended patterns.