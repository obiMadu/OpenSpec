import { z, ZodError } from 'zod';
import { readFileSync } from 'fs';
import { SpecSchema, ChangeSchema, Spec, Change } from '../schemas/index.js';
import { MarkdownParser } from '../parsers/markdown-parser.js';
import { ValidationReport, ValidationIssue, ValidationLevel } from './types.js';
import { 
  MIN_OVERVIEW_LENGTH,
  MAX_REQUIREMENT_TEXT_LENGTH,
  VALIDATION_MESSAGES 
} from './constants.js';

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
    
    if (spec.overview.length < MIN_OVERVIEW_LENGTH) {
      issues.push({
        level: 'WARNING',
        path: 'overview',
        message: VALIDATION_MESSAGES.OVERVIEW_TOO_BRIEF,
      });
    }
    
    spec.requirements.forEach((req, index) => {
      if (req.text.length > MAX_REQUIREMENT_TEXT_LENGTH) {
        issues.push({
          level: 'INFO',
          path: `requirements[${index}]`,
          message: VALIDATION_MESSAGES.REQUIREMENT_TOO_LONG,
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
            message: VALIDATION_MESSAGES.SCENARIO_NO_GIVEN_WHEN_THEN,
          });
        }
      });
    });
    
    return issues;
  }

  private applyChangeRules(change: Change, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    const MIN_DELTA_DESCRIPTION_LENGTH = 10;
    
    change.deltas.forEach((delta, index) => {
      if (!delta.description || delta.description.length < MIN_DELTA_DESCRIPTION_LENGTH) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].description`,
          message: VALIDATION_MESSAGES.DELTA_DESCRIPTION_TOO_BRIEF,
        });
      }
      
      if ((delta.operation === 'ADDED' || delta.operation === 'MODIFIED') && 
          (!delta.requirements || delta.requirements.length === 0)) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].requirements`,
          message: `${delta.operation} ${VALIDATION_MESSAGES.DELTA_MISSING_REQUIREMENTS}`,
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