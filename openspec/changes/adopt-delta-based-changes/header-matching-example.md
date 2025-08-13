# Header-Based Matching Example

## How Headers Work as Identifiers

### Current Spec (specs/user-auth/spec.md)
```markdown
### Requirement: Basic Authentication
Users SHALL authenticate with email and password

### Requirement: Session Management  
Sessions SHALL expire after 60 minutes

### Requirement: Password Complexity
Passwords SHALL have minimum 8 characters
```

### Change Delta (changes/improve-auth/specs/user-auth/spec.md)
```markdown
## ADDED Requirements

### Requirement: OAuth Support
Users SHALL authenticate via OAuth providers

## MODIFIED Requirements

### Requirement: Session Management
Sessions SHALL expire after 30 minutes  ← (was 60)

### Requirement: Password Complexity
Passwords SHALL have minimum 12 characters  ← (was 8)
AND include special characters

## RENAMED Requirements
- FROM: `### Requirement: Basic Authentication`
- TO: `### Requirement: Email Authentication`

## REMOVED Requirements

### Requirement: Legacy Token Auth
**Reason**: Deprecated in favor of OAuth
```

## Programmatic Application Process

```python
def apply_delta(current_spec, delta_spec):
    # Step 1: Process RENAMED sections first
    for rename in delta_spec.renamed:
        current_spec.rename_requirement(
            from_header=rename.from,  # "### Requirement: Basic Authentication"
            to_header=rename.to        # "### Requirement: Email Authentication"
        )
    
    # Step 2: Process REMOVED sections (by exact header match)
    for requirement in delta_spec.removed:
        header = requirement.header  # "### Requirement: Legacy Token Auth"
        if header not in current_spec:
            raise Error(f"Cannot remove '{header}' - not found in current spec")
        current_spec.remove_requirement(header)
    
    # Step 3: Process MODIFIED sections (by exact header match)
    for requirement in delta_spec.modified:
        header = requirement.header  # "### Requirement: Session Management"
        if header not in current_spec:
            raise Error(f"Cannot modify '{header}' - not found in current spec")
        current_spec.replace_requirement(header, requirement.content)
    
    # Step 4: Process ADDED sections (ensure no duplicates)
    for requirement in delta_spec.added:
        header = requirement.header  # "### Requirement: OAuth Support"
        if header in current_spec:
            raise Error(f"Cannot add '{header}' - already exists")
        current_spec.add_requirement(requirement)
    
    return current_spec
```

## Key Rules for Header Matching

1. **Exact Match Required**: Headers must match character-for-character
   - `### Requirement: Session Management` ✓
   - `### Requirement: Session management` ✗ (case difference)
   - `### Requirement:  Session Management` ✗ (extra space)

2. **Uniqueness Within Spec**: No duplicate headers allowed
   - Validation tools should flag duplicates
   - Each header is a unique ID within its spec

3. **Rename Operations Are Explicit**: 
   - Can't just change header text in MODIFIED section
   - Must use RENAMED section for traceability
   - Allows tracking requirement evolution

4. **Scenario Headers Are Scoped**:
   - `#### Scenario: Login flow` is unique within its requirement
   - Multiple requirements can have same scenario names
   - Full path is `Requirement Header > Scenario Header`

## Benefits of This Approach

1. **Programmatic Reliability**: Tools can reliably match and apply changes
2. **Clear Semantics**: ADDED vs MODIFIED vs RENAMED is unambiguous  
3. **Validation**: Can validate delta before applying (all refs exist)
4. **Merge Conflict Detection**: If two deltas modify same header, conflict!
5. **Traceability**: Renames are explicit, maintaining history

## Edge Cases Handled

### Edge Case 1: Modifying a Renamed Requirement
```markdown
## RENAMED Requirements
- FROM: `### Requirement: Old Name`
- TO: `### Requirement: New Name`

## MODIFIED Requirements
### Requirement: New Name   ← Uses new name
Content of the modified requirement...
```

### Edge Case 2: Detecting Missing Requirements
If delta has `### Requirement: Foo` in MODIFIED but current spec doesn't have it:
- Error: "Cannot modify 'Foo' - not found in current spec"
- Suggests it should be in ADDED section instead

### Edge Case 3: Concurrent Modifications
If two changes both modify `### Requirement: Session Management`:
- Git will show conflict in both delta files
- Clear that both changes affect same requirement
- Easier to resolve than with full future states