import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { diffLines } from 'diff';
import { select } from '@inquirer/prompts';

// Constants
const ARCHIVE_DIR = 'archive';
const MARKDOWN_EXT = '.md';
const OPENSPEC_DIR = 'openspec';
const CHANGES_DIR = 'changes';
const SPECS_DIR = 'specs';

export class DiffCommand {
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

    await this.showDiffs(changeSpecsDir);
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

    return answer;
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
    
    try {
      changeContent = await fs.readFile(changePath, 'utf-8');
    } catch {
      changeContent = '';
    }
    
    try {
      currentContent = await fs.readFile(currentPath, 'utf-8');
    } catch {
      currentContent = '';
    }

    if (changeContent === currentContent) {
      return;
    }

    console.log(chalk.bold(`\n--- specs/${displayPath}`));
    console.log(chalk.bold(`+++ changes/[change]/specs/${displayPath}`));
    
    const diff = diffLines(currentContent, changeContent);
    
    diff.forEach(part => {
      // Split by newline but keep empty lines
      const lines = part.value.split('\n');
      
      // Remove the last empty string if the part ends with a newline
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      lines.forEach(line => {
        if (part.added) {
          console.log(chalk.green(`+${line}`));
        } else if (part.removed) {
          console.log(chalk.red(`-${line}`));
        } else {
          console.log(` ${line}`);
        }
      });
    });
  }
}