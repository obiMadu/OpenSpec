import { promises as fs } from 'fs';
import path from 'path';
import { getTaskProgressForChange, formatTaskStatus } from '../utils/task-progress.js';

interface ChangeInfo {
  name: string;
  completedTasks: number;
  totalTasks: number;
}

export class ListCommand {
  async execute(targetPath: string = '.'): Promise<void> {
    const changesDir = path.join(targetPath, 'openspec', 'changes');
    
    // Check if changes directory exists
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error("No OpenSpec changes directory found. Run 'openspec init' first.");
    }

    // Get all directories in changes (excluding archive)
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changeDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name);

    if (changeDirs.length === 0) {
      console.log('No active changes found.');
      return;
    }

    // Collect information about each change
    const changes: ChangeInfo[] = [];
    
    for (const changeDir of changeDirs) {
      const progress = await getTaskProgressForChange(changesDir, changeDir);
      changes.push({
        name: changeDir,
        completedTasks: progress.completed,
        totalTasks: progress.total
      });
    }

    // Sort alphabetically by name
    changes.sort((a, b) => a.name.localeCompare(b.name));

    // Display results
    console.log('Changes:');
    for (const change of changes) {
      const padding = '  ';
      const nameWidth = Math.max(...changes.map(c => c.name.length));
      const paddedName = change.name.padEnd(nameWidth);
      
      const status = formatTaskStatus({ total: change.totalTasks, completed: change.completedTasks });
      
      console.log(`${padding}${paddedName}     ${status}`);
    }
  }
}