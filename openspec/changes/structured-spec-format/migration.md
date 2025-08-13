# Migration Guide for Structured Format

This guide helps with migrating existing specifications to the new structured format.

## Migration Approach

### For Existing Specifications

When updating an existing specification:
1. Update the sections you're modifying to use the new format
2. Add `### Requirement:` prefixes to requirement headers
3. Add `#### Scenario:` prefixes to scenario descriptions
4. Bold the behavior keywords (WHEN, THEN, AND)
5. Leave unmodified sections as-is for gradual migration

### For New Specifications

All new capability specifications should use the structured format from the beginning.

## Examples

### Before (Old Format)
```markdown
## User Authentication

Users must authenticate with email and password.

When credentials are valid, issue JWT token.
When credentials are invalid, return generic error.
```

### After (Structured Format)
```markdown
### Requirement: User Authentication

Users SHALL authenticate with email and password.

#### Scenario: Valid credentials

- **WHEN** credentials are valid
- **THEN** issue JWT token

#### Scenario: Invalid credentials

- **WHEN** credentials are invalid
- **THEN** return generic error
```

## Notes

- Migration is gradual - no need to update entire specs at once
- Focus on sections being actively modified
- The format is for behavioral specs - use appropriate formats for APIs, schemas, etc.