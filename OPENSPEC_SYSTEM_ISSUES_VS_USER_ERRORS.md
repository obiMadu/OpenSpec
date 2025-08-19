# OpenSpec: System Issues vs User Errors Analysis

## System Issues / Bugs

### 1. Unhelpful Error Messages
**Issue:** `✗ [ERROR] deltas: Change must have at least one delta`

**Why This Is a System Problem:**
- Error message provides no guidance on HOW to create deltas
- Doesn't mention that deltas come from `specs/` subdirectory
- Doesn't explain the required section headers (ADDED/MODIFIED/REMOVED Requirements)
- A better error would be: "No deltas found. Ensure your change has a specs/ directory with .md files containing sections like '## ADDED Requirements'"

### 2. Silent Scenario Parsing Failures
**Issue:** When scenarios were formatted incorrectly, they were silently ignored

**Why This Is a System Problem:**
- Parser silently returns empty scenarios array instead of warning about malformed scenarios
- No validation error like "Requirement has scenario content but it's not properly formatted. Use #### Scenario: {name}"
- User gets `✗ [ERROR] deltas.0.requirements.0.scenarios: Requirement must have at least one scenario` without knowing their scenarios exist but aren't parsed

**Evidence:**
```json
{
  "text": "The CLI SHALL provide a top-level `show` command with interactive selection.",
  "scenarios": []  // Silent failure - scenarios existed but weren't parsed
}
```

### 3. Cross-Change Spec References Not Supported
**Issue:** Cannot create deltas for specs defined in other active changes

**Why This Is a System Problem:**
- I created specs for `cli-change` and `cli-spec` which exist in other active changes
- System didn't recognize these as valid deltas
- This is a limitation where the system only checks `openspec/specs/` but not specs in other active changes
- Creates ordering dependencies between changes

### 4. No Validation for Proposal Structure During Creation
**Issue:** System allows creating invalid proposals without early feedback

**Why This Is a System Problem:**
- No scaffolding or template commands
- No incremental validation as you build the change
- Have to fully create the change before discovering structural issues

## User Errors (My Mistakes)

### 1. Trying to Define Deltas in Proposal.md
**What I Did Wrong:**
```markdown
### Delta: Add validate-all command
**Type**: Feature addition
```

**Why This Was My Mistake:**
- Documentation and examples show specs in `specs/` directory
- I incorrectly assumed deltas could be inline in the proposal
- System correctly expects deltas in separate spec files

### 2. Using Wrong Section Headers
**What I Did Wrong:**
```markdown
## Requirements  # Wrong
```

**Should Have Been:**
```markdown
## ADDED Requirements  # Correct
```

**Why This Was My Mistake:**
- The convention is documented in existing changes
- I didn't examine working examples carefully enough
- System correctly requires operation-prefixed headers

### 3. Not Understanding Spec File Location
**What I Did Wrong:**
- Created specs for non-existent commands thinking they'd be recognized
- Didn't realize specs need to either exist in `openspec/specs/` or be entirely new

**Why This Was My Mistake:**
- The system's model makes sense: deltas are changes to existing specs or additions of new ones
- I didn't understand the conceptual model initially

### 4. Scenario Format Assumptions
**What I Did Wrong:**
```markdown
**Scenarios:**  # Wrong - treated as regular text
- **WHEN** ...
```

**Should Have Been:**
```markdown
#### Scenario: Descriptive name  # Correct - parsed as scenario
- **WHEN** ...
```

**Why This Was My Mistake:**
- Working examples use the `#### Scenario:` format
- I made assumptions instead of checking existing patterns

## Summary Classification

### Definite System Issues:
1. **Poor error messages** - Don't guide users to solutions
2. **Silent parsing failures** - Scenarios ignored without warning
3. **Limited cross-change support** - Can't reference specs from other active changes

### Definite User Errors:
1. **Wrong delta location** - Tried to put deltas in proposal.md
2. **Wrong section headers** - Didn't use ADDED/MODIFIED/REMOVED prefixes
3. **Wrong scenario format** - Used bullet lists instead of headers

### Gray Areas:
1. **Documentation gaps** - While examples exist, there's no comprehensive "How to Create a Change" guide
2. **Lack of tooling** - No scaffolding commands to create properly structured changes

## Recommendations for System Improvements

### High Priority (Bugs to Fix):
1. **Improve error messages** with actionable guidance
2. **Add warnings for malformed content** instead of silent failures
3. **Support cross-change spec references** or clearly document the limitation

### Medium Priority (Enhancements):
1. **Add `openspec change scaffold`** command to create proper structure
2. **Add `openspec change validate --verbose`** to show parsing details
3. **Create interactive change creation wizard**

### Low Priority (Nice to Have):
1. **Add real-time validation** as files are created
2. **Provide autocomplete/snippets** for common patterns
3. **Add `--fix` flag** to automatically correct common issues

## Conclusion

The core issues stem from:
- **System**: Unhelpful error messages and silent failures that don't guide users
- **User**: Not studying existing patterns carefully before creating new content
- **Both**: Lack of comprehensive documentation and tooling for change creation

The system works correctly for its intended design, but lacks user-friendly features for discovering that design. Most of my errors were from incorrect assumptions that better error messages and tooling could have prevented.