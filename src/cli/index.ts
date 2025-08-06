import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { InitCommand } from '../core/init.js';

const program = new Command();

program
  .name('openspec')
  .description('AI-native system for spec-driven development')
  .version('0.0.1');

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

program.parse();