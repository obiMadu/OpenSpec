# OpenSpec Validation Guide

## Overview

OpenSpec uses Zod for runtime validation of specifications and changes. The validation system ensures that all specs and changes conform to the required structure and quality standards.

## Schema Structure

### Spec Schema
```typescript
{
  name: string,              // Spec identifier
  overview: string,          // Description of the spec
  requirements: [            // Array of requirements
    {
      text: string,          // Requirement text (must contain SHALL/MUST)
      scenarios: [           // Array of test scenarios
        {
          given: string,     // Initial condition
          when: string,      // Action taken
          then: string       // Expected result
        }
      ]
    }
  ],
  metadata?: {               // Optional metadata
    version: string,
    format: 'openspec',
    sourcePath?: string
  }
}
```

### Change Schema
```typescript
{
  name: string,              // Change identifier
  why: string,               // Justification (50-1000 chars)
  whatChanges: string,       // Description of changes
  deltas: [                  // Array of spec changes
    {
      spec: string,          // Affected spec name
      operation: 'ADDED' | 'MODIFIED' | 'REMOVED',
      description: string,   // Delta description
      requirements?: []      // New/modified requirements
    }
  ],
  metadata?: {               // Optional metadata
    version: string,
    format: 'openspec-change',
    sourcePath?: string
  }
}
```

## Validation Rules

### Three-Tier Validation System

#### ERROR Level (Blocking)
- Missing required sections (Overview, Requirements, Why, What Changes)
- Invalid heading hierarchy
- Malformed requirement/scenario structure
- Empty required fields

#### WARNING Level (Should Fix)
- Requirements without scenarios
- Requirements missing SHALL/MUST keywords
- Brief overview sections (<50 characters)
- Brief why sections (<50 characters)
- Missing requirements in ADDED/MODIFIED deltas
- Delta descriptions too brief (<10 characters)

#### INFO Level (Suggestions)
- Very long requirement text (>500 characters)
- Very long why sections (>1000 characters)
- Scenarios without Given/When/Then structure
- Too many deltas in single change (>10)

## Validation Thresholds

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_WHY_SECTION_LENGTH | 50 | Minimum characters for change why section |
| MIN_OVERVIEW_LENGTH | 50 | Minimum characters for spec overview |
| MAX_WHY_SECTION_LENGTH | 1000 | Maximum characters for change why section |
| MAX_REQUIREMENT_TEXT_LENGTH | 500 | Maximum characters per requirement |
| MAX_DELTAS_PER_CHANGE | 10 | Maximum deltas in a single change |

## Using Validation

### Archive Command
```bash
# Validation runs by default
openspec archive my-change

# Skip validation (not recommended, requires confirmation)
openspec archive my-change --no-validate
```

### Diff Command
```bash
# Shows validation warnings (non-blocking)
openspec diff my-change
```

### Programmatic Usage
```typescript
import { Validator } from './src/core/validation/validator.js';

const validator = new Validator();
const report = await validator.validateSpec('path/to/spec.md');

if (!report.valid) {
  console.log('Validation failed:');
  report.issues.forEach(issue => {
    console.log(`[${issue.level}] ${issue.path}: ${issue.message}`);
  });
}
```

### Strict Mode
```typescript
// Fail on both errors and warnings
const validator = new Validator(true);
const report = await validator.validateSpec('path/to/spec.md');
```

## Validation Report Format

```json
{
  "valid": false,
  "issues": [
    {
      "level": "ERROR",
      "path": "requirements[0].scenarios",
      "message": "Requirement must have at least one scenario",
      "line": 15,
      "column": 0
    }
  ],
  "summary": {
    "errors": 1,
    "warnings": 2,
    "info": 1
  }
}
```

## Best Practices

1. **Always validate before archiving** - The archive command validates by default to protect archive integrity
2. **Fix errors immediately** - Errors indicate structural issues that prevent proper parsing
3. **Address warnings before merging** - Warnings indicate quality issues that should be fixed
4. **Consider info messages** - Info messages provide suggestions for improvement
5. **Use strict mode in CI/CD** - Enforce both errors and warnings in automated pipelines