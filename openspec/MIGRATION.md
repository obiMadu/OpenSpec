# Migration Guide: Integrating Validation into Future Commands

## Overview

This guide explains how to integrate the OpenSpec validation framework into new commands and features.

## Adding Validation to New Commands

### 1. Import Required Components

```typescript
import { Validator } from '../core/validation/validator.js';
import { ValidationReport } from '../core/validation/types.js';
import chalk from 'chalk';
```

### 2. Basic Validation Pattern

```typescript
export class NewCommand {
  async execute(options: CommandOptions): Promise<void> {
    // Create validator instance
    const validator = new Validator(options.strict);
    
    // Validate the spec or change
    const report = await validator.validateSpec(filePath);
    // or
    const report = await validator.validateChange(filePath);
    
    // Handle validation results
    if (!report.valid && !options.skipValidation) {
      this.displayValidationErrors(report);
      throw new Error('Validation failed');
    }
    
    // Continue with command logic...
  }
  
  private displayValidationErrors(report: ValidationReport): void {
    console.log(chalk.red('\nValidation errors:'));
    for (const issue of report.issues) {
      if (issue.level === 'ERROR') {
        console.log(chalk.red(`  ✗ ${issue.message}`));
      } else if (issue.level === 'WARNING') {
        console.log(chalk.yellow(`  ⚠ ${issue.message}`));
      } else {
        console.log(chalk.blue(`  ℹ ${issue.message}`));
      }
    }
  }
}
```

### 3. Adding Skip Validation Option

```typescript
// In CLI definition
.option('--no-validate', 'Skip validation (not recommended)')

// In command execution
if (!options.noValidate) {
  // Perform validation
  const report = await validator.validateSpec(filePath);
  
  if (!report.valid) {
    // Handle validation failure
  }
} else {
  // Log warning about skipping validation
  const timestamp = new Date().toISOString();
  console.log(chalk.yellow(`⚠️  WARNING: Skipping validation`));
  console.log(chalk.yellow(`[${timestamp}] Validation skipped for: ${filePath}`));
  
  // Optionally require confirmation
  if (!options.yes) {
    const proceed = await confirm({
      message: 'Continue without validation? (y/N)',
      default: false
    });
    if (!proceed) {
      console.log('Operation cancelled.');
      return;
    }
  }
}
```

### 4. Non-Blocking Validation (Warnings Only)

```typescript
// For commands that should show warnings but continue
const report = await validator.validateSpec(filePath);

if (report.issues.length > 0) {
  const warnings = report.issues.filter(i => i.level === 'WARNING');
  const errors = report.issues.filter(i => i.level === 'ERROR');
  
  if (errors.length > 0) {
    // Block on errors
    this.displayValidationErrors(report);
    throw new Error('Validation failed with errors');
  } else if (warnings.length > 0) {
    // Show warnings but continue
    console.log(chalk.yellow('\n⚠️  Validation warnings:'));
    this.displayValidationErrors(report);
    console.log(chalk.yellow('\nConsider fixing these issues.\n'));
  }
}

// Continue with command...
```

## Extending Validation Rules

### 1. Add New Constants

```typescript
// In src/core/validation/constants.ts
export const NEW_THRESHOLD = 100;
export const VALIDATION_MESSAGES = {
  // ... existing messages
  NEW_RULE_MESSAGE: 'New validation rule message',
};
```

### 2. Update Schema with New Rules

```typescript
// In appropriate schema file
import { NEW_THRESHOLD, VALIDATION_MESSAGES } from '../validation/constants.js';

export const ExtendedSchema = z.object({
  // ... existing fields
  newField: z.string()
    .min(NEW_THRESHOLD, VALIDATION_MESSAGES.NEW_RULE_MESSAGE)
});
```

### 3. Add Custom Validation Logic

```typescript
// In src/core/validation/validator.ts
private applyCustomRules(data: CustomType): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Add custom validation logic
  if (data.someField.length > NEW_THRESHOLD) {
    issues.push({
      level: 'WARNING',
      path: 'someField',
      message: VALIDATION_MESSAGES.NEW_RULE_MESSAGE,
    });
  }
  
  return issues;
}
```

## Testing Validation

### 1. Unit Test Schema Validation

```typescript
import { describe, it, expect } from 'vitest';
import { NewSchema } from '../../src/core/schemas/new.schema.js';

describe('NewSchema', () => {
  it('should validate valid data', () => {
    const data = { /* valid data */ };
    const result = NewSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid data', () => {
    const data = { /* invalid data */ };
    const result = NewSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Expected error message');
    }
  });
});
```

### 2. Integration Test Command Validation

```typescript
it('should validate before executing', async () => {
  const command = new NewCommand();
  
  // Create invalid data
  await fs.writeFile(testPath, invalidContent);
  
  // Execute should fail due to validation
  await expect(command.execute({ filePath: testPath }))
    .rejects.toThrow('Validation failed');
});

it('should skip validation with flag', async () => {
  const command = new NewCommand();
  const mockConfirm = vi.fn().mockResolvedValue(true);
  
  // Execute with skip validation
  await command.execute({ 
    filePath: testPath, 
    noValidate: true,
    yes: true 
  });
  
  // Should succeed despite invalid data
  expect(mockConfirm).not.toHaveBeenCalled();
});
```

## Integration Checklist

When adding validation to a new command:

- [ ] Import Validator and related types
- [ ] Add validation before critical operations
- [ ] Handle validation errors appropriately
- [ ] Add --no-validate flag if skipping should be allowed
- [ ] Require confirmation for validation skips
- [ ] Log validation skips with timestamp
- [ ] Add tests for validation scenarios
- [ ] Update command documentation
- [ ] Document any new validation rules

## Common Patterns

### Pre-Operation Validation
Use for destructive operations (archive, delete, modify):
```typescript
if (!options.noValidate) {
  const report = await validator.validateSpec(filePath);
  if (!report.valid) {
    throw new Error('Cannot proceed with invalid spec');
  }
}
```

### Informational Validation
Use for read-only operations (diff, list, show):
```typescript
const report = await validator.validateSpec(filePath);
if (report.issues.length > 0) {
  console.log(chalk.yellow('Note: This spec has validation issues'));
}
// Continue regardless
```

### Progressive Enhancement
Start with warnings, gradually enforce:
```typescript
const report = await validator.validateSpec(filePath);
const hasErrors = report.issues.some(i => i.level === 'ERROR');

if (hasErrors && process.env.STRICT_VALIDATION) {
  throw new Error('Strict validation enabled, errors found');
} else if (hasErrors) {
  console.log(chalk.yellow('Validation errors found (will be enforced in future)'));
}
```