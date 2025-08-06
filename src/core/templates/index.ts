import { readmeTemplate } from './readme-template.js';
import { projectTemplate, ProjectContext } from './project-template.js';
import { claudeTemplate } from './claude-template.js';

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
}

export { ProjectContext } from './project-template.js';