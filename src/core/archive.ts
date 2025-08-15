import { promises as fs } from 'fs';
import path from 'path';
import { select, confirm } from '@inquirer/prompts';
import { FileSystemUtils } from '../utils/file-system.js';
import { Validator } from './validation/validator.js';
import chalk from 'chalk';

interface SpecUpdate {
  source: string;
  target: string;
  exists: boolean;
}

export class ArchiveCommand {
  async execute(changeName?: string, options: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean } = {}): Promise<void> {
    const targetPath = '.';
    const changesDir = path.join(targetPath, 'openspec', 'changes');
    const archiveDir = path.join(changesDir, 'archive');
    const mainSpecsDir = path.join(targetPath, 'openspec', 'specs');

    // Check if changes directory exists
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error("No OpenSpec changes directory found. Run 'openspec init' first.");
    }

    // Get change name interactively if not provided
    if (!changeName) {
      const selectedChange = await this.selectChange(changesDir);
      if (!selectedChange) {
        console.log('No change selected. Aborting.');
        return;
      }
      changeName = selectedChange;
    }

    const changeDir = path.join(changesDir, changeName);

    // Verify change exists
    try {
      const stat = await fs.stat(changeDir);
      if (!stat.isDirectory()) {
        throw new Error(`Change '${changeName}' not found.`);
      }
    } catch {
      throw new Error(`Change '${changeName}' not found.`);
    }

    // Validate specs before archiving
    if (!options.noValidate) {
      const validator = new Validator();
      const changeSpecsDir = path.join(changeDir, 'specs');
      let hasValidationErrors = false;

      try {
        const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
            
            try {
              await fs.access(specFile);
              const report = await validator.validateSpec(specFile);
              
              if (!report.valid) {
                hasValidationErrors = true;
                console.log(chalk.red(`\nValidation errors in ${entry.name}/spec.md:`));
                for (const issue of report.issues) {
                  if (issue.level === 'ERROR') {
                    console.log(chalk.red(`  ✗ ${issue.message}`));
                  } else if (issue.level === 'WARNING') {
                    console.log(chalk.yellow(`  ⚠ ${issue.message}`));
                  }
                }
              }
            } catch {
              // Spec file doesn't exist, skip validation
            }
          }
        }
      } catch {
        // No specs directory, skip validation
      }

      if (hasValidationErrors) {
        console.log(chalk.red('\nValidation failed. Please fix the errors before archiving.'));
        console.log(chalk.yellow('To skip validation (not recommended), use --no-validate flag.'));
        return;
      }
    } else {
      // Log warning when validation is skipped
      const timestamp = new Date().toISOString();
      console.log(chalk.yellow(`\n⚠️  WARNING: Skipping validation may archive invalid specs.`));
      
      if (!options.yes) {
        const proceed = await confirm({
          message: 'Continue without validation? (y/N)',
          default: false
        });
        if (!proceed) {
          console.log('Archive cancelled.');
          return;
        }
      }
      
      console.log(chalk.yellow(`[${timestamp}] Validation skipped for change: ${changeName}`));
      console.log(chalk.yellow(`Affected files: ${changeDir}`));
    }

    // Check for incomplete tasks
    const tasksPath = path.join(changeDir, 'tasks.md');
    const incompleteTasks = await this.checkIncompleteTasks(tasksPath);
    
    if (incompleteTasks > 0) {
      if (!options.yes) {
        const proceed = await confirm({
          message: `Warning: ${incompleteTasks} incomplete task(s) found. Continue?`,
          default: false
        });
        if (!proceed) {
          console.log('Archive cancelled.');
          return;
        }
      } else {
        console.log(`Warning: ${incompleteTasks} incomplete task(s) found. Continuing due to --yes flag.`);
      }
    }

    // Handle spec updates unless skipSpecs flag is set
    if (options.skipSpecs) {
      console.log('Skipping spec updates (--skip-specs flag provided).');
    } else {
      // Find specs to update
      const specUpdates = await this.findSpecUpdates(changeDir, mainSpecsDir);
      
      if (specUpdates.length > 0) {
        console.log('\nSpecs to update:');
        for (const update of specUpdates) {
          const status = update.exists ? 'update' : 'create';
          const capability = path.basename(path.dirname(update.target));
          console.log(`  ${capability}: ${status}`);
        }

        let shouldUpdateSpecs = true;
        if (!options.yes) {
          shouldUpdateSpecs = await confirm({
            message: 'Proceed with spec updates?',
            default: true
          });
          if (!shouldUpdateSpecs) {
            console.log('Skipping spec updates. Proceeding with archive.');
          }
        }

        if (shouldUpdateSpecs) {
          // Update specs
          for (const update of specUpdates) {
            await this.updateSpec(update);
          }
          console.log('Specs updated successfully.');
        }
      }
    }

    // Create archive directory with date prefix
    const archiveName = `${this.getArchiveDate()}-${changeName}`;
    const archivePath = path.join(archiveDir, archiveName);

    // Check if archive already exists
    try {
      await fs.access(archivePath);
      throw new Error(`Archive '${archiveName}' already exists.`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create archive directory if needed
    await fs.mkdir(archiveDir, { recursive: true });

    // Move change to archive
    await fs.rename(changeDir, archivePath);
    
    console.log(`Change '${changeName}' archived as '${archiveName}'.`);
  }

  private async selectChange(changesDir: string): Promise<string | null> {
    // Get all directories in changes (excluding archive)
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changeDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name)
      .sort();

    if (changeDirs.length === 0) {
      console.log('No active changes found.');
      return null;
    }

    console.log('Available changes:');
    const choices = changeDirs.map(name => ({
      name: name,
      value: name
    }));

    try {
      const answer = await select({
        message: 'Select a change to archive',
        choices
      });
      return answer;
    } catch (error) {
      // User cancelled (Ctrl+C)
      return null;
    }
  }

  private async checkIncompleteTasks(tasksPath: string): Promise<number> {
    try {
      const content = await fs.readFile(tasksPath, 'utf-8');
      const lines = content.split('\n');
      let incompleteTasks = 0;
      
      for (const line of lines) {
        if (line.includes('- [ ]')) {
          incompleteTasks++;
        }
      }
      
      return incompleteTasks;
    } catch {
      // No tasks.md file or error reading it
      return 0;
    }
  }

  private async findSpecUpdates(changeDir: string, mainSpecsDir: string): Promise<SpecUpdate[]> {
    const updates: SpecUpdate[] = [];
    const changeSpecsDir = path.join(changeDir, 'specs');

    try {
      const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
          const targetFile = path.join(mainSpecsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specFile);
            
            // Check if target exists
            let exists = false;
            try {
              await fs.access(targetFile);
              exists = true;
            } catch {
              exists = false;
            }

            updates.push({
              source: specFile,
              target: targetFile,
              exists
            });
          } catch {
            // Source spec doesn't exist, skip
          }
        }
      }
    } catch {
      // No specs directory in change
    }

    return updates;
  }

  private async updateSpec(update: SpecUpdate): Promise<void> {
    // Create target directory if needed
    const targetDir = path.dirname(update.target);
    await fs.mkdir(targetDir, { recursive: true });

    // Copy spec file
    const content = await fs.readFile(update.source, 'utf-8');
    await fs.writeFile(update.target, content);
  }

  private getArchiveDate(): string {
    // Returns date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  }
}