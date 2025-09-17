import path from 'path';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { TemplateManager, ProjectContext } from './templates/index.js';
import { ToolRegistry } from './configurators/registry.js';
import { SlashCommandRegistry } from './configurators/slash/registry.js';
import { OpenSpecConfig, AI_TOOLS, OPENSPEC_DIR_NAME, AIToolOption } from './config.js';

export class InitCommand {
  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    const openspecDir = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(projectPath, openspecDir);

    // Validation happens silently in the background
    const extendMode = await this.validate(projectPath, openspecPath);
    const existingToolStates = await this.getExistingToolStates(projectPath);

    // Get configuration (after validation to avoid prompts if validation fails)
    const config = await this.getConfiguration(existingToolStates, extendMode);

    if (config.aiTools.length === 0) {
      if (extendMode) {
        throw new Error(
          `OpenSpec seems to already be initialized at ${openspecPath}.\n` +
          `Use 'openspec update' to update the structure.`
        );
      }

      throw new Error('You must select at least one AI tool to configure.');
    }

    const availableTools = AI_TOOLS.filter(tool => tool.available);
    const selectedIds = new Set(config.aiTools);
    const selectedTools = availableTools.filter(tool => selectedIds.has(tool.value));
    const created = selectedTools.filter(tool => !existingToolStates[tool.value]);
    const refreshed = selectedTools.filter(tool => existingToolStates[tool.value]);
    const skippedExisting = availableTools.filter(tool => !selectedIds.has(tool.value) && existingToolStates[tool.value]);
    const skipped = availableTools.filter(tool => !selectedIds.has(tool.value) && !existingToolStates[tool.value]);

    // Step 1: Create directory structure
    if (!extendMode) {
      const structureSpinner = ora({ text: 'Creating OpenSpec structure...', stream: process.stdout }).start();
      await this.createDirectoryStructure(openspecPath);
      await this.generateFiles(openspecPath, config);
      structureSpinner.succeed('OpenSpec structure created');
    } else {
      ora({ stream: process.stdout }).info('OpenSpec already initialized. Skipping base scaffolding.');
    }

    // Step 2: Configure AI tools
    const toolSpinner = ora({ text: 'Configuring AI tools...', stream: process.stdout }).start();
    await this.configureAITools(projectPath, openspecDir, config.aiTools);
    toolSpinner.succeed('AI tools configured');

