import path from 'path';
import { select } from '@inquirer/prompts';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { TemplateManager, ProjectContext } from './templates/index.js';
import { ToolRegistry } from './configurators/registry.js';
import { OpenSpecConfig, AI_TOOLS, OPENSPEC_DIR_NAME } from './config.js';

export class InitCommand {
  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    const openspecDir = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(projectPath, openspecDir);

    // Validation happens silently in the background
    await this.validate(projectPath, openspecPath);

    // Get configuration (after validation to avoid prompts if validation fails)
    const config = await this.getConfiguration();

    // Step 1: Create directory structure
    const structureSpinner = ora({ text: 'Creating OpenSpec structure...', stream: process.stdout }).start();
    await this.createDirectoryStructure(openspecPath);
    await this.generateFiles(openspecPath, config);
    structureSpinner.succeed('OpenSpec structure created');

    // Step 2: Configure AI tools
    const toolSpinner = ora({ text: 'Configuring AI tools...', stream: process.stdout }).start();
    await this.configureAITools(projectPath, openspecDir, config.aiTools);
    toolSpinner.succeed('AI tools configured');

    // Success message
    this.displaySuccessMessage(openspecDir, config);
  }

  private async validate(projectPath: string, openspecPath: string): Promise<void> {
    // Check if OpenSpec already exists
    if (await FileSystemUtils.directoryExists(openspecPath)) {
      throw new Error(
        `OpenSpec seems to already be initialized at ${openspecPath}.\n` +
        `Use 'openspec update' to update the structure.`
      );
    }

    // Check write permissions
    if (!await FileSystemUtils.ensureWritePermissions(projectPath)) {
      throw new Error(`Insufficient permissions to write to ${projectPath}`);
    }

  }

  private async getConfiguration(): Promise<OpenSpecConfig> {
    const config: OpenSpecConfig = {
      aiTools: []
    };

    // Single-select for better UX
    const selectedTool = await select({
      message: 'Which AI tool do you use?',
      choices: AI_TOOLS.map(tool => ({
        name: tool.available ? tool.name : `${tool.name} (coming soon)`,
        value: tool.value,
        disabled: !tool.available
      }))
    });
    
    config.aiTools = [selectedTool];

    return config;
  }

  private async createDirectoryStructure(openspecPath: string): Promise<void> {
    const directories = [
      openspecPath,
      path.join(openspecPath, 'specs'),
      path.join(openspecPath, 'changes'),
      path.join(openspecPath, 'changes', 'archive')
    ];

    for (const dir of directories) {
      await FileSystemUtils.createDirectory(dir);
    }
  }

  private async generateFiles(openspecPath: string, config: OpenSpecConfig): Promise<void> {
    const context: ProjectContext = {
      // Could be enhanced with prompts for project details
    };

    const templates = TemplateManager.getTemplates(context);
    
    for (const template of templates) {
      const filePath = path.join(openspecPath, template.path);
      const content = typeof template.content === 'function' 
        ? template.content(context) 
        : template.content;
      
      await FileSystemUtils.writeFile(filePath, content);
    }
  }

  private async configureAITools(projectPath: string, openspecDir: string, toolIds: string[]): Promise<void> {
    for (const toolId of toolIds) {
      const configurator = ToolRegistry.get(toolId);
      if (configurator && configurator.isAvailable) {
        await configurator.configure(projectPath, openspecDir);
      }
    }
  }

  private displaySuccessMessage(openspecDir: string, config: OpenSpecConfig): void {
    console.log(); // Empty line for spacing
    ora().succeed('OpenSpec initialized successfully!');
    
    // Get the selected tool name for display
    const selectedToolId = config.aiTools[0];
    const selectedTool = AI_TOOLS.find(t => t.value === selectedToolId);
    const toolName = selectedTool ? selectedTool.name : 'your AI assistant';
    
    console.log(`\nNext steps - Copy these prompts to ${toolName}:\n`);
    console.log('────────────────────────────────────────────────────────────');
    console.log('1. Populate your project context:');
    console.log('   "Please read openspec/project.md and help me fill it out');
    console.log('    with details about my project, tech stack, and conventions"\n');
    console.log('2. Create your first change proposal:');
    console.log('   "I want to add [YOUR FEATURE HERE]. Please create an');
    console.log('    OpenSpec change proposal for this feature"\n');
    console.log('3. Learn the OpenSpec workflow:');
    console.log('   "Please explain the OpenSpec workflow from openspec/README.md');
    console.log('    and how I should work with you on this project"');
    console.log('────────────────────────────────────────────────────────────\n');
  }
}