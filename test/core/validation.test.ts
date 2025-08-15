import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { Validator } from '../../src/core/validation/validator.js';
import { 
  ScenarioSchema, 
  RequirementSchema, 
  SpecSchema, 
  ChangeSchema,
  DeltaSchema 
} from '../../src/core/schemas/index.js';

describe('Validation Schemas', () => {
  describe('ScenarioSchema', () => {
    it('should validate a valid scenario', () => {
      const scenario = {
        rawText: 'Given a user is logged in\nWhen they click logout\nThen they are redirected to login page',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(true);
    });

    it('should reject scenario with empty text', () => {
      const scenario = {
        rawText: '',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Scenario text cannot be empty');
      }
    });
  });

  describe('RequirementSchema', () => {
    it('should validate a valid requirement', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [
          {
            rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(true);
    });

    it('should reject requirement without SHALL or MUST', () => {
      const requirement = {
        text: 'The system provides user authentication',
        scenarios: [
          {
            rawText: 'Given a user\nWhen they login\nThen authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Requirement must contain SHALL or MUST keyword');
      }
    });

    it('should reject requirement without scenarios', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Requirement must have at least one scenario');
      }
    });
  });

  describe('SpecSchema', () => {
    it('should validate a valid spec', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [
          {
            text: 'The system SHALL provide user authentication',
            scenarios: [
              {
                rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
              },
            ],
          },
        ],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('should reject spec without requirements', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Spec must have at least one requirement');
      }
    });
  });

  describe('ChangeSchema', () => {
    it('should validate a valid change', () => {
      const change = {
        name: 'add-user-auth',
        why: 'We need user authentication to secure the application and protect user data',
        whatChanges: 'Add authentication module with login and logout capabilities',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add new user authentication spec',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(true);
    });

    it('should reject change with short why section', () => {
      const change = {
        name: 'add-user-auth',
        why: 'Need auth',
        whatChanges: 'Add authentication',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add auth',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Why section must be at least 50 characters');
      }
    });

    it('should warn about too many deltas', () => {
      const deltas = Array.from({ length: 11 }, (_, i) => ({
        spec: `spec-${i}`,
        operation: 'ADDED' as const,
        description: `Add spec ${i}`,
      }));
      
      const change = {
        name: 'massive-change',
        why: 'This is a massive change that affects many parts of the system',
        whatChanges: 'Update everything',
        deltas,
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Consider splitting changes with more than 10 deltas');
      }
    });
  });
});

describe('Validator', () => {
  const testDir = path.join(process.cwd(), 'test-validation-tmp');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('validateSpec', () => {
    it('should validate a valid spec file', async () => {
      const specContent = `# User Authentication Spec

## Overview
This specification defines the requirements for user authentication in the system.

## Requirements

### The system SHALL provide secure user authentication
The system SHALL provide secure user authentication mechanisms.

#### Scenario: Successful login
Given a user with valid credentials
When they submit the login form
Then they are authenticated and redirected to the dashboard

### The system SHALL handle invalid login attempts
The system SHALL gracefully handle incorrect credentials.

#### Scenario: Invalid credentials
Given a user with invalid credentials
When they submit the login form
Then they see an error message`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should detect missing overview section', async () => {
      const specContent = `# User Authentication Spec

## Requirements

### The system SHALL provide secure user authentication

#### Scenario: Login
Given a user
When they login
Then authenticated`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('Overview'))).toBe(true);
    });
  });

  describe('validateChange', () => {
    it('should validate a valid change file', async () => {
      const changeContent = `# Add User Authentication

## Why
We need to implement user authentication to secure the application and protect user data from unauthorized access.

## What Changes
- **user-auth:** Add new user authentication specification
- **api-endpoints:** Modify to include auth endpoints`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should detect missing why section', async () => {
      const changeContent = `# Add User Authentication

## What Changes
- **user-auth:** Add new user authentication specification`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('Why'))).toBe(true);
    });
  });

  describe('strict mode', () => {
    it('should fail on warnings in strict mode', async () => {
      const specContent = `# Test Spec

## Overview
Brief overview

## Requirements

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator(true); // strict mode
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(false); // Should fail due to brief overview warning
    });

    it('should pass warnings in non-strict mode', async () => {
      const specContent = `# Test Spec

## Overview
Brief overview

## Requirements

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator(false); // non-strict mode
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(true); // Should pass despite warnings
      expect(report.summary.warnings).toBeGreaterThan(0);
    });
  });
});