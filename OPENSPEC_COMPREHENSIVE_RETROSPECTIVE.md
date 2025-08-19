# Comprehensive Retrospective: Creating an OpenSpec Change Proposal

## Executive Summary

This document consolidates learnings from creating the `bulk-validation-interactive-selection` change proposal for OpenSpec. The process revealed critical gaps in documentation, unhelpful error messages, and areas where the system could be more user-friendly. While OpenSpec's core functionality works correctly, the user experience for creating changes needs significant improvement.

## Table of Contents
1. [Errors Encountered](#errors-encountered)
2. [System Issues vs User Errors](#system-issues-vs-user-errors)
3. [Documentation Gaps Analysis](#documentation-gaps-analysis)
4. [Key Learnings](#key-learnings)
5. [Recommendations](#recommendations)
6. [Conclusion](#conclusion)

---

## Errors Encountered

### Error 1: Misunderstanding Delta Structure
**Error Message:** `✗ [ERROR] deltas: Change must have at least one delta`

**What Happened:**
Initially attempted to define deltas directly in the `proposal.md` file using markdown sections like:
```markdown
### Delta: Add validate-all command
**Type**: Feature addition
**Effort**: Small (< 100 lines)
```

**Root Cause:**
Fundamental misunderstanding of how OpenSpec processes deltas. Deltas are derived from spec files in the change's `specs/` directory, not from the proposal itself.

**Discovery Process:**
- Examined `ChangeParser` class in `/src/core/parsers/change-parser.ts`
- Found that `parseDeltaSpecs()` method looks for spec files in `specs/` subdirectory
- Learned that deltas are extracted by comparing spec files against existing specs

### Error 2: Missing Operation Prefix in Section Headers
**Error Message:** `✗ [ERROR] deltas: Change must have at least one delta`

**What Happened:**
Created new spec files with standard `## Requirements` headers instead of operation-prefixed headers.

**Root Cause:**
Failed to understand that ALL spec files in a change need operation prefixes (`ADDED`, `MODIFIED`, etc.) in their section headers, regardless of whether they're new specs or modifications.

**Discovery Process:**
- Created new specs with `## Requirements` → No deltas detected
- Changed to `## ADDED Requirements` → Deltas detected successfully!
- Realized creating new specs works perfectly fine once properly formatted

**Important Clarification:**
OpenSpec fully supports creating new specs. They appear as ADDED operations in the deltas. My initial analysis incorrectly suggested this was a limitation, but it was actually just a formatting issue.

### Error 3: Improper Scenario Formatting
**Error Message:** 
```
✗ [ERROR] deltas.0.requirements.0.scenarios: Requirement must have at least one scenario
✗ [ERROR] deltas.1.requirements.0.scenarios: Requirement must have at least one scenario
```

**What Happened:**
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

### Error 4: File Path Confusion
**Initial Confusion:**
Wasn't clear whether to create specs that would become part of the main `openspec/specs/` or just define them in the change.

**Resolution:**
Learned that changes can:
1. Create new specs (they start in `changes/{change-name}/specs/` and move to `openspec/specs/` when archived)
2. Modify existing specs (by creating a spec file with the same name as one in `openspec/specs/`)
3. The validation system detects both patterns and creates appropriate deltas

---

## System Issues vs User Errors

### System Issues / Bugs

#### 1. Unhelpful Error Messages ⚠️
**Issue:** `✗ [ERROR] deltas: Change must have at least one delta`

**Why This Is a System Problem:**
- Error message provides no guidance on HOW to create deltas
- Doesn't mention that deltas come from `specs/` subdirectory
- Doesn't explain the required section headers
- A better error would be: "No deltas found. Ensure your change has a specs/ directory with .md files containing sections like '## ADDED Requirements'"

#### 2. Silent Scenario Parsing Failures ⚠️
**Issue:** When scenarios were formatted incorrectly, they were silently ignored

**Why This Is a System Problem:**
- Parser silently returns empty scenarios array instead of warning
- No validation error explaining the format issue
- User gets "Requirement must have at least one scenario" without knowing their scenarios exist but aren't parsed

**Evidence:**
```json
{
  "text": "The CLI SHALL provide a top-level `show` command with interactive selection.",
  "scenarios": []  // Silent failure - scenarios existed but weren't parsed
}
```

#### 3. No Validation for Proposal Structure During Creation
**Issue:** System allows creating invalid proposals without early feedback

**Why This Is a System Problem:**
- No scaffolding or template commands
- No incremental validation as you build
- Must fully create the change before discovering structural issues

### User Errors (My Mistakes)

#### 1. Trying to Define Deltas in Proposal.md
- Incorrectly assumed deltas could be inline in the proposal
- System correctly expects deltas in separate spec files

#### 2. Using Wrong Section Headers
- Used `## Requirements` instead of `## ADDED Requirements`
- Convention is documented in existing changes, but I didn't examine carefully

#### 3. Wrong Scenario Format
- Used bullet lists instead of `#### Scenario:` headers
- Made assumptions instead of checking existing patterns

### Gray Areas

1. **Documentation gaps** - While examples exist, there's no comprehensive "How to Create a Change" guide
2. **Lack of tooling** - No scaffolding commands to create properly structured changes

---

## Documentation Gaps Analysis

### Critical Gaps in openspec/README.md

#### 1. Scenario Format - COMPLETELY MISSING ⚠️
**What README Shows:** No scenario examples at all

**What's Actually Required:**
```markdown
#### Scenario: Descriptive name
- **WHEN** condition
- **THEN** expected outcome
- **AND** additional outcomes
```

**Impact:** This was the biggest struggle. The README mentions requirements but never shows how to write scenarios. Without this, requirements fail validation.

#### 2. Complete Spec File Example - MISSING
**What README Shows:** Only fragments

**What's Actually Needed:** A complete working example showing:
- Full spec file structure
- Proper requirement format
- Scenario formatting
- All required elements

#### 3. Validation Commands - NOT MENTIONED
**Missing from README:**
- `npx openspec change validate <change-name>`
- `npx openspec change show <change-name> --json`
- The `--strict` flag for catching warnings

#### 4. Delta Detection Explanation - INCOMPLETE
**What's Missing:**
- WHERE the system looks for specs (specs/ subdirectory)
- THAT deltas are automatically extracted
- HOW to debug when deltas aren't detected
- WHAT error messages mean

### Misleading Documentation

#### "Store only the changes" - MISLEADING
**Line 145:** `# - Store only the changes (not complete future state)`

**Problem:** This suggests storing diffs or partial content. In reality, you need:
- Complete requirements in their final form
- Full scenario definitions
- The entire requirement text

### Documentation That Was Helpful
1. Delta section headers (`## ADDED Requirements`) - clearly documented
2. Directory structure - excellent visualization
3. When to create proposals - well defined

---

## Key Learnings

### 1. OpenSpec's Delta Detection Algorithm
The system follows this process:
1. Scans `openspec/changes/{change-name}/specs/` directory
2. For each spec file found, parses for delta sections (`ADDED`, `MODIFIED`, `REMOVED`, `RENAMED`)
3. Creates delta objects with operation type, affected spec, and requirements
4. Validates that at least one delta exists for the change to be valid

**Important:** Creating entirely new specs is fully supported! New specs use `## ADDED Requirements` and appear as ADDED operations in the deltas.

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

### 4. Validation Commands Are Essential
```bash
# Basic validation
npx openspec change validate {change-name}

# Strict validation (recommended)
npx openspec change validate {change-name} --strict

# Debug delta detection
npx openspec change show {change-name} --json | jq '.deltas'
```

---

## Recommendations

### High Priority (System Bugs to Fix)

1. **Improve Error Messages**
   - Add actionable guidance to error messages
   - Example: "No deltas found. Check: 1) specs/ directory exists, 2) Files use ## ADDED Requirements headers, 3) Each requirement has #### Scenario: sections"

2. **Add Warnings for Malformed Content**
   - Warn when scenarios exist but aren't properly formatted
   - Show which line/file has the issue

3. **Add Delta Detection Debugging**
   - Command like `openspec change debug-deltas {change-name}`
   - Show which files were scanned, what was found, what was rejected

### Medium Priority (Documentation Improvements)

1. **Add Complete Working Example to README**
   - Full change proposal with all files
   - Properly formatted specs with scenarios
   - Show the validation output

2. **Add Troubleshooting Section**
   - Common errors and their solutions
   - How to debug delta detection
   - Scenario formatting requirements

3. **Add Validation Best Practices**
   - When to use `--strict`
   - How to use JSON output for debugging
   - Common validation patterns

### Low Priority (Developer Experience)

1. **Add Scaffolding Command**
   ```bash
   openspec change scaffold {change-name}
   ```
   - Creates proper directory structure
   - Includes template files with correct formatting
   - Adds example scenarios

2. **Add Interactive Creation Wizard**
   - Guide users through change creation
   - Validate as they go
   - Suggest fixes for common issues

3. **Add Auto-fix Capability**
   - `--fix` flag to correct common formatting issues
   - Convert bullet list scenarios to proper headers
   - Add missing operation prefixes

---

## Conclusion

The OpenSpec system works correctly for its intended design, but the user experience for creating changes needs significant improvement. The core issues stem from:

### System Issues
- **Unhelpful error messages** that don't guide users to solutions
- **Silent parsing failures** that provide no feedback about malformed content
- **Lack of debugging tools** to understand what went wrong

### Documentation Issues
- **Critical formatting requirements missing** (especially scenario format)
- **No complete working examples** showing all required elements
- **Validation commands not documented** despite being essential

### User Issues
- **Incorrect assumptions** about how the system works
- **Not examining existing patterns** carefully enough
- **Trying to shortcut** instead of following established conventions

### The Path Forward

With better error messages, complete documentation, and basic tooling support, most of the errors encountered could be prevented. The system's delta-centric approach is powerful and ensures changes are atomic and trackable, but it needs to be more discoverable and user-friendly.

The most impactful improvements would be:
1. Adding scenario format documentation to the README
2. Improving error messages with actionable guidance
3. Creating a scaffolding command for new changes

These changes would transform OpenSpec from a system that works correctly but is hard to use, into one that actively helps developers succeed.