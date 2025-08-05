import { Command } from 'commander';

const program = new Command();

program
  .name('openspec')
  .description('AI-native system for spec-driven development')
  .version('0.0.1');

program.parse();