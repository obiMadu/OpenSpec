import path from 'path';
import { TaskManagementMode } from './config.js';
import { FileSystemUtils } from '../utils/file-system.js';

const TASK_MANAGEMENT_MARKER_PATTERN = /<!--\s*TASK_MANAGEMENT:\s*(markdown|bd)\s*-->/iu;

export const DEFAULT_TASK_MANAGEMENT_MODE: TaskManagementMode = 'markdown';

export function extractTaskManagementMode(content: string): TaskManagementMode | null {
  const match = TASK_MANAGEMENT_MARKER_PATTERN.exec(content);
  if (!match) {
    return null;
  }
  return match[1].toLowerCase() as TaskManagementMode;
}

export function applyTaskManagementMarker(
  content: string,
  mode: TaskManagementMode
): string {
  if (TASK_MANAGEMENT_MARKER_PATTERN.test(content)) {
    return content.replace(TASK_MANAGEMENT_MARKER_PATTERN, `<!-- TASK_MANAGEMENT:${mode} -->`);
  }

  return `<!-- TASK_MANAGEMENT:${mode} -->\n\n${content}`;
}

export async function detectTaskManagementMode(
  projectRoot: string
): Promise<TaskManagementMode> {
  const projectFile = path.join(projectRoot, 'openspec', 'project.md');
  try {
    const content = await FileSystemUtils.readFile(projectFile);
    return extractTaskManagementMode(content) ?? DEFAULT_TASK_MANAGEMENT_MODE;
  } catch {
    return DEFAULT_TASK_MANAGEMENT_MODE;
  }
}
