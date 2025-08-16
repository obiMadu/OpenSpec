import { promises as fs } from 'fs';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { JsonConverter } from '../core/converters/json-converter.js';
import { Validator } from '../core/validation/validator.js';
import { ChangeParser } from '../core/parsers/change-parser.js';
import { Change } from '../core/schemas/index.js';

// Constants for better maintainability
const ARCHIVE_DIR = 'archive';
const TASK_PATTERN = /^[-*]\s+\[[\sx]\]/i;
const COMPLETED_TASK_PATTERN = /^[-*]\s+\[x\]/i;

export class ChangeCommand {
  private converter: JsonConverter;

  constructor() {
    this.converter = new JsonConverter();
  }

  async show(changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');
    
    if (!changeName) {
      const changes = await this.getActiveChanges(changesPath);
      if (changes.length === 0) {
        throw new Error('No active changes found');
      }
      if (changes.length === 1) {
        changeName = changes[0];
      } else {
        throw new Error(`Multiple active changes found. Please specify one: ${changes.join(', ')}`);
      }
    }
    
    const proposalPath = path.join(changesPath, changeName, 'proposal.md');
    
    try {
      await fs.access(proposalPath);
    } catch {
      throw new Error(`Change "${changeName}" not found at ${proposalPath}`);
    }
    
    if (options?.json) {
      const jsonOutput = await this.converter.convertChangeToJson(proposalPath);
      
      if (options.requirementsOnly) {
        const change: Change = JSON.parse(jsonOutput);
        // Show only deltas (spec changes) for requirements-only mode
        const deltas = change.deltas || [];
        if (deltas.length === 0) {
          console.log(JSON.stringify({ message: "No requirement changes found" }, null, 2));
        } else {
          console.log(JSON.stringify(deltas, null, 2));
        }
      } else {
        console.log(jsonOutput);
      }
    } else {
      const content = await fs.readFile(proposalPath, 'utf-8');
      
      if (options?.requirementsOnly) {
        const changeDir = path.join(changesPath, changeName);
        const parser = new ChangeParser(content, changeDir);
        const change = await parser.parseChangeWithDeltas(changeName);
        
        console.log(chalk.bold(`\nRequirement changes from: ${changeName}\n`));
        
        if (change.deltas.length === 0) {
          console.log(chalk.yellow('No requirement changes found'));
        } else {
          change.deltas.forEach(delta => {
            console.log(chalk.cyan(`• ${delta.spec} (${delta.operation}): ${delta.description}`));
          });
        }
        console.log();
      } else {
        console.log(content);
      }
    }
  }

  async list(options?: { json?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');
    
    const changes = await this.getActiveChanges(changesPath);
    
    if (options?.json) {
      const changeDetails = await Promise.all(
        changes.map(async (changeName) => {
          const proposalPath = path.join(changesPath, changeName, 'proposal.md');
          const tasksPath = path.join(changesPath, changeName, 'tasks.md');
          
          try {
            const content = await fs.readFile(proposalPath, 'utf-8');
            const changeDir = path.join(changesPath, changeName);
            const parser = new ChangeParser(content, changeDir);
            const change = await parser.parseChangeWithDeltas(changeName);
            
            let taskStatus = { total: 0, completed: 0 };
            try {
              const tasksContent = await fs.readFile(tasksPath, 'utf-8');
              taskStatus = this.countTasks(tasksContent);
            } catch (error) {
              // Tasks file may not exist, which is okay
              if (process.env.DEBUG) {
                console.error(`Failed to read tasks file at ${tasksPath}:`, error);
              }
            }
            
            return {
              name: changeName,
              title: this.extractTitle(content),
              deltas: change.deltas.length,
              taskStatus,
            };
          } catch (error) {
            return {
              name: changeName,
              title: 'Unknown',
              deltas: 0,
              taskStatus: { total: 0, completed: 0 },
            };
          }
        })
      );
      
      console.log(JSON.stringify(changeDetails, null, 2));
    } else {
      if (changes.length === 0) {
        console.log('No active changes found');
        return;
      }
      
      console.log(chalk.bold('\nActive Changes:\n'));
      
      for (const changeName of changes) {
        const proposalPath = path.join(changesPath, changeName, 'proposal.md');
        const tasksPath = path.join(changesPath, changeName, 'tasks.md');
        
        try {
          const content = await fs.readFile(proposalPath, 'utf-8');
          const title = this.extractTitle(content);
          
          let taskStatus = '';
          try {
            const tasksContent = await fs.readFile(tasksPath, 'utf-8');
            const { total, completed } = this.countTasks(tasksContent);
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            taskStatus = ` ${chalk.gray(`[${completed}/${total} tasks - ${percentage}%]`)}`;
          } catch (error) {
            // Tasks file may not exist, which is okay
            if (process.env.DEBUG) {
              console.error(`Failed to read tasks file at ${tasksPath}:`, error);
            }
          }
          
          console.log(`• ${chalk.cyan(changeName)}: ${title}${taskStatus}`);
        } catch (error) {
          console.log(`• ${chalk.cyan(changeName)}: ${chalk.red('Error reading proposal')}`);
        }
      }
      console.log();
    }
  }

  async validate(changeName?: string, options?: { strict?: boolean; json?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');
    
    if (!changeName) {
      const changes = await this.getActiveChanges(changesPath);
      if (changes.length === 0) {
        throw new Error('No active changes found');
      }
      if (changes.length === 1) {
        changeName = changes[0];
      } else {
        throw new Error(`Multiple active changes found. Please specify one: ${changes.join(', ')}`);
      }
    }
    
    const proposalPath = path.join(changesPath, changeName, 'proposal.md');
    
    try {
      await fs.access(proposalPath);
    } catch {
      throw new Error(`Change "${changeName}" not found at ${proposalPath}`);
    }
    
    const validator = new Validator(options?.strict || false);
    const report = await validator.validateChange(proposalPath);
    
    if (options?.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      const spinner = ora();
      
      if (report.valid) {
        spinner.succeed(chalk.green(`Change "${changeName}" is valid`));
      } else {
        spinner.fail(chalk.red(`Change "${changeName}" has validation issues`));
        console.log();
        
        report.issues.forEach(issue => {
          const icon = issue.level === 'ERROR' ? '✗' : '⚠';
          const color = issue.level === 'ERROR' ? chalk.red : chalk.yellow;
          console.log(color(`  ${icon} ${issue.path}: ${issue.message}`));
        });
      }
      
      const warnings = report.issues.filter(issue => issue.level === 'WARNING');
      if (warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ ${warning.path}: ${warning.message}`));
        });
      }
    }
  }

  private async getActiveChanges(changesPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(changesPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== ARCHIVE_DIR)
        .map(entry => entry.name)
        .sort();
    } catch {
      return [];
    }
  }

  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(?:Change:\s+)?(.+)$/m);
    return match ? match[1].trim() : 'Untitled Change';
  }

  private countTasks(content: string): { total: number; completed: number } {
    const lines = content.split('\n');
    let total = 0;
    let completed = 0;
    
    for (const line of lines) {
      if (line.match(TASK_PATTERN)) {
        total++;
        if (line.match(COMPLETED_TASK_PATTERN)) {
          completed++;
        }
      }
    }
    
    return { total, completed };
  }
}