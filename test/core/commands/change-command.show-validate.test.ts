import { describe, it, expect, beforeAll } from 'vitest';
import { ChangeCommand } from '../../../src/commands/change.js';
import path from 'path';
import { promises as fs } from 'fs';

async function findSingleActiveChange(root: string): Promise<string | undefined> {
  const changesDir = path.join(root, 'openspec', 'changes');
  try {
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const names = entries
      .filter((e) => e.isDirectory() && e.name !== 'archive')
      .map((e) => e.name);
    if (names.length === 1) return names[0];
    return names.includes('add-change-commands') ? 'add-change-commands' : names[0];
  } catch {
    return undefined;
  }
}

describe('ChangeCommand.show/validate', () => {
  let cmd: ChangeCommand;
  let changeName: string | undefined;

  beforeAll(async () => {
    cmd = new ChangeCommand();
    changeName = await findSingleActiveChange(process.cwd());
  });

  it('show --json prints JSON including deltas', async () => {
    if (!changeName) return; // skip if no changes present

    const logs: string[] = [];
    const origLog = console.log;
    try {
      console.log = (msg?: any, ...args: any[]) => {
        logs.push([msg, ...args].filter(Boolean).join(' '));
      };

      await cmd.show(changeName, { json: true });

      const output = logs.join('\n');
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('deltas');
      expect(Array.isArray(parsed.deltas)).toBe(true);
    } finally {
      console.log = origLog;
    }
  });

  it('error when no change specified: prints available IDs', async () => {
    const logsErr: string[] = [];
    const origErr = console.error;
    try {
      console.error = (msg?: any, ...args: any[]) => {
        logsErr.push([msg, ...args].filter(Boolean).join(' '));
      };
      await cmd.show(undefined as unknown as string, { json: false } as any);
      // Should have set exit code and printed hint
      expect(process.exitCode).toBe(1);
      const errOut = logsErr.join('\n');
      expect(errOut).toMatch(/No change specified/);
      expect(errOut).toMatch(/Available IDs/);
    } finally {
      console.error = origErr;
      process.exitCode = 0;
    }
  });

  it('show --json --requirements-only returns minimal object with deltas (deprecated alias)', async () => {
    if (!changeName) return; // skip if no changes present

    const logs: string[] = [];
    const origLog = console.log;
    try {
      console.log = (msg?: any, ...args: any[]) => {
        logs.push([msg, ...args].filter(Boolean).join(' '));
      };

      await cmd.show(changeName, { json: true, requirementsOnly: true });

      const output = logs.join('\n');
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('deltas');
      expect(Array.isArray(parsed.deltas)).toBe(true);
      if (parsed.deltas.length > 0) {
        expect(parsed.deltas[0]).toHaveProperty('spec');
        expect(parsed.deltas[0]).toHaveProperty('operation');
        expect(parsed.deltas[0]).toHaveProperty('description');
      }
    } finally {
      console.log = origLog;
    }
  });

  it('validate --strict --json returns a report with valid boolean', async () => {
    if (!changeName) return; // skip if no changes present

    const logs: string[] = [];
    const origLog = console.log;
    try {
      console.log = (msg?: any, ...args: any[]) => {
        logs.push([msg, ...args].filter(Boolean).join(' '));
      };

      await cmd.validate(changeName, { strict: true, json: true });

      const output = logs.join('\n');
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('valid');
      expect(parsed).toHaveProperty('issues');
      expect(Array.isArray(parsed.issues)).toBe(true);
    } finally {
      console.log = origLog;
    }
  });
});