    // Success message
    this.displaySuccessMessage(selectedTools, created, refreshed, skippedExisting, skipped, extendMode);
  }

  private async validate(projectPath: string, _openspecPath: string): Promise<boolean> {
    const extendMode = await FileSystemUtils.directoryExists(_openspecPath);

    // Check write permissions
    if (!await FileSystemUtils.ensureWritePermissions(projectPath)) {
      throw new Error(`Insufficient permissions to write to ${projectPath}`);
    }
    return extendMode;
  }

  private async getConfiguration(existingTools: Record<string, boolean>, extendMode: boolean): Promise<OpenSpecConfig> {
    const selectedTools = await this.promptForAITools(existingTools, extendMode);
    return { aiTools: selectedTools };
  }

  private async promptForAITools(existingTools: Record<string, boolean>, extendMode: boolean): Promise<string[]> {
    const selected = new Set<string>();
    const availableIds = new Set(AI_TOOLS.filter(tool => tool.available).map(tool => tool.value));
    const baseMessage = extendMode
      ? 'Which AI tools would you like to add or refresh?'
      : 'Which AI tools do you use?';

    while (true) {
      const doneLabel = selected.size > 0
        ? chalk.cyan(`Done (${selected.size} selected)`)
        : chalk.cyan('Done');

      const choices = AI_TOOLS.map((tool) => {
        const isSelected = selected.has(tool.value);
        const indicator = isSelected ? chalk.green('[x]') : '[ ]';
        const configuredLabel = existingTools[tool.value] ? chalk.gray(' (already configured)') : '';
        const label = `${indicator} ${tool.name}${configuredLabel}`;
        return {
          name: isSelected ? chalk.bold(label) : label,
          value: tool.value,
          disabled: tool.available ? false : 'coming soon'
        };
      });

      choices.push({ name: doneLabel, value: '__done__', disabled: false });

      const message = `${baseMessage}\n${chalk.dim('Press Enter to toggle or choose "Done" when finished.')}`;
      const answer = await select<string>({
        message,
        choices,
        loop: false
      });

      if (answer === '__done__') {
        break;
      }

      if (!availableIds.has(answer)) {
        continue;
      }

      if (selected.has(answer)) {
        selected.delete(answer);
      } else {
        selected.add(answer);
      }
    }

    return AI_TOOLS
      .filter(tool => tool.available && selected.has(tool.value))
      .map(tool => tool.value);
  }

  private async getExistingToolStates(projectPath: string): Promise<Record<string, boolean>> {
    const states: Record<string, boolean> = {};
    for (const tool of AI_TOOLS) {
      states[tool.value] = await this.isToolConfigured(projectPath, tool.value);
    }
    return states;
  }

  private async isToolConfigured(projectPath: string, toolId: string): Promise<boolean> {
    const configFile = ToolRegistry.get(toolId)?.configFileName;
    if (configFile && await FileSystemUtils.fileExists(path.join(projectPath, configFile))) return true;

    const slashConfigurator = SlashCommandRegistry.get(toolId);
    if (!slashConfigurator) return false;
    for (const target of slashConfigurator.getTargets()) {
      if (await FileSystemUtils.fileExists(path.join(projectPath, target.path))) return true;
    }
    return false;
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

      const slashConfigurator = SlashCommandRegistry.get(toolId);
      if (slashConfigurator && slashConfigurator.isAvailable) {
        await slashConfigurator.generateAll(projectPath, openspecDir);
      }
    }
  }

  private displaySuccessMessage(
    selectedTools: AIToolOption[],
    created: AIToolOption[],
    refreshed: AIToolOption[],
    skippedExisting: AIToolOption[],
    skipped: AIToolOption[],
    extendMode: boolean
  ): void {
    console.log(); // Empty line for spacing
    ora().succeed(extendMode ? 'OpenSpec tool configuration updated!' : 'OpenSpec initialized successfully!');

    console.log('\nTool summary:');
    const summaryLines = [
      created.length ? `- Created: ${this.formatToolNames(created)}` : null,
      refreshed.length ? `- Refreshed: ${this.formatToolNames(refreshed)}` : null,
      skippedExisting.length ? `- Skipped (already configured): ${this.formatToolNames(skippedExisting)}` : null,
      skipped.length ? `- Skipped: ${this.formatToolNames(skipped)}` : null
    ].filter((line): line is string => Boolean(line));
    for (const line of summaryLines) {
      console.log(line);
    }

    console.log('\nUse `openspec update` to refresh shared OpenSpec instructions in the future.');

    // Get the selected tool name(s) for display
    const toolName = this.formatToolNames(selectedTools);

    console.log(`\nNext steps - Copy these prompts to ${toolName}:\n`);
    console.log('────────────────────────────────────────────────────────────');
    console.log('1. Populate your project context:');
    console.log('   "Please read openspec/project.md and help me fill it out');
    console.log('    with details about my project, tech stack, and conventions"\n');
    console.log('2. Create your first change proposal:');
    console.log('   "I want to add [YOUR FEATURE HERE]. Please create an');
    console.log('    OpenSpec change proposal for this feature"\n');
    console.log('3. Learn the OpenSpec workflow:');
    console.log('   "Please explain the OpenSpec workflow from openspec/AGENTS.md');
    console.log('    and how I should work with you on this project"');
    console.log('────────────────────────────────────────────────────────────\n');
  }

  private formatToolNames(tools: AIToolOption[]): string {
    const names = tools
      .map((tool) => tool.successLabel ?? tool.name)
      .filter((name): name is string => Boolean(name));

    if (names.length === 0) return 'your AI assistant';
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')}${names.length ? ', and ' : ''}${last}`;
  }
}
