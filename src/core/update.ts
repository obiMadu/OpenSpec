import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { OPENSPEC_DIR_NAME } from './config.js';
import { readmeTemplate } from './templates/readme-template.js';
import { ToolRegistry } from './configurators/registry.js';
import { SlashCommandRegistry } from './configurators/slash/registry.js';

export class UpdateCommand {
  async execute(projectPath: string): Promise<void> {
    const resolvedProjectPath = path.resolve(projectPath);
    const openspecDirName = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(resolvedProjectPath, openspecDirName);

    // 1. Check openspec directory exists
    if (!await FileSystemUtils.directoryExists(openspecPath)) {
      throw new Error(`No OpenSpec directory found. Run 'openspec init' first.`);
    }

    // 2. Update README.md (full replacement)
    const readmePath = path.join(openspecPath, 'README.md');
    await FileSystemUtils.writeFile(readmePath, readmeTemplate);

    // 3. Update existing AI tool configuration files only
    const configurators = ToolRegistry.getAll();
    const slashConfigurators = SlashCommandRegistry.getAll();
    let updatedFiles: string[] = [];
    let failedFiles: string[] = [];
    let updatedSlashFiles: string[] = [];
    let failedSlashTools: string[] = [];
    
    for (const configurator of configurators) {
      const configFilePath = path.join(resolvedProjectPath, configurator.configFileName);
      
      // Only update if the file already exists
      if (await FileSystemUtils.fileExists(configFilePath)) {
        try {
          await configurator.configure(resolvedProjectPath, openspecPath);
          updatedFiles.push(configurator.configFileName);
        } catch (error) {
          failedFiles.push(configurator.configFileName);
          console.error(`Failed to update ${configurator.configFileName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    for (const slashConfigurator of slashConfigurators) {
      if (!slashConfigurator.isAvailable) {
        continue;
      }

      try {
        const updated = await slashConfigurator.updateExisting(resolvedProjectPath, openspecPath);
        updatedSlashFiles = updatedSlashFiles.concat(updated);
      } catch (error) {
        failedSlashTools.push(slashConfigurator.toolId);
        console.error(
          `Failed to update slash commands for ${slashConfigurator.toolId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // 4. Success message (ASCII-safe)
    const messages: string[] = ['Updated OpenSpec instructions (README.md)'];
    
    if (updatedFiles.length > 0) {
      messages.push(`Updated AI tool files: ${updatedFiles.join(', ')}`);
    }

    if (updatedSlashFiles.length > 0) {
      messages.push(`Updated slash commands: ${updatedSlashFiles.join(', ')}`);
    }
    
    if (failedFiles.length > 0) {
      messages.push(`Failed to update: ${failedFiles.join(', ')}`);
    }

    if (failedSlashTools.length > 0) {
      messages.push(`Failed slash command updates: ${failedSlashTools.join(', ')}`);
    }
    
    console.log(messages.join('\n'));
  }
}
