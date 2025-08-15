import { promises as fs } from 'fs';
import path from 'path';

interface ChangeInfo {
  name: string;
  completedTasks: number;
  totalTasks: number;
}

export class ListCommand {
  async execute(targetPath: string = '.'): Promise<void> {
    // Show deprecation warning
    console.log('\x1b[33m%s\x1b[0m', 'Warning: The "openspec list" command is deprecated. Please use "openspec change list" instead.\n');
    
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
      const tasksPath = path.join(changesDir, changeDir, 'tasks.md');
      let completedTasks = 0;
      let incompleteTasks = 0;
      
      try {
        const content = await fs.readFile(tasksPath, 'utf-8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.includes('- [x]')) {
            completedTasks++;
          } else if (line.includes('- [ ]')) {
            incompleteTasks++;
          }
        }
      } catch {
        // No tasks.md file
        changes.push({
          name: changeDir,
          completedTasks: 0,
          totalTasks: 0
        });
        continue;
      }
      
      changes.push({
        name: changeDir,
        completedTasks,
        totalTasks: completedTasks + incompleteTasks
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
      
      let status: string;
      if (change.totalTasks === 0) {
        status = 'No tasks';
      } else if (change.completedTasks === change.totalTasks) {
        status = '✓ Complete';
      } else {
        status = `${change.completedTasks}/${change.totalTasks} tasks`;
      }
      
      console.log(`${padding}${paddedName}     ${status}`);
    }
  }
}