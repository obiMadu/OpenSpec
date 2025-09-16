import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UpdateCommand } from '../../src/core/update.js';
import { FileSystemUtils } from '../../src/utils/file-system.js';
import { ToolRegistry } from '../../src/core/configurators/registry.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

describe('UpdateCommand', () => {
  let testDir: string;
  let updateCommand: UpdateCommand;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `openspec-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    // Create openspec directory
    const openspecDir = path.join(testDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });
    
    updateCommand = new UpdateCommand();
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should update only existing CLAUDE.md file', async () => {
    // Create CLAUDE.md file with initial content
    const claudePath = path.join(testDir, 'CLAUDE.md');
    const initialContent = `# Project Instructions

Some existing content here.

<!-- OPENSPEC:START -->
Old OpenSpec content
<!-- OPENSPEC:END -->

More content after.`;
    await fs.writeFile(claudePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');
    
    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLAUDE.md was updated
    const updatedContent = await fs.readFile(claudePath, 'utf-8');
    expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
    expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
    expect(updatedContent).toContain('This project uses OpenSpec');
    expect(updatedContent).toContain('Some existing content here');
    expect(updatedContent).toContain('More content after');
    
    // Check console output
    expect(consoleSpy).toHaveBeenCalledWith(
      'Updated OpenSpec instructions (README.md)\nUpdated AI tool files: CLAUDE.md'
    );
    consoleSpy.mockRestore();
  });

  it('should not create CLAUDE.md if it does not exist', async () => {
    // Ensure CLAUDE.md does not exist
    const claudePath = path.join(testDir, 'CLAUDE.md');
    
    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLAUDE.md was not created
    const fileExists = await FileSystemUtils.fileExists(claudePath);
    expect(fileExists).toBe(false);
  });

  it('should handle no AI tool files present', async () => {
    // Execute update command with no AI tool files
    const consoleSpy = vi.spyOn(console, 'log');
    await updateCommand.execute(testDir);

    // Should only update OpenSpec instructions
    expect(consoleSpy).toHaveBeenCalledWith('Updated OpenSpec instructions (README.md)');
    consoleSpy.mockRestore();
  });

  it('should update multiple AI tool files if present', async () => {
    // TODO: When additional configurators are added (Cursor, Aider, etc.),
    // enhance this test to create multiple AI tool files and verify
    // that all existing files are updated in a single operation.
    // For now, we test with just CLAUDE.md.
    const claudePath = path.join(testDir, 'CLAUDE.md');
    await fs.writeFile(claudePath, '<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->');

    const consoleSpy = vi.spyOn(console, 'log');
    await updateCommand.execute(testDir);

    // Should report updating with new format
    expect(consoleSpy).toHaveBeenCalledWith(
      'Updated OpenSpec instructions (README.md)\nUpdated AI tool files: CLAUDE.md'
    );
    consoleSpy.mockRestore();
  });

  it('should never create new AI tool files', async () => {
    // Get all configurators
    const configurators = ToolRegistry.getAll();
    
    // Execute update command
    await updateCommand.execute(testDir);

    // Check that no new AI tool files were created
    for (const configurator of configurators) {
      const configPath = path.join(testDir, configurator.configFileName);
      const fileExists = await FileSystemUtils.fileExists(configPath);
      expect(fileExists).toBe(false);
    }
  });

  it('should update README.md in openspec directory', async () => {
    // Execute update command
    await updateCommand.execute(testDir);

    // Check that README.md was created/updated
    const readmePath = path.join(testDir, 'openspec', 'README.md');
    const fileExists = await FileSystemUtils.fileExists(readmePath);
    expect(fileExists).toBe(true);

    const content = await fs.readFile(readmePath, 'utf-8');
    expect(content).toContain('# OpenSpec Instructions');
  });

  it('should throw error if openspec directory does not exist', async () => {
    // Remove openspec directory
    await fs.rm(path.join(testDir, 'openspec'), { recursive: true, force: true });

    // Execute update command and expect error
    await expect(updateCommand.execute(testDir)).rejects.toThrow(
      "No OpenSpec directory found. Run 'openspec init' first."
    );
  });

  it('should handle configurator errors gracefully', async () => {
    // Create CLAUDE.md file but make it read-only to cause an error
    const claudePath = path.join(testDir, 'CLAUDE.md');
    await fs.writeFile(claudePath, '<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->');
    await fs.chmod(claudePath, 0o444); // Read-only

    const consoleSpy = vi.spyOn(console, 'log');
    const errorSpy = vi.spyOn(console, 'error');
    const originalWriteFile = FileSystemUtils.writeFile.bind(FileSystemUtils);
    const writeSpy = vi.spyOn(FileSystemUtils, 'writeFile').mockImplementation(async (filePath, content) => {
      if (filePath.endsWith('CLAUDE.md')) {
        throw new Error('EACCES: permission denied, open');
      }

      return originalWriteFile(filePath, content);
    });

    // Execute update command - should not throw
    await updateCommand.execute(testDir);

    // Should report the failure
    expect(errorSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Updated OpenSpec instructions (README.md)\nFailed to update: CLAUDE.md'
    );

    // Restore permissions for cleanup
    await fs.chmod(claudePath, 0o644);
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    writeSpy.mockRestore();
  });
});