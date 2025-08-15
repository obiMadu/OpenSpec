import { z, ZodError } from 'zod';
import { readFileSync } from 'fs';
import { SpecSchema, ChangeSchema, Spec, Change } from '../schemas/index.js';
import { MarkdownParser } from '../parsers/markdown-parser.js';
import { ValidationReport, ValidationIssue, ValidationLevel } from './types.js';

export class Validator {
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  async validateSpec(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const parser = new MarkdownParser(content);
      const specName = this.extractNameFromPath(filePath);
      
      const spec = parser.parseSpec(specName);
      
      const result = SpecSchema.safeParse(spec);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applySpecRules(spec, content));
      
    } catch (error) {
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    return this.createReport(issues);
  }

  async validateChange(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const parser = new MarkdownParser(content);
      const changeName = this.extractNameFromPath(filePath);
      
      const change = parser.parseChange(changeName);
      
      const result = ChangeSchema.safeParse(change);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applyChangeRules(change, content));
      
    } catch (error) {
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    return this.createReport(issues);
  }

  private convertZodErrors(error: ZodError): ValidationIssue[] {
    return error.issues.map(err => ({
      level: 'ERROR' as ValidationLevel,
      path: err.path.join('.'),
      message: err.message,
    }));
  }

  private applySpecRules(spec: Spec, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (spec.overview.length < 50) {
      issues.push({
        level: 'WARNING',
        path: 'overview',
        message: 'Overview section is too brief (less than 50 characters)',
      });
    }
    
    spec.requirements.forEach((req, index) => {
      if (req.text.length > 500) {
        issues.push({
          level: 'INFO',
          path: `requirements[${index}]`,
          message: 'Requirement text is very long (>500 characters). Consider breaking it down.',
        });
      }
      
      if (req.scenarios.length === 0) {
        issues.push({
          level: 'WARNING',
          path: `requirements[${index}].scenarios`,
          message: 'Requirement has no scenarios',
        });
      }
      
      req.scenarios.forEach((scenario, sIndex) => {
        if (!scenario.given.startsWith('Given') && 
            !scenario.when.startsWith('When') && 
            !scenario.then.startsWith('Then')) {
          issues.push({
            level: 'INFO',
            path: `requirements[${index}].scenarios[${sIndex}]`,
            message: 'Scenario does not follow Given/When/Then structure',
          });
        }
      });
    });
    
    return issues;
  }

  private applyChangeRules(change: Change, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    change.deltas.forEach((delta, index) => {
      if (!delta.description || delta.description.length < 10) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].description`,
          message: 'Delta description is too brief',
        });
      }
      
      if ((delta.operation === 'ADDED' || delta.operation === 'MODIFIED') && 
          (!delta.requirements || delta.requirements.length === 0)) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].requirements`,
          message: `${delta.operation} delta should include requirements`,
        });
      }
    });
    
    return issues;
  }

  private extractNameFromPath(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace('.md', '');
  }

  private createReport(issues: ValidationIssue[]): ValidationReport {
    const errors = issues.filter(i => i.level === 'ERROR').length;
    const warnings = issues.filter(i => i.level === 'WARNING').length;
    const info = issues.filter(i => i.level === 'INFO').length;
    
    const valid = this.strictMode 
      ? errors === 0 && warnings === 0
      : errors === 0;
    
    return {
      valid,
      issues,
      summary: {
        errors,
        warnings,
        info,
      },
    };
  }

  isValid(report: ValidationReport): boolean {
    return report.valid;
  }
}