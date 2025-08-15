import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { diffStringsUnified } from 'jest-diff';
import { select } from '@inquirer/prompts';
import { Validator } from './validation/validator.js';

// Constants
const ARCHIVE_DIR = 'archive';
const MARKDOWN_EXT = '.md';
const OPENSPEC_DIR = 'openspec';
const CHANGES_DIR = 'changes';
const SPECS_DIR = 'specs';

export class DiffCommand {
  private filesChanged: number = 0;
  private linesAdded: number = 0;
  private linesRemoved: number = 0;

  async execute(changeName?: string): Promise<void> {
    const changesDir = path.join(process.cwd(), OPENSPEC_DIR, CHANGES_DIR);
    
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error('No OpenSpec changes directory found');
    }

    if (!changeName) {
      changeName = await this.selectChange(changesDir);
      if (!changeName) return;
    }

    const changeDir = path.join(changesDir, changeName);
    
    try {
      await fs.access(changeDir);
    } catch {
      throw new Error(`Change '${changeName}' not found`);
    }

    const changeSpecsDir = path.join(changeDir, SPECS_DIR);
    
    try {
      await fs.access(changeSpecsDir);
    } catch {
      console.log(`No spec changes found for '${changeName}'`);
      return;
    }

    // Validate specs and show warnings (non-blocking)
    const validator = new Validator();
    let hasWarnings = false;
    
    try {
      const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specFile);
            const report = await validator.validateSpec(specFile);
            
            if (report.issues.length > 0) {
              const warnings = report.issues.filter(i => i.level === 'WARNING');
              const errors = report.issues.filter(i => i.level === 'ERROR');
              
              if (errors.length > 0 || warnings.length > 0) {
                if (!hasWarnings) {
                  console.log(chalk.yellow('\n⚠️  Validation warnings found:'));
                  hasWarnings = true;
                }
                
                console.log(chalk.yellow(`\n  ${entry.name}/spec.md:`));
                for (const issue of errors) {
                  console.log(chalk.red(`    ✗ ${issue.message}`));
                }
                for (const issue of warnings) {
                  console.log(chalk.yellow(`    ⚠ ${issue.message}`));
                }
              }
            }
          } catch {
            // Spec file doesn't exist, skip validation
          }
        }
      }
      
      if (hasWarnings) {
        console.log(chalk.yellow('\nConsider fixing these issues before archiving.\n'));
      }
    } catch {
      // No specs directory, skip validation
    }

    // Reset counters
    this.filesChanged = 0;
    this.linesAdded = 0;
    this.linesRemoved = 0;

    await this.showDiffs(changeSpecsDir);

    // Show summary
    if (this.filesChanged > 0) {
      console.log(chalk.bold(`\n📊 Summary: ${this.filesChanged} file(s) changed, ${chalk.green(`+${this.linesAdded}`)} ${chalk.red(`-${this.linesRemoved}`)}`));
    }
  }

  private async selectChange(changesDir: string): Promise<string | undefined> {
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changes = entries
      .filter(entry => entry.isDirectory() && entry.name !== ARCHIVE_DIR)
      .map(entry => entry.name);

    if (changes.length === 0) {
      console.log('No changes found');
      return undefined;
    }

    console.log('Available changes:');
    const choices = changes.map((name) => ({
      name: name,
      value: name
    }));

    const answer = await select({
      message: 'Select a change',
      choices
    });

    return answer as string;
  }

  private async showDiffs(changeSpecsDir: string): Promise<void> {
    const currentSpecsDir = path.join(process.cwd(), OPENSPEC_DIR, SPECS_DIR);
    await this.walkAndDiff(changeSpecsDir, currentSpecsDir, '');
  }

  private async walkAndDiff(changeDir: string, currentDir: string, relativePath: string): Promise<void> {
    const entries = await fs.readdir(path.join(changeDir, relativePath), { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.walkAndDiff(changeDir, currentDir, entryPath);
      } else if (entry.isFile() && entry.name.endsWith(MARKDOWN_EXT)) {
        await this.diffFile(
          path.join(changeDir, entryPath),
          path.join(currentDir, entryPath),
          entryPath
        );
      }
    }
  }

  private async diffFile(changePath: string, currentPath: string, displayPath: string): Promise<void> {
    let changeContent = '';
    let currentContent = '';
    let isNewFile = false;
    let isDeleted = false;
    
    try {
      changeContent = await fs.readFile(changePath, 'utf-8');
    } catch {
      changeContent = '';
    }
    
    try {
      currentContent = await fs.readFile(currentPath, 'utf-8');
    } catch {
      currentContent = '';
      isNewFile = true;
    }

    if (changeContent === currentContent) {
      return;
    }

    if (changeContent === '' && currentContent !== '') {
      isDeleted = true;
    }

    // Enhanced header with file status
    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan(`📄 ${displayPath}`));
    
    if (isNewFile) {
      console.log(chalk.green(`   Status: NEW FILE`));
    } else if (isDeleted) {
      console.log(chalk.red(`   Status: DELETED`));
    } else {
      console.log(chalk.yellow(`   Status: MODIFIED`));
    }
    
    // Use jest-diff for the actual diff with custom options
    const diffOptions = {
      aAnnotation: 'Current',
      bAnnotation: 'Proposed',
      aColor: chalk.red,
      bColor: chalk.green,
      commonColor: chalk.gray,
      contextLines: 3,
      expand: false,
      includeChangeCounts: true,
    };

    const diff = diffStringsUnified(currentContent, changeContent, diffOptions);
    
    // Count lines for statistics (approximate)
    const addedLines = (diff.match(/^\+[^+]/gm) || []).length;
    const removedLines = (diff.match(/^-[^-]/gm) || []).length;
    
    console.log(chalk.gray(`   Lines: ${chalk.green(`+${addedLines}`)} ${chalk.red(`-${removedLines}`)}`));
    console.log(chalk.bold.cyan(`${'─'.repeat(60)}\n`));
    
    // Display the diff
    console.log(diff);
    
    // Update counters
    this.filesChanged++;
    this.linesAdded += addedLines;
    this.linesRemoved += removedLines;
  }
}