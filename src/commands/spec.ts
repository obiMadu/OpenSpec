import { program } from 'commander';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { MarkdownParser } from '../core/parsers/markdown-parser.js';
import { Validator } from '../core/validation/validator.js';
import type { Spec } from '../core/schemas/index.js';

const SPECS_DIR = 'openspec/specs';

export function registerSpecCommand(rootProgram: typeof program) {
  const specCommand = rootProgram
    .command('spec')
    .description('Manage and view OpenSpec specifications');

  interface ShowOptions {
    json?: boolean;
    requirements?: boolean;
    scenarios?: boolean; // --no-scenarios sets this to false
    requirement?: string;
  }

  function parseSpecFromFile(specPath: string, specId: string): Spec {
    const content = readFileSync(specPath, 'utf-8');
    const parser = new MarkdownParser(content);
    return parser.parseSpec(specId);
  }

  function validateRequirementIndex(spec: Spec, requirementOpt?: string): number | undefined {
    if (!requirementOpt) return undefined;
    const index = Number.parseInt(requirementOpt, 10);
    if (!Number.isInteger(index) || index < 1 || index > spec.requirements.length) {
      throw new Error(`Requirement ${requirementOpt} not found`);
    }
    return index - 1; // convert to 0-based
  }

  function filterSpec(spec: Spec, options: ShowOptions): Spec {
    const requirementIndex = validateRequirementIndex(spec, options.requirement);
    const includeScenarios = options.scenarios !== false && !options.requirements;

    const filteredRequirements = (requirementIndex !== undefined
      ? [spec.requirements[requirementIndex]]
      : spec.requirements
    ).map(req => ({
      text: req.text,
      scenarios: includeScenarios ? req.scenarios : [],
    }));

    const metadata = spec.metadata ?? { version: '1.0.0', format: 'openspec' as const };

    return {
      name: spec.name,
      overview: spec.overview,
      requirements: filteredRequirements,
      metadata,
    };
  }

  function printSpecText(spec: Spec, options: ShowOptions): void {
    console.log(chalk.bold.blue(`Spec: ${spec.name}`));
    console.log();
    console.log(chalk.bold('Overview:'));
    console.log(spec.overview);
    console.log();

    const requirementIndex = options.requirement
      ? Number.parseInt(options.requirement, 10) - 1
      : undefined;

    if (requirementIndex !== undefined) {
      const req = spec.requirements[0]; // already filtered to single requirement
      console.log(chalk.bold(`Requirement ${requirementIndex + 1}:`));
      console.log(chalk.green(req.text));
      if (req.scenarios.length > 0) {
        console.log();
        console.log(chalk.bold('Scenarios:'));
        req.scenarios.forEach((scenario, sIndex) => {
          console.log(chalk.gray(`  Scenario ${sIndex + 1}:`));
          scenario.rawText.split('\n').forEach(line => console.log(chalk.gray(`    ${line}`)));
        });
      }
      return;
    }

    console.log(chalk.bold('Requirements:'));
    spec.requirements.forEach((req, index) => {
      console.log(chalk.green(`  ${index + 1}. ${req.text}`));
      if (req.scenarios.length > 0) {
        req.scenarios.forEach((scenario, sIndex) => {
          console.log(chalk.gray(`     Scenario ${sIndex + 1}:`));
          scenario.rawText.split('\n').forEach(line => console.log(chalk.gray(`       ${line}`)));
        });
      }
    });
  }

  specCommand
    .command('show <spec-id>')
    .description('Display a specific specification')
    .option('--json', 'Output as JSON')
    .option('--requirements', 'Show only requirements (exclude scenarios)')
    .option('--no-scenarios', 'Exclude scenario content')
    .option('-r, --requirement <id>', 'Show specific requirement by ID (1-based)')
    .action((specId: string, options: ShowOptions) => {
      try {
        const specPath = join(SPECS_DIR, specId, 'spec.md');
        
        if (!existsSync(specPath)) {
          throw new Error(`Spec '${specId}' not found at openspec/specs/${specId}/spec.md`);
        }

        if (options.requirements && options.requirement) {
          throw new Error('Options --requirements and --requirement cannot be used together');
        }

        const parsed = parseSpecFromFile(specPath, specId);
        const filtered = filterSpec(parsed, options);

        if (options.json) {
          console.log(JSON.stringify(filtered, null, 2));
        } else {
          printSpecText(filtered, options);
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exitCode = 1;
      }
    });

  specCommand
    .command('list')
    .description('List all available specifications')
    .option('--json', 'Output as JSON')
    .action((options: { json?: boolean }) => {
      try {
        if (!existsSync(SPECS_DIR)) {
          throw new Error(`Specs directory not found at openspec/specs`);
        }

        const overviewTeaser = (text: string): string =>
          text.length > 100 ? `${text.substring(0, 100)}...` : text;

        const specs = readdirSync(SPECS_DIR, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => {
            const specPath = join(SPECS_DIR, dirent.name, 'spec.md');
            if (existsSync(specPath)) {
              try {
                const spec = parseSpecFromFile(specPath, dirent.name);
                
                return {
                  id: dirent.name,
                  title: spec.name,
                  overview: overviewTeaser(spec.overview),
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
          .filter((spec): spec is { id: string; title: string; overview: string; requirementCount: number } => spec !== null)
          .sort((a, b) => a.id.localeCompare(b.id));

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
        process.exitCode = 1;
      }
    });

  specCommand
    .command('validate <spec-id>')
    .description('Validate a specification structure')
    .option('--strict', 'Enable strict validation mode')
    .option('--json', 'Output validation report as JSON')
    .action(async (specId: string, options: { strict?: boolean; json?: boolean }) => {
      try {
        const specPath = join(SPECS_DIR, specId, 'spec.md');
        
        if (!existsSync(specPath)) {
          throw new Error(`Spec '${specId}' not found at openspec/specs/${specId}/spec.md`);
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
        process.exitCode = report.valid ? 0 : 1;
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exitCode = 1;
      }
    });

  return specCommand;
}