import { describe, it, expect, beforeAll } from 'vitest';
import { ChangeCommand } from '../../../src/commands/change.js';

// These tests assume the repository's own openspec/changes directory exists
// and contains at least one active change (e.g., add-change-commands)

describe('ChangeCommand.list', () => {
  let cmd: ChangeCommand;

  beforeAll(() => {
    cmd = new ChangeCommand();
  });

  it('returns JSON with expected shape', async () => {
    // Capture console output
    const logs: string[] = [];
    const origLog = console.log;
    try {
      console.log = (msg?: any, ...args: any[]) => {
        logs.push([msg, ...args].filter(Boolean).join(' '));
      };

      await cmd.list({ json: true });

      const output = logs.join('\n');
      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      if (parsed.length > 0) {
        const item = parsed[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('deltaCount');
        expect(item).toHaveProperty('taskStatus');
        expect(item.taskStatus).toHaveProperty('total');
        expect(item.taskStatus).toHaveProperty('completed');
      }
    } finally {
      console.log = origLog;
    }
  });
});
