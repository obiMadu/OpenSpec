#!/usr/bin/env node

import { program } from 'commander';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { SpecSchema, RequirementSchema, ScenarioSchema } from '../core/schemas/index.js';
import { MarkdownParser } from '../core/parsers/markdown-parser.js';
import { Validator } from '../core/validation/validator.js';
import { JsonConverter } from '../core/converters/json-converter.js';
import type { Spec } from '../core/schemas/index.js';

const SPECS_DIR = 'openspec/specs';

export function registerSpecCommand(rootProgram: typeof program) {
  const specCommand = rootProgram
    .command('spec')
    .description('Manage and view OpenSpec specifications');

  specCommand
    .command('show <spec-id>')
    .description('Display a specific specification')
    .option('--json', 'Output as JSON')
    .option('--requirements', 'Show only requirements (exclude scenarios)')
    .option('--no-scenarios', 'Exclude scenario content')
    .option('-r, --requirement <id>', 'Show specific requirement by ID')
    .action(async (specId: string, options: any) => {
      try {
        const specPath = join(SPECS_DIR, specId, 'spec.md');
        
        if (!existsSync(specPath)) {
          console.error(chalk.red(`Error: Spec '${specId}' not found at ${specPath}`));
          process.exit(1);
        }

        if (options.json) {
          const converter = new JsonConverter();
          const jsonOutput = converter.convertSpecToJson(specPath);
          
          if (options.requirements || !options.scenarios) {
            const spec = JSON.parse(jsonOutput);
            
            if (options.requirements || !options.scenarios) {
              spec.requirements = spec.requirements.map((req: any) => ({
                ...req,
                scenarios: []
              }));
            }
            
            if (options.requirement) {
              const reqIndex = parseInt(options.requirement) - 1;
              if (reqIndex >= 0 && reqIndex < spec.requirements.length) {
                spec.requirements = [spec.requirements[reqIndex]];
              } else {
                console.error(chalk.red(`Error: Requirement ${options.requirement} not found`));
                process.exit(1);
              }
            }
            
            console.log(JSON.stringify(spec, null, 2));
          } else {
            console.log(jsonOutput);
          }
        } else {
          const content = readFileSync(specPath, 'utf-8');
          const parser = new MarkdownParser(content);
          const spec = parser.parseSpec(specId);
          
          console.log(chalk.bold.blue(`Spec: ${spec.name}`));
          console.log();
          console.log(chalk.bold('Overview:'));
          console.log(spec.overview);
          console.log();
          
          if (!options.requirements && !options.requirement) {
            console.log(chalk.bold('Requirements:'));
            spec.requirements.forEach((req, index) => {
              console.log(chalk.green(`  ${index + 1}. ${req.text}`));
              
              if (options.scenarios !== false && req.scenarios.length > 0) {
                req.scenarios.forEach((scenario, sIndex) => {
                  console.log(chalk.gray(`     Scenario ${sIndex + 1}:`));
                  const lines = scenario.rawText.split('\n');
                  lines.forEach(line => {
                    console.log(chalk.gray(`       ${line}`));
                  });
                });
              }
            });
          } else if (options.requirements) {
            console.log(chalk.bold('Requirements:'));
            spec.requirements.forEach((req, index) => {
              console.log(chalk.green(`  ${index + 1}. ${req.text}`));
            });
          } else if (options.requirement) {
            const reqIndex = parseInt(options.requirement) - 1;
            if (reqIndex >= 0 && reqIndex < spec.requirements.length) {
              const req = spec.requirements[reqIndex];
              console.log(chalk.bold(`Requirement ${options.requirement}:`));
              console.log(chalk.green(req.text));
              
              if (options.scenarios !== false && req.scenarios.length > 0) {
                console.log();
                console.log(chalk.bold('Scenarios:'));
                req.scenarios.forEach((scenario, sIndex) => {
                  console.log(chalk.gray(`  Scenario ${sIndex + 1}:`));
                  const lines = scenario.rawText.split('\n');
                  lines.forEach(line => {
                    console.log(chalk.gray(`    ${line}`));
                  });
                });
              }
            } else {
              console.error(chalk.red(`Error: Requirement ${options.requirement} not found`));
              process.exit(1);
            }
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });

  specCommand
    .command('list')
    .description('List all available specifications')
    .option('--json', 'Output as JSON')
    .action(async (options: any) => {
      try {
        if (!existsSync(SPECS_DIR)) {
          console.error(chalk.red(`Error: Specs directory not found at ${SPECS_DIR}`));
          process.exit(1);
        }

        const specs = readdirSync(SPECS_DIR, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => {
            const specPath = join(SPECS_DIR, dirent.name, 'spec.md');
            if (existsSync(specPath)) {
              try {
                const content = readFileSync(specPath, 'utf-8');
                const parser = new MarkdownParser(content);
                const spec = parser.parseSpec(dirent.name);
                
                return {
                  id: dirent.name,
                  title: spec.name,
                  overview: spec.overview.substring(0, 100) + (spec.overview.length > 100 ? '...' : ''),
                  requirementCount: spec.requirements.length
                };
              } catch {
                return {
                  id: dirent.name,
                  title: dirent.name,
                  overview: 'Unable to parse spec',
                  requirementCount: 0
                };
              }
            }
            return null;
          })
          .filter(spec => spec !== null);

        if (options.json) {
          console.log(JSON.stringify(specs, null, 2));
        } else {
          console.log(chalk.bold.blue('Available Specifications:'));
          console.log();
          specs.forEach(spec => {
            console.log(chalk.green(`  ${spec.id}`));
            console.log(chalk.gray(`    ${spec.overview}`));
            console.log(chalk.gray(`    Requirements: ${spec.requirementCount}`));
            console.log();
          });
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });

  specCommand
    .command('validate <spec-id>')
    .description('Validate a specification structure')
    .option('--strict', 'Enable strict validation mode')
    .option('--json', 'Output validation report as JSON')
    .action(async (specId: string, options: any) => {
      try {
        const specPath = join(SPECS_DIR, specId, 'spec.md');
        
        if (!existsSync(specPath)) {
          console.error(chalk.red(`Error: Spec '${specId}' not found at ${specPath}`));
          process.exit(1);
        }

        const validator = new Validator(options.strict);
        const report = await validator.validateSpec(specPath);

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          console.log(chalk.bold.blue(`Validation Report for '${specId}':`));
          console.log();
          
          if (report.valid) {
            console.log(chalk.green('✓ Specification is valid'));
          } else {
            console.log(chalk.red('✗ Specification has issues'));
          }
          
          console.log();
          console.log(chalk.bold('Summary:'));
          console.log(`  Errors: ${report.summary.errors}`);
          console.log(`  Warnings: ${report.summary.warnings}`);
          console.log(`  Info: ${report.summary.info}`);
          
          if (report.issues.length > 0) {
            console.log();
            console.log(chalk.bold('Issues:'));
            report.issues.forEach(issue => {
              const icon = issue.level === 'ERROR' ? '✗' : 
                          issue.level === 'WARNING' ? '⚠' : 'ℹ';
              const color = issue.level === 'ERROR' ? chalk.red :
                           issue.level === 'WARNING' ? chalk.yellow : chalk.blue;
              console.log(color(`  ${icon} [${issue.level}] ${issue.path}: ${issue.message}`));
            });
          }
        }

        process.exit(report.valid ? 0 : 1);
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });

  return specCommand;
}