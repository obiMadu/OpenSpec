import { promises as fs } from 'fs';
import path from 'path';
import readline from 'readline';
import { FileSystemUtils } from '../utils/file-system.js';

interface SpecUpdate {
  source: string;
  target: string;
  exists: boolean;
}

export class ArchiveCommand {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async execute(changeName?: string, options: { yes?: boolean } = {}): Promise<void> {
    try {
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

      // Check for incomplete tasks
      const tasksPath = path.join(changeDir, 'tasks.md');
      const incompleteTasks = await this.checkIncompleteTasks(tasksPath);
      
      if (incompleteTasks > 0) {
        if (!options.yes) {
          const proceed = await this.askQuestion(
            `Warning: ${incompleteTasks} incomplete task(s) found. Continue? (y/n): `
          );
          if (proceed.toLowerCase() !== 'y') {
            console.log('Archive cancelled.');
            return;
          }
        } else {
          console.log(`Warning: ${incompleteTasks} incomplete task(s) found. Continuing due to --yes flag.`);
        }
      }

      // Find specs to update
      const specUpdates = await this.findSpecUpdates(changeDir, mainSpecsDir);
      
      if (specUpdates.length > 0) {
        console.log('\nSpecs to update:');
        for (const update of specUpdates) {
          const status = update.exists ? 'update' : 'create';
          const capability = path.basename(path.dirname(update.target));
          console.log(`  ${capability}: ${status}`);
        }

        if (!options.yes) {
          const proceed = await this.askQuestion('\nProceed with spec updates? (y/n): ');
          if (proceed.toLowerCase() !== 'y') {
            console.log('Archive cancelled.');
            return;
          }
        }

        // Update specs
        for (const update of specUpdates) {
          await this.updateSpec(update);
        }
        console.log('Specs updated successfully.');
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
    } finally {
      this.rl.close();
    }
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
    changeDirs.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    const answer = await this.askQuestion('\nSelect change number (or press Enter to cancel): ');
    
    if (!answer) {
      return null;
    }

    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= changeDirs.length) {
      console.log('Invalid selection.');
      return null;
    }

    return changeDirs[index];
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

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  private getArchiveDate(): string {
    // Returns date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  }
}