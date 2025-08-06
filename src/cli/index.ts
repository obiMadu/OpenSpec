import { Command } from 'commander';
import ora from 'ora';
import { InitCommand } from '../core/init.js';

const program = new Command();

program
  .name('openspec')
  .description('AI-native system for spec-driven development')
  .version('0.0.1');

program
  .command('init [path]')
  .description('Initialize OpenSpec in your project')
  .action(async (path = '.') => {
    try {
      const initCommand = new InitCommand();
      await initCommand.execute(path);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();