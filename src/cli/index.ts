import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { InitCommand } from '../core/init.js';
import { UpdateCommand } from '../core/update.js';
import { DiffCommand } from '../core/diff.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { registerSpecCommand } from '../commands/spec.js';
import { ChangeCommand } from '../commands/change.js';
import { ValidateCommand } from '../commands/validate.js';

const program = new Command();

program
  .name('openspec')
  .description('AI-native system for spec-driven development')
  .version('0.0.1');

// Global options
program.option('--no-color', 'Disable color output');

// Apply global flags before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.noColor) {
    process.env.NO_COLOR = '1';
  }
});

program
  .command('init [path]')
  .description('Initialize OpenSpec in your project')
  .action(async (targetPath = '.') => {
    try {
      // Validate that the path is a valid directory
      const resolvedPath = path.resolve(targetPath);
      
      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(`Path "${targetPath}" is not a directory`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, but we can create it
          console.log(`Directory "${targetPath}" doesn't exist, it will be created.`);
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`Cannot access path "${targetPath}": ${error.message}`);
        }
      }
      
      const initCommand = new InitCommand();
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('Update OpenSpec instruction files')
  .action(async (targetPath = '.') => {
    try {
      const resolvedPath = path.resolve(targetPath);
      const updateCommand = new UpdateCommand();
      await updateCommand.execute(resolvedPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('diff [change-name]')
  .description('Show differences between proposed spec changes and current specs (includes validation warnings)')
  .action(async (changeName?: string) => {
    try {
      const diffCommand = new DiffCommand();
      await diffCommand.execute(changeName);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all active changes with their task status (DEPRECATED: use "openspec change list" instead)')
  .action(async () => {
    try {
      console.log('\x1b[33m%s\x1b[0m', 'Warning: The "openspec list" command is deprecated. Please use "openspec change list" instead.\n');
      const listCommand = new ListCommand();
      await listCommand.execute();
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Change command with subcommands
const changeCmd = program
  .command('change')
  .description('Manage OpenSpec change proposals');

changeCmd
  .command('show [change-name]')
  .description('Show a change proposal in JSON or markdown format')
  .option('--json', 'Output as JSON')
  .option('--deltas-only', 'Show only deltas (JSON only)')
  .option('--requirements-only', 'Alias for --deltas-only (deprecated)')
  .action(async (changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.show(changeName, options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('list')
  .description('List all active changes')
  .option('--json', 'Output as JSON')
  .option('--long', 'Show id and title with counts')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.list(options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('validate [change-name]')
  .description('Validate a change proposal')
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation report as JSON')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.validate(changeName, options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('archive [change-name]')
  .description('Archive a completed change and update main specs')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--skip-specs', 'Skip spec update operations (useful for infrastructure, tooling, or doc-only changes)')
  .option('--no-validate', 'Skip validation (not recommended, requires confirmation)')
  .action(async (changeName?: string, options?: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean }) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

registerSpecCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('Validate changes and specs')
  .option('--all', 'Validate all changes and specs')
  .option('--changes', 'Validate all changes')
  .option('--specs', 'Validate all specs')
  .option('--type <type>', 'Specify item type when ambiguous: change|spec')
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation results as JSON')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();