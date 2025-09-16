import { readmeTemplate } from './readme-template.js';
import { projectTemplate, ProjectContext } from './project-template.js';
import { claudeTemplate } from './claude-template.js';
import { getSlashCommandBody, SlashCommandId } from './slash-command-templates.js';

export interface Template {
  path: string;
  content: string | ((context: ProjectContext) => string);
}

export class TemplateManager {
  static getTemplates(context: ProjectContext = {}): Template[] {
    return [
      {
        path: 'README.md',
        content: readmeTemplate
      },
      {
        path: 'project.md',
        content: projectTemplate(context)
      }
    ];
  }

  static getClaudeTemplate(): string {
    return claudeTemplate;
  }

  static getSlashCommandBody(id: SlashCommandId): string {
    return getSlashCommandBody(id);
  }
}

export { ProjectContext } from './project-template.js';
export type { SlashCommandId } from './slash-command-templates.js';
