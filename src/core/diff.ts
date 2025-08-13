import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { diffLines, diffWords } from 'diff';
import { select } from '@inquirer/prompts';

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
    let isNewFile = false;
    
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

    // Enhanced header with file status
    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan(`📄 ${displayPath}`));
    
    if (isNewFile) {
      console.log(chalk.green(`   Status: NEW FILE`));
    } else if (changeContent === '') {
      console.log(chalk.red(`   Status: DELETED`));
    } else {
      console.log(chalk.yellow(`   Status: MODIFIED`));
    }
    
    const diff = diffLines(currentContent, changeContent);
    
    // Count changes for summary
    let localLinesAdded = 0;
    let localLinesRemoved = 0;
    
    // Build pairs of removed/added lines for word-level diff
    const linePairs: Array<{removed?: string, added?: string, unchanged?: string}> = [];
    
    diff.forEach(part => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      if (part.removed) {
        localLinesRemoved += lines.length;
        lines.forEach(line => {
          linePairs.push({ removed: line });
        });
      } else if (part.added) {
        localLinesAdded += lines.length;
        let addIndex = linePairs.length - localLinesRemoved;
        lines.forEach((line, i) => {
          if (addIndex + i < linePairs.length && linePairs[addIndex + i].removed !== undefined) {
            linePairs[addIndex + i].added = line;
          } else {
            linePairs.push({ added: line });
          }
        });
      } else {
        lines.forEach(line => {
          linePairs.push({ removed: undefined, added: undefined, unchanged: line });
        });
      }
    });
    
    console.log(chalk.gray(`   Lines: ${chalk.green(`+${localLinesAdded}`)} ${chalk.red(`-${localLinesRemoved}`)}`));
    console.log(chalk.bold.cyan(`${'─'.repeat(60)}\n`));
    
    // Display the diff with word-level highlighting for changed lines
    linePairs.forEach(pair => {
      if (pair.unchanged !== undefined) {
        console.log(` ${pair.unchanged}`);
      } else if (pair.removed !== undefined && pair.added !== undefined) {
        // Both removed and added - show word-level diff
        this.displayWordDiff(pair.removed, pair.added);
      } else if (pair.removed !== undefined) {
        console.log(chalk.red(`-${pair.removed}`));
      } else if (pair.added !== undefined) {
        console.log(chalk.green(`+${pair.added}`));
      }
    });
    
    this.filesChanged++;
    this.linesAdded += localLinesAdded;
    this.linesRemoved += localLinesRemoved;
  }

  private displayWordDiff(oldLine: string, newLine: string): void {
    // Show word-level differences within the line
    const wordDiff = diffWords(oldLine, newLine);
    
    // Build the removed line with highlighting
    let removedLine = '-';
    let addedLine = '+';
    
    wordDiff.forEach(part => {
      if (part.removed) {
        removedLine += chalk.bgRed.white(part.value);
      } else if (!part.added) {
        removedLine += chalk.red(part.value);
      }
      
      if (part.added) {
        addedLine += chalk.bgGreen.black(part.value);
      } else if (!part.removed) {
        addedLine += chalk.green(part.value);
      }
    });
    
    console.log(removedLine);
    console.log(addedLine);
  }
}