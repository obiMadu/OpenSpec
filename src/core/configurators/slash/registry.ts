import { SlashCommandConfigurator } from './base.js';
import { ClaudeSlashCommandConfigurator } from './claude.js';
import { CursorSlashCommandConfigurator } from './cursor.js';

export class SlashCommandRegistry {
  private static configurators: Map<string, SlashCommandConfigurator> = new Map();

  static {
    const claude = new ClaudeSlashCommandConfigurator();
    const cursor = new CursorSlashCommandConfigurator();

    this.configurators.set(claude.toolId, claude);
    this.configurators.set(cursor.toolId, cursor);
  }

  static register(configurator: SlashCommandConfigurator): void {
    this.configurators.set(configurator.toolId, configurator);
  }

  static get(toolId: string): SlashCommandConfigurator | undefined {
    return this.configurators.get(toolId);
  }

  static getAll(): SlashCommandConfigurator[] {
    return Array.from(this.configurators.values());
  }
}
