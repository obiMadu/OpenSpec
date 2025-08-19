# Analysis: README.md Documentation Gaps

## Overview
Comparing the issues I encountered with the openspec/README.md documentation reveals significant gaps that directly contributed to my errors. While the README covers high-level concepts well, it lacks critical details needed for successful implementation.

## Critical Documentation Gaps

### 1. Scenario Format - COMPLETELY MISSING ⚠️
**What README Shows:** No scenario examples at all

**What's Actually Required:**
```markdown
#### Scenario: Descriptive name
- **WHEN** condition
- **THEN** expected outcome
- **AND** additional outcomes
```

**Impact:** This was my biggest struggle. The README mentions requirements but never shows how to write scenarios. Without this, requirements fail validation with:
```
✗ [ERROR] deltas.0.requirements.0.scenarios: Requirement must have at least one scenario
```

### 2. Complete Spec File Example - MISSING
**What README Shows:** Fragments only
```markdown
## ADDED Requirements
### Requirement: Password Reset
Users SHALL be able to reset passwords via email...
```

**What's Actually Needed:** A complete working example
```markdown
# Spec Title

## ADDED Requirements

### Requirement: Password Reset

Users SHALL be able to reset passwords via email.

#### Scenario: Valid reset request

- **WHEN** user requests password reset with valid email
- **THEN** send reset token to email
- **AND** token expires in 1 hour
```

### 3. Validation Commands - NOT MENTIONED
**Missing from README:**
- How to validate your change: `npx openspec change validate <change-name>`
- How to debug deltas: `npx openspec change show <change-name> --json`
- The `--strict` flag for catching warnings

**Impact:** I had to discover these through trial and error, making debugging much harder.

### 4. Delta Detection Explanation - INCOMPLETE
**What README Says:**
```bash
# 3. Create delta specs for ALL affected capabilities
# - Store only the changes (not complete future state)
# - Use sections: ## ADDED, ## MODIFIED, ## REMOVED, ## RENAMED
```

**What's Missing:**
- WHERE the system looks for these specs (specs/ subdirectory)
- THAT deltas are automatically extracted from these files
- HOW to debug when deltas aren't detected
- WHAT error messages mean

### 5. Cross-Change Limitations - NOT DOCUMENTED
**Issue Not Mentioned:** You cannot create deltas for specs defined in other active changes

**Real-World Problem:** 
- I tried to modify `cli-change` and `cli-spec` 
- These exist in other active changes, not in `openspec/specs/`
- System couldn't detect these as valid deltas
- No documentation about this limitation

## Documentation That LED TO ERRORS

### 1. "Store only the changes" - MISLEADING
**Line 145:** `# - Store only the changes (not complete future state)`

**Problem:** This suggests you should store diffs or partial content. In reality, you need:
- Complete requirements in their final form
- Full scenario definitions
- The entire requirement text, not just what changed

### 2. "[Complete requirement content in structured format]" - TOO VAGUE
**Line 103:** Shows placeholder text without defining "structured format"

**Missing Details:**
- Requirements need `SHALL/SHOULD/MAY` language
- Must include at least one scenario
- Scenarios require specific header format
- Bullet list structure for WHEN/THEN/AND

## Documentation That WAS HELPFUL

### 1. Delta Section Headers - CORRECT
Lines 101-118 clearly show the section headers:
- `## ADDED Requirements`
- `## MODIFIED Requirements`
- `## REMOVED Requirements`
- `## RENAMED Requirements`

### 2. Directory Structure - CLEAR
Lines 32-50 provide excellent visualization of the file structure

### 3. When to Create Proposals - WELL DEFINED
Lines 74-95 clearly explain when proposals are needed vs. when to skip them

## Recommended Documentation Additions

### 1. Add Complete Working Example
```markdown
## Complete Change Example

Here's a full working change with all required elements:

### File: openspec/changes/add-password-reset/proposal.md
```
## Why
Users cannot recover accounts when they forget passwords.

## What Changes
- Add password reset via email functionality
- Modify authentication to check for reset tokens

## Impact
- Affected specs: user-auth
- Affected code: src/auth/*, src/email/*
```

### File: openspec/changes/add-password-reset/specs/user-auth/spec.md
```
## ADDED Requirements

### Requirement: Password Reset Flow

Users SHALL be able to reset their password via email verification.

#### Scenario: Valid reset request

- **WHEN** user requests password reset with registered email
- **THEN** system sends reset token to email
- **AND** token expires in 1 hour
- **AND** old password remains valid until reset

#### Scenario: Invalid email

- **WHEN** user requests reset with unregistered email  
- **THEN** system shows generic success message
- **AND** no email is sent
```
```

### 2. Add Troubleshooting Section
```markdown
## Troubleshooting

### "Change must have at least one delta"
This means no deltas were detected. Check:
1. Do you have a `specs/` directory in your change?
2. Do spec files use `## ADDED/MODIFIED/REMOVED Requirements` headers?
3. Does each requirement have at least one `#### Scenario:` section?
4. Run `npx openspec change show <name> --json | jq '.deltas'` to debug

### "Requirement must have at least one scenario"
Your requirement is missing scenarios. Add:
```
#### Scenario: Scenario name
- **WHEN** condition
- **THEN** outcome
```
```

### 3. Add Validation Best Practices
```markdown
## Validation Best Practices

Always validate your change before submitting:
```bash
# Basic validation
npx openspec change validate <change-name>

# Strict validation (recommended)
npx openspec change validate <change-name> --strict

# Debug delta detection
npx openspec change show <change-name> --json | jq '.deltas'
```
```

## Conclusion

The README provides good conceptual understanding but lacks the practical details needed for implementation. The most critical gap is the complete absence of scenario formatting documentation, which is required for every requirement. Adding complete examples, troubleshooting guides, and validation commands would prevent most of the errors I encountered.