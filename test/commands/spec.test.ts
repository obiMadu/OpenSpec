import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('spec command', () => {
  const projectRoot = process.cwd();
  const testDir = path.join(projectRoot, 'test-spec-command-tmp');
  const specsDir = path.join(testDir, 'openspec', 'specs');
  const openspecBin = path.join(projectRoot, 'bin', 'openspec.js');
  
  beforeEach(async () => {
    await fs.mkdir(specsDir, { recursive: true });
    
    // Create test spec files
    const testSpec = `## Purpose
This is a test specification for the authentication system.

## Requirements

### Requirement: User Authentication
The system SHALL provide secure user authentication

#### Scenario: Successful login
- **GIVEN** a user with valid credentials
- **WHEN** they submit the login form  
- **THEN** they are authenticated

### Requirement: Password Reset
The system SHALL allow users to reset their password

#### Scenario: Reset via email
- **GIVEN** a user with a registered email
- **WHEN** they request a password reset
- **THEN** they receive a reset link`;

    await fs.mkdir(path.join(specsDir, 'auth'), { recursive: true });
    await fs.writeFile(path.join(specsDir, 'auth', 'spec.md'), testSpec);
    
    const testSpec2 = `## Purpose
This specification defines the payment processing system.

## Requirements

### Requirement: Process Payments
The system SHALL process credit card payments securely`;

    await fs.mkdir(path.join(specsDir, 'payment'), { recursive: true });
    await fs.writeFile(path.join(specsDir, 'payment', 'spec.md'), testSpec2);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('spec show', () => {
    it('should display spec in text format', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('Spec: auth');
        expect(output).toContain('Purpose:');
        expect(output).toContain('test specification for the authentication system');
        expect(output).toContain('Requirements:');
        expect(output).toContain('The system SHALL provide secure user authentication');
        expect(output).toContain('The system SHALL allow users to reset their password');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should output spec as JSON with --json flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth --json`, {
          encoding: 'utf-8'
        });
        
        const json = JSON.parse(output);
        expect(json.name).toBe('auth');
        expect(json.overview).toContain('test specification');
        expect(json.requirements).toHaveLength(2);
        expect(json.metadata.format).toBe('openspec');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should filter to show only requirements with --requirements flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth --requirements`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('The system SHALL provide secure user authentication');
        expect(output).toContain('The system SHALL allow users to reset their password');
        expect(output).not.toContain('Scenario');
        expect(output).not.toContain('GIVEN');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should exclude scenarios with --no-scenarios flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth --no-scenarios`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('The system SHALL provide secure user authentication');
        expect(output).toContain('The system SHALL allow users to reset their password');
        expect(output).not.toContain('Scenario');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should show specific requirement with -r flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth -r 1`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('Requirement 1:');
        expect(output).toContain('The system SHALL provide secure user authentication');
        expect(output).toContain('Scenario');
        expect(output).not.toContain('Password Reset');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return JSON with filtered requirements', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec show auth --json --no-scenarios`, {
          encoding: 'utf-8'
        });
        
        const json = JSON.parse(output);
        expect(json.requirements).toHaveLength(2);
        expect(json.requirements[0].scenarios).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('spec list', () => {
    it('should list all available specs', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec list`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('Available Specifications:');
        expect(output).toContain('auth');
        expect(output).toContain('payment');
        expect(output).toContain('Requirements: 2');
        expect(output).toContain('Requirements: 1');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should output spec list as JSON with --json flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec list --json`, {
          encoding: 'utf-8'
        });
        
        const json = JSON.parse(output);
        expect(json).toHaveLength(2);
        expect(json.find((s: any) => s.id === 'auth')).toBeDefined();
        expect(json.find((s: any) => s.id === 'payment')).toBeDefined();
        expect(json[0].requirementCount).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('spec validate', () => {
    it('should validate a valid spec', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec validate auth`, {
          encoding: 'utf-8'
        });
        
        expect(output).toContain('Validation Report');
        expect(output).toContain('auth');
        expect(output).toContain('Specification is valid');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should output validation report as JSON with --json flag', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec validate auth --json`, {
          encoding: 'utf-8'
        });
        
        const json = JSON.parse(output);
        expect(json.valid).toBeDefined();
        expect(json.issues).toBeDefined();
        expect(json.summary).toBeDefined();
        expect(json.summary.errors).toBeDefined();
        expect(json.summary.warnings).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should validate with strict mode', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const output = execSync(`node ${openspecBin} spec validate auth --strict --json`, {
          encoding: 'utf-8'
        });
        
        const json = JSON.parse(output);
        expect(json.valid).toBeDefined();
        // In strict mode, warnings also affect validity
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect invalid spec structure', async () => {
      const invalidSpec = `## Purpose

## Requirements
This section has no actual requirements`;

      await fs.mkdir(path.join(specsDir, 'invalid'), { recursive: true });
      await fs.writeFile(path.join(specsDir, 'invalid', 'spec.md'), invalidSpec);

      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        
        // This should exit with non-zero code
        let exitCode = 0;
        try {
          execSync(`node ${openspecBin} spec validate invalid`, {
            encoding: 'utf-8'
          });
        } catch (error: any) {
          exitCode = error.status;
        }
        
        expect(exitCode).not.toBe(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('error handling', () => {
    it('should handle non-existent spec gracefully', () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        
        let error: any;
        try {
          execSync(`node ${openspecBin} spec show nonexistent`, {
            encoding: 'utf-8'
          });
        } catch (e) {
          error = e;
        }
        
        expect(error).toBeDefined();
        expect(error.status).not.toBe(0);
        expect(error.stderr.toString()).toContain('not found');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle missing specs directory', async () => {
      await fs.rm(specsDir, { recursive: true, force: true });
      
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        
        let error: any;
        try {
          execSync(`node ${openspecBin} spec list`, {
            encoding: 'utf-8'
          });
        } catch (e) {
          error = e;
        }
        
        expect(error).toBeDefined();
        expect(error.status).not.toBe(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});