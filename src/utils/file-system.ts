import { promises as fs } from 'fs';
import path from 'path';

export class FileSystemUtils {
  static async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await this.createDirectory(dir);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  static async updateFileWithMarkers(
    filePath: string,
    content: string,
    startMarker: string,
    endMarker: string
  ): Promise<void> {
    let existingContent = '';
    
    if (await this.fileExists(filePath)) {
      existingContent = await this.readFile(filePath);
      
      const startIndex = existingContent.indexOf(startMarker);
      const endIndex = existingContent.indexOf(endMarker);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const before = existingContent.substring(0, startIndex);
        const after = existingContent.substring(endIndex + endMarker.length);
        existingContent = before + startMarker + '\n' + content + '\n' + endMarker + after;
      } else if (startIndex === -1 && endIndex === -1) {
        existingContent = startMarker + '\n' + content + '\n' + endMarker + '\n\n' + existingContent;
      } else {
        throw new Error(`Invalid marker state in ${filePath}. Found start: ${startIndex !== -1}, Found end: ${endIndex !== -1}`);
      }
    } else {
      existingContent = startMarker + '\n' + content + '\n' + endMarker;
    }
    
    await this.writeFile(filePath, existingContent);
  }

  static async ensureWritePermissions(dirPath: string): Promise<boolean> {
    try {
      // If directory doesn't exist, check parent directory permissions
      if (!await this.directoryExists(dirPath)) {
        const parentDir = path.dirname(dirPath);
        if (!await this.directoryExists(parentDir)) {
          await this.createDirectory(parentDir);
        }
        return await this.ensureWritePermissions(parentDir);
      }
      
      const testFile = path.join(dirPath, '.openspec-test-' + Date.now());
      await fs.writeFile(testFile, '');
      await fs.unlink(testFile);
      return true;
    } catch {
      return false;
    }
  }
}