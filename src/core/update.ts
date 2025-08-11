import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { TemplateManager } from './templates/index.js';
import { OPENSPEC_DIR_NAME, OPENSPEC_MARKERS } from './config.js';
import { readmeTemplate } from './templates/readme-template.js';

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

    // 3. Update CLAUDE.md (marker-based)
    const claudePath = path.join(resolvedProjectPath, 'CLAUDE.md');
    const claudeContent = TemplateManager.getClaudeTemplate();
    await FileSystemUtils.updateFileWithMarkers(
      claudePath,
      claudeContent,
      OPENSPEC_MARKERS.start,
      OPENSPEC_MARKERS.end
    );

    // 4. Success message (ASCII-safe)
    console.log('Updated OpenSpec instructions');
  }
}
