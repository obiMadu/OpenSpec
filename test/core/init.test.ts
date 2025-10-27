import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';

const DONE = '__done__';

type SelectionQueue = string[][];

let selectionQueue: SelectionQueue = [];

const mockPrompt = vi.fn(async () => {
  if (selectionQueue.length === 0) {
    throw new Error('No queued selections provided to init prompt.');
  }
  return selectionQueue.shift() ?? [];
});

const mockTaskPrompt = vi.fn(async () => 'markdown');

function queueSelections(...values: string[]) {
  let current: string[] = [];
  values.forEach((value) => {
    if (value === DONE) {
      selectionQueue.push(current);
      current = [];
    } else {
      current.push(value);
    }
  });

  if (current.length > 0) {
    selectionQueue.push(current);
  }
}

function stripAnsi(value: string): string {
  return value.replace(/\[[0-9;]*m/g, '');
}

describe('InitCommand', () => {
  let testDir: string;
  let initCommand: InitCommand;
  let prevCodexHome: string | undefined;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openspec-init-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    selectionQueue = [];
    mockPrompt.mockReset();
    mockTaskPrompt.mockReset();
    mockTaskPrompt.mockResolvedValue('markdown');
    initCommand = new InitCommand({
      prompt: mockPrompt,
      taskManagerPrompt: mockTaskPrompt,
    });

    // Route Codex global directory into the test sandbox
    prevCodexHome = process.env.CODEX_HOME;
    process.env.CODEX_HOME = path.join(testDir, '.codex');

    // Mock console.log to suppress output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    if (prevCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = prevCodexHome;
  });

  describe('execute', () => {
    it('should create OpenSpec directory structure', async () => {
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      const openspecPath = path.join(testDir, 'openspec');
      expect(await directoryExists(openspecPath)).toBe(true);
      expect(await directoryExists(path.join(openspecPath, 'specs'))).toBe(
        true
      );
      expect(await directoryExists(path.join(openspecPath, 'changes'))).toBe(
        true
      );
      expect(
        await directoryExists(path.join(openspecPath, 'changes', 'archive'))
      ).toBe(true);
    });

    it('should create AGENTS.md and project.md', async () => {
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      const openspecPath = path.join(testDir, 'openspec');
      expect(await fileExists(path.join(openspecPath, 'AGENTS.md'))).toBe(true);
      expect(await fileExists(path.join(openspecPath, 'project.md'))).toBe(
        true
      );

      const agentsContent = await fs.readFile(
        path.join(openspecPath, 'AGENTS.md'),
        'utf-8'
      );
      expect(agentsContent).toContain('OpenSpec Instructions');

      const projectContent = await fs.readFile(
        path.join(openspecPath, 'project.md'),
        'utf-8'
      );
      expect(projectContent).toContain('Project Context');
      expect(projectContent).toContain('<!-- TASK_MANAGEMENT:markdown -->');
    });

    it('should allow selecting bd mode for task management', async () => {
      mockTaskPrompt.mockResolvedValue('bd');
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      const openspecPath = path.join(testDir, 'openspec');
      const projectContent = await fs.readFile(
        path.join(openspecPath, 'project.md'),
        'utf-8'
      );
      expect(projectContent).toContain('<!-- TASK_MANAGEMENT:bd -->');

      const agentsContent = await fs.readFile(
        path.join(openspecPath, 'AGENTS.md'),
        'utf-8'
      );
      expect(agentsContent).toContain('bd issues - Implementation tracking (parent change issue + child task issues)');
      expect(agentsContent).toContain('bd init');

      expect(agentsContent).toContain('bd ready --json');

      const rootAgents = await fs.readFile(
        path.join(testDir, 'AGENTS.md'),
        'utf-8'
      );
      expect(rootAgents).toContain('bd onboard');
      expect(rootAgents).toContain('bd issues for each actionable task');
      expect(mockTaskPrompt).toHaveBeenCalledTimes(1);
    });

    it('should create CLAUDE.md when Claude Code is selected', async () => {
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      const claudePath = path.join(testDir, 'CLAUDE.md');
      expect(await fileExists(claudePath)).toBe(true);

      const content = await fs.readFile(claudePath, 'utf-8');
      expect(content).toContain('<!-- OPENSPEC:START -->');
      expect(content).toContain("@/openspec/AGENTS.md");
      expect(content).toContain('openspec update');
      expect(content).toContain('<!-- OPENSPEC:END -->');
    });

    it('should update existing CLAUDE.md with markers', async () => {
      queueSelections('claude', DONE);

      const claudePath = path.join(testDir, 'CLAUDE.md');
      const existingContent =
        '# My Project Instructions\nCustom instructions here';
      await fs.writeFile(claudePath, existingContent);

      await initCommand.execute(testDir);

      const updatedContent = await fs.readFile(claudePath, 'utf-8');
      expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
      expect(updatedContent).toContain("@/openspec/AGENTS.md");
      expect(updatedContent).toContain('openspec update');
      expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
      expect(updatedContent).toContain('Custom instructions here');
    });

    it('should create CLINE.md when Cline is selected', async () => {
      queueSelections('cline', DONE);

      await initCommand.execute(testDir);

      const clinePath = path.join(testDir, 'CLINE.md');
      expect(await fileExists(clinePath)).toBe(true);

      const content = await fs.readFile(clinePath, 'utf-8');
      expect(content).toContain('<!-- OPENSPEC:START -->');
      expect(content).toContain("@/openspec/AGENTS.md");
      expect(content).toContain('openspec update');
      expect(content).toContain('<!-- OPENSPEC:END -->');
    });

    it('should update existing CLINE.md with markers', async () => {
      queueSelections('cline', DONE);

      const clinePath = path.join(testDir, 'CLINE.md');
      const existingContent =
        '# My Cline Rules\nCustom Cline instructions here';
      await fs.writeFile(clinePath, existingContent);

      await initCommand.execute(testDir);

      const updatedContent = await fs.readFile(clinePath, 'utf-8');
      expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
      expect(updatedContent).toContain("@/openspec/AGENTS.md");
      expect(updatedContent).toContain('openspec update');
      expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
      expect(updatedContent).toContain('Custom Cline instructions here');
    });

    it('should create Windsurf workflows when Windsurf is selected', async () => {
      queueSelections('windsurf', DONE);

      await initCommand.execute(testDir);

      const wsProposal = path.join(
        testDir,
        '.windsurf/workflows/openspec-proposal.md'
      );
      const wsApply = path.join(
        testDir,
        '.windsurf/workflows/openspec-apply.md'
      );
      const wsArchive = path.join(
        testDir,
        '.windsurf/workflows/openspec-archive.md'
      );

      expect(await fileExists(wsProposal)).toBe(true);
      expect(await fileExists(wsApply)).toBe(true);
      expect(await fileExists(wsArchive)).toBe(true);

      const proposalContent = await fs.readFile(wsProposal, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('auto_execution_mode: 3');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(wsApply, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('auto_execution_mode: 3');
      expect(applyContent).toContain('<!-- OPENSPEC:START -->');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(wsArchive, 'utf-8');
      expect(archiveContent).toContain('---');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('auto_execution_mode: 3');
      expect(archiveContent).toContain('<!-- OPENSPEC:START -->');
      expect(archiveContent).toContain('Run `openspec archive <id> --yes`');
    });

    it('should always create AGENTS.md in project root', async () => {
      queueSelections(DONE);

      await initCommand.execute(testDir);

      const rootAgentsPath = path.join(testDir, 'AGENTS.md');
      expect(await fileExists(rootAgentsPath)).toBe(true);

      const content = await fs.readFile(rootAgentsPath, 'utf-8');
      expect(content).toContain('<!-- OPENSPEC:START -->');
      expect(content).toContain("@/openspec/AGENTS.md");
      expect(content).toContain('openspec update');
      expect(content).toContain('<!-- OPENSPEC:END -->');

      const claudeExists = await fileExists(path.join(testDir, 'CLAUDE.md'));
      expect(claudeExists).toBe(false);
    });

    it('should create Claude slash command files with templates', async () => {
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      const claudeProposal = path.join(
        testDir,
        '.claude/commands/openspec/proposal.md'
      );
      const claudeApply = path.join(
        testDir,
        '.claude/commands/openspec/apply.md'
      );
      const claudeArchive = path.join(
        testDir,
        '.claude/commands/openspec/archive.md'
      );

      expect(await fileExists(claudeProposal)).toBe(true);
      expect(await fileExists(claudeApply)).toBe(true);
      expect(await fileExists(claudeArchive)).toBe(true);

      const proposalContent = await fs.readFile(claudeProposal, 'utf-8');
      expect(proposalContent).toContain('name: OpenSpec: Proposal');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(claudeApply, 'utf-8');
      expect(applyContent).toContain('name: OpenSpec: Apply');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(claudeArchive, 'utf-8');
      expect(archiveContent).toContain('name: OpenSpec: Archive');
      expect(archiveContent).toContain('openspec archive <id>');
      expect(archiveContent).toContain(
        '`--skip-specs` only for tooling-only work'
      );
    });

    it('should create Cursor slash command files with templates', async () => {
      queueSelections('cursor', DONE);

      await initCommand.execute(testDir);

      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );
      const cursorApply = path.join(
        testDir,
        '.cursor/commands/openspec-apply.md'
      );
      const cursorArchive = path.join(
        testDir,
        '.cursor/commands/openspec-archive.md'
      );

      expect(await fileExists(cursorProposal)).toBe(true);
      expect(await fileExists(cursorApply)).toBe(true);
      expect(await fileExists(cursorArchive)).toBe(true);

      const proposalContent = await fs.readFile(cursorProposal, 'utf-8');
      expect(proposalContent).toContain('name: /openspec-proposal');
      expect(proposalContent).toContain('<!-- OPENSPEC:END -->');

      const applyContent = await fs.readFile(cursorApply, 'utf-8');
      expect(applyContent).toContain('id: openspec-apply');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(cursorArchive, 'utf-8');
      expect(archiveContent).toContain('name: /openspec-archive');
      expect(archiveContent).toContain('openspec list --specs');
    });

    it('should create OpenCode slash command files with templates', async () => {
      queueSelections('opencode', DONE);

      await initCommand.execute(testDir);

      const openCodeProposal = path.join(
        testDir,
        '.opencode/command/openspec-proposal.md'
      );
      const openCodeApply = path.join(
        testDir,
        '.opencode/command/openspec-apply.md'
      );
      const openCodeArchive = path.join(
        testDir,
        '.opencode/command/openspec-archive.md'
      );

      expect(await fileExists(openCodeProposal)).toBe(true);
      expect(await fileExists(openCodeApply)).toBe(true);
      expect(await fileExists(openCodeArchive)).toBe(true);

      const proposalContent = await fs.readFile(openCodeProposal, 'utf-8');
      expect(proposalContent).toContain('agent: build');
      expect(proposalContent).toContain(
        'description: Scaffold a new OpenSpec change and validate strictly.'
      );
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');

      const applyContent = await fs.readFile(openCodeApply, 'utf-8');
      expect(applyContent).toContain('agent: build');
      expect(applyContent).toContain(
        'description: Implement an approved OpenSpec change and keep tasks in sync.'
      );
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(openCodeArchive, 'utf-8');
      expect(archiveContent).toContain('agent: build');
      expect(archiveContent).toContain(
        'description: Archive a deployed OpenSpec change and update specs.'
      );
      expect(archiveContent).toContain('openspec list --specs');
    });

    it('should create Cline rule files with templates', async () => {
      queueSelections('cline', DONE);

      await initCommand.execute(testDir);

      const clineProposal = path.join(
        testDir,
        '.clinerules/openspec-proposal.md'
      );
      const clineApply = path.join(
        testDir,
        '.clinerules/openspec-apply.md'
      );
      const clineArchive = path.join(
        testDir,
        '.clinerules/openspec-archive.md'
      );

      expect(await fileExists(clineProposal)).toBe(true);
      expect(await fileExists(clineApply)).toBe(true);
      expect(await fileExists(clineArchive)).toBe(true);

      const proposalContent = await fs.readFile(clineProposal, 'utf-8');
      expect(proposalContent).toContain('# OpenSpec: Proposal');
      expect(proposalContent).toContain('Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(clineApply, 'utf-8');
      expect(applyContent).toContain('# OpenSpec: Apply');
      expect(applyContent).toContain('Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(clineArchive, 'utf-8');
      expect(archiveContent).toContain('# OpenSpec: Archive');
      expect(archiveContent).toContain('Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('openspec archive <id>');
    });

    it('should create Factory slash command files with templates', async () => {
      queueSelections('factory', DONE);

      await initCommand.execute(testDir);

      const factoryProposal = path.join(
        testDir,
        '.factory/commands/openspec-proposal.md'
      );
      const factoryApply = path.join(
        testDir,
        '.factory/commands/openspec-apply.md'
      );
      const factoryArchive = path.join(
        testDir,
        '.factory/commands/openspec-archive.md'
      );

      expect(await fileExists(factoryProposal)).toBe(true);
      expect(await fileExists(factoryApply)).toBe(true);
      expect(await fileExists(factoryArchive)).toBe(true);

      const proposalContent = await fs.readFile(factoryProposal, 'utf-8');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('argument-hint: request or feature description');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(
        /<!-- OPENSPEC:START -->([\s\S]*?)<!-- OPENSPEC:END -->/u.exec(
          proposalContent
        )?.[1]
      ).toContain('$ARGUMENTS');

      const applyContent = await fs.readFile(factoryApply, 'utf-8');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('argument-hint: change-id');
      expect(applyContent).toContain('Work through tasks sequentially');
      expect(
        /<!-- OPENSPEC:START -->([\s\S]*?)<!-- OPENSPEC:END -->/u.exec(
          applyContent
        )?.[1]
      ).toContain('$ARGUMENTS');

      const archiveContent = await fs.readFile(factoryArchive, 'utf-8');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('argument-hint: change-id');
      expect(archiveContent).toContain('openspec archive <id> --yes');
      expect(
        /<!-- OPENSPEC:START -->([\s\S]*?)<!-- OPENSPEC:END -->/u.exec(
          archiveContent
        )?.[1]
      ).toContain('$ARGUMENTS');
    });

    it('should create Codex prompts with templates and placeholders', async () => {
      queueSelections('codex', DONE);

      await initCommand.execute(testDir);

      const proposalPath = path.join(
        testDir,
        '.codex/prompts/openspec-proposal.md'
      );
      const applyPath = path.join(
        testDir,
        '.codex/prompts/openspec-apply.md'
      );
      const archivePath = path.join(
        testDir,
        '.codex/prompts/openspec-archive.md'
      );

      expect(await fileExists(proposalPath)).toBe(true);
      expect(await fileExists(applyPath)).toBe(true);
      expect(await fileExists(archivePath)).toBe(true);

      const proposalContent = await fs.readFile(proposalPath, 'utf-8');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('argument-hint: request or feature description');
      expect(proposalContent).toContain('$ARGUMENTS');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(applyPath, 'utf-8');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('argument-hint: change-id');
      expect(applyContent).toContain('$ARGUMENTS');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(archivePath, 'utf-8');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('argument-hint: change-id');
      expect(archiveContent).toContain('$ARGUMENTS');
      expect(archiveContent).toContain('openspec archive <id> --yes');
    });

    it('should create Kilo Code workflows with templates', async () => {
      queueSelections('kilocode', DONE);

      await initCommand.execute(testDir);

      const proposalPath = path.join(
        testDir,
        '.kilocode/workflows/openspec-proposal.md'
      );
      const applyPath = path.join(
        testDir,
        '.kilocode/workflows/openspec-apply.md'
      );
      const archivePath = path.join(
        testDir,
        '.kilocode/workflows/openspec-archive.md'
      );

      expect(await fileExists(proposalPath)).toBe(true);
      expect(await fileExists(applyPath)).toBe(true);
      expect(await fileExists(archivePath)).toBe(true);

      const proposalContent = await fs.readFile(proposalPath, 'utf-8');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');
      expect(proposalContent).not.toContain('---\n');

      const applyContent = await fs.readFile(applyPath, 'utf-8');
      expect(applyContent).toContain('Work through tasks sequentially');
      expect(applyContent).not.toContain('---\n');

      const archiveContent = await fs.readFile(archivePath, 'utf-8');
      expect(archiveContent).toContain('openspec list --specs');
      expect(archiveContent).not.toContain('---\n');
    });

    it('should create GitHub Copilot prompt files with templates', async () => {
      queueSelections('github-copilot', DONE);

      await initCommand.execute(testDir);

      const proposalPath = path.join(
        testDir,
        '.github/prompts/openspec-proposal.prompt.md'
      );
      const applyPath = path.join(
        testDir,
        '.github/prompts/openspec-apply.prompt.md'
      );
      const archivePath = path.join(
        testDir,
        '.github/prompts/openspec-archive.prompt.md'
      );

      expect(await fileExists(proposalPath)).toBe(true);
      expect(await fileExists(applyPath)).toBe(true);
      expect(await fileExists(archivePath)).toBe(true);

      const proposalContent = await fs.readFile(proposalPath, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('$ARGUMENTS');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(applyPath, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('$ARGUMENTS');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(archivePath, 'utf-8');
      expect(archiveContent).toContain('---');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('$ARGUMENTS');
      expect(archiveContent).toContain('openspec archive <id> --yes');
    });

    it('should add new tool when OpenSpec already exists', async () => {
      queueSelections('claude', DONE, 'cursor', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );
      expect(await fileExists(cursorProposal)).toBe(true);
    });

    it('should allow extend mode with no additional native tools', async () => {
      queueSelections('claude', DONE, DONE);
      await initCommand.execute(testDir);
      await expect(initCommand.execute(testDir)).resolves.toBeUndefined();
    });

    it('should handle non-existent target directory', async () => {
      queueSelections('claude', DONE);

      const newDir = path.join(testDir, 'new-project');
      await initCommand.execute(newDir);

      const openspecPath = path.join(newDir, 'openspec');
      expect(await directoryExists(openspecPath)).toBe(true);
    });

    it('should display success message with selected tool name', async () => {
      queueSelections('claude', DONE);
      const logSpy = vi.mocked(console.log);

      await initCommand.execute(testDir);

      const calls = logSpy.mock.calls.map((args) =>
        stripAnsi(args.join(' '))
      );
      expect(
        calls.some((line) =>
          line.includes('Next steps - Copy these prompts to')
        )
      ).toBe(true);
      expect(calls.some((line) => line.includes('Claude Code'))).toBe(true);
    });

    it('should reference AGENTS compatible assistants in success message', async () => {
      queueSelections(DONE);
      const logSpy = vi.mocked(console.log);

      await initCommand.execute(testDir);

      const calls = logSpy.mock.calls.map((args) =>
        stripAnsi(args.join(' '))
      );
      expect(
        calls.some((line) =>
          line.includes('Next steps - Copy these prompts to')
        )
      ).toBe(true);
      expect(
        calls.some((line) =>
          line.includes('your AGENTS.md-compatible assistant')
        )
      ).toBe(true);
    });
  });

  describe('AI tool selection', () => {
    it('should prompt for AI tool selection', async () => {
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          baseMessage: expect.stringContaining(
            'Which natively supported AI tools do you use?'
          ),
        })
      );
    });

    it('should handle different AI tool selections', async () => {
      // For now, only Claude is available, but test the structure
      queueSelections('claude', DONE);

      await initCommand.execute(testDir);

      // When other tools are added, we'd test their specific configurations here
      const claudePath = path.join(testDir, 'CLAUDE.md');
      expect(await fileExists(claudePath)).toBe(true);
    });

    it('should mark existing tools as already configured during extend mode', async () => {
      queueSelections('claude', DONE, 'cursor', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const claudeChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'claude'
      );
      expect(claudeChoice.configured).toBe(true);
    });

    it('should preselect Kilo Code when workflows already exist', async () => {
      queueSelections('kilocode', DONE, 'kilocode', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const preselected = secondRunArgs.initialSelected ?? [];
      expect(preselected).toContain('kilocode');
    });

    it('should mark Windsurf as already configured during extend mode', async () => {
      queueSelections('windsurf', DONE, 'windsurf', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const wsChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'windsurf'
      );
      expect(wsChoice.configured).toBe(true);
    });

    it('should mark Codex as already configured during extend mode', async () => {
      queueSelections('codex', DONE, 'codex', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const codexChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'codex'
      );
      expect(codexChoice.configured).toBe(true);
    });

    it('should mark Factory Droid as already configured during extend mode', async () => {
      queueSelections('factory', DONE, 'factory', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const factoryChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'factory'
      );
      expect(factoryChoice.configured).toBe(true);
    });

    it('should mark GitHub Copilot as already configured during extend mode', async () => {
      queueSelections('github-copilot', DONE, 'github-copilot', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const githubCopilotChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'github-copilot'
      );
      expect(githubCopilotChoice.configured).toBe(true);
    });

    it('should create Amazon Q Developer prompt files with templates', async () => {
      queueSelections('amazon-q', DONE);

      await initCommand.execute(testDir);

      const proposalPath = path.join(
        testDir,
        '.amazonq/prompts/openspec-proposal.md'
      );
      const applyPath = path.join(
        testDir,
        '.amazonq/prompts/openspec-apply.md'
      );
      const archivePath = path.join(
        testDir,
        '.amazonq/prompts/openspec-archive.md'
      );

      expect(await fileExists(proposalPath)).toBe(true);
      expect(await fileExists(applyPath)).toBe(true);
      expect(await fileExists(archivePath)).toBe(true);

      const proposalContent = await fs.readFile(proposalPath, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('$ARGUMENTS');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(applyPath, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('$ARGUMENTS');
      expect(applyContent).toContain('<!-- OPENSPEC:START -->');
    });

    it('should mark Amazon Q Developer as already configured during extend mode', async () => {
      queueSelections('amazon-q', DONE, 'amazon-q', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const amazonQChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'amazon-q'
      );
      expect(amazonQChoice.configured).toBe(true);
    });

    it('should create Auggie slash command files with templates', async () => {
      queueSelections('auggie', DONE);

      await initCommand.execute(testDir);

      const auggieProposal = path.join(
        testDir,
        '.augment/commands/openspec-proposal.md'
      );
      const auggieApply = path.join(
        testDir,
        '.augment/commands/openspec-apply.md'
      );
      const auggieArchive = path.join(
        testDir,
        '.augment/commands/openspec-archive.md'
      );

      expect(await fileExists(auggieProposal)).toBe(true);
      expect(await fileExists(auggieApply)).toBe(true);
      expect(await fileExists(auggieArchive)).toBe(true);

      const proposalContent = await fs.readFile(auggieProposal, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('argument-hint: feature description or request');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(auggieApply, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('argument-hint: change-id');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(auggieArchive, 'utf-8');
      expect(archiveContent).toContain('---');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('argument-hint: change-id');
      expect(archiveContent).toContain('openspec archive <id> --yes');
    });

    it('should mark Auggie as already configured during extend mode', async () => {
      queueSelections('auggie', DONE, 'auggie', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const auggieChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'auggie'
      );
      expect(auggieChoice.configured).toBe(true);
    });

    it('should create CodeBuddy slash command files with templates', async () => {
      queueSelections('codebuddy', DONE);

      await initCommand.execute(testDir);

      const codeBuddyProposal = path.join(
        testDir,
        '.codebuddy/commands/openspec/proposal.md'
      );
      const codeBuddyApply = path.join(
        testDir,
        '.codebuddy/commands/openspec/apply.md'
      );
      const codeBuddyArchive = path.join(
        testDir,
        '.codebuddy/commands/openspec/archive.md'
      );

      expect(await fileExists(codeBuddyProposal)).toBe(true);
      expect(await fileExists(codeBuddyApply)).toBe(true);
      expect(await fileExists(codeBuddyArchive)).toBe(true);

      const proposalContent = await fs.readFile(codeBuddyProposal, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('name: OpenSpec: Proposal');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('category: OpenSpec');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(codeBuddyApply, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('name: OpenSpec: Apply');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(codeBuddyArchive, 'utf-8');
      expect(archiveContent).toContain('---');
      expect(archiveContent).toContain('name: OpenSpec: Archive');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('openspec archive <id> --yes');
    });

    it('should mark CodeBuddy as already configured during extend mode', async () => {
      queueSelections('codebuddy', DONE, 'codebuddy', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const codeBuddyChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'codebuddy'
      );
      expect(codeBuddyChoice.configured).toBe(true);
    });

    it('should create CODEBUDDY.md when CodeBuddy is selected', async () => {
      queueSelections('codebuddy', DONE);

      await initCommand.execute(testDir);

      const codeBuddyPath = path.join(testDir, 'CODEBUDDY.md');
      expect(await fileExists(codeBuddyPath)).toBe(true);

      const content = await fs.readFile(codeBuddyPath, 'utf-8');
      expect(content).toContain('<!-- OPENSPEC:START -->');
      expect(content).toContain("@/openspec/AGENTS.md");
      expect(content).toContain('openspec update');
      expect(content).toContain('<!-- OPENSPEC:END -->');
    });

    it('should update existing CODEBUDDY.md with markers', async () => {
      queueSelections('codebuddy', DONE);

      const codeBuddyPath = path.join(testDir, 'CODEBUDDY.md');
      const existingContent =
        '# My CodeBuddy Instructions\nCustom instructions here';
      await fs.writeFile(codeBuddyPath, existingContent);

      await initCommand.execute(testDir);

      const updatedContent = await fs.readFile(codeBuddyPath, 'utf-8');
      expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
      expect(updatedContent).toContain("@/openspec/AGENTS.md");
      expect(updatedContent).toContain('openspec update');
      expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
      expect(updatedContent).toContain('Custom instructions here');
    });

    it('should create Crush slash command files with templates', async () => {
      queueSelections('crush', DONE);

      await initCommand.execute(testDir);

      const crushProposal = path.join(
        testDir,
        '.crush/commands/openspec/proposal.md'
      );
      const crushApply = path.join(
        testDir,
        '.crush/commands/openspec/apply.md'
      );
      const crushArchive = path.join(
        testDir,
        '.crush/commands/openspec/archive.md'
      );

      expect(await fileExists(crushProposal)).toBe(true);
      expect(await fileExists(crushApply)).toBe(true);
      expect(await fileExists(crushArchive)).toBe(true);

      const proposalContent = await fs.readFile(crushProposal, 'utf-8');
      expect(proposalContent).toContain('---');
      expect(proposalContent).toContain('name: OpenSpec: Proposal');
      expect(proposalContent).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
      expect(proposalContent).toContain('category: OpenSpec');
      expect(proposalContent).toContain('tags: [openspec, change]');
      expect(proposalContent).toContain('<!-- OPENSPEC:START -->');
      expect(proposalContent).toContain('**Guardrails**');

      const applyContent = await fs.readFile(crushApply, 'utf-8');
      expect(applyContent).toContain('---');
      expect(applyContent).toContain('name: OpenSpec: Apply');
      expect(applyContent).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
      expect(applyContent).toContain('category: OpenSpec');
      expect(applyContent).toContain('tags: [openspec, apply]');
      expect(applyContent).toContain('Work through tasks sequentially');

      const archiveContent = await fs.readFile(crushArchive, 'utf-8');
      expect(archiveContent).toContain('---');
      expect(archiveContent).toContain('name: OpenSpec: Archive');
      expect(archiveContent).toContain('description: Archive a deployed OpenSpec change and update specs.');
      expect(archiveContent).toContain('category: OpenSpec');
      expect(archiveContent).toContain('tags: [openspec, archive]');
      expect(archiveContent).toContain('openspec archive <id> --yes');
    });

    it('should mark Crush as already configured during extend mode', async () => {
      queueSelections('crush', DONE, 'crush', DONE);
      await initCommand.execute(testDir);
      await initCommand.execute(testDir);

      const secondRunArgs = mockPrompt.mock.calls[1][0];
      const crushChoice = secondRunArgs.choices.find(
        (choice: any) => choice.value === 'crush'
      );
      expect(crushChoice.configured).toBe(true);
    });
  });

  describe('non-interactive mode', () => {
    it('should select all available tools with --tools all option', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'all' });

      await nonInteractiveCommand.execute(testDir);

      // Should create configurations for all available tools
      const claudePath = path.join(testDir, 'CLAUDE.md');
      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );
      const windsurfProposal = path.join(
        testDir,
        '.windsurf/workflows/openspec-proposal.md'
      );

      expect(await fileExists(claudePath)).toBe(true);
      expect(await fileExists(cursorProposal)).toBe(true);
      expect(await fileExists(windsurfProposal)).toBe(true);
    });

    it('should select specific tools with --tools option', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'claude,cursor' });

      await nonInteractiveCommand.execute(testDir);

      const claudePath = path.join(testDir, 'CLAUDE.md');
      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );
      const windsurfProposal = path.join(
        testDir,
        '.windsurf/workflows/openspec-proposal.md'
      );

      expect(await fileExists(claudePath)).toBe(true);
      expect(await fileExists(cursorProposal)).toBe(true);
      expect(await fileExists(windsurfProposal)).toBe(false); // Not selected
    });

    it('should skip tool configuration with --tools none option', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'none' });

      await nonInteractiveCommand.execute(testDir);

      const claudePath = path.join(testDir, 'CLAUDE.md');
      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );

      // Should still create AGENTS.md but no tool-specific files
      const rootAgentsPath = path.join(testDir, 'AGENTS.md');
      expect(await fileExists(rootAgentsPath)).toBe(true);
      expect(await fileExists(claudePath)).toBe(false);
      expect(await fileExists(cursorProposal)).toBe(false);
    });

    it('should throw error for invalid tool names', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'invalid-tool' });

      await expect(nonInteractiveCommand.execute(testDir)).rejects.toThrow(
        /Invalid tool\(s\): invalid-tool\. Available values: /
      );
    });

    it('should handle comma-separated tool names with spaces', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'claude, cursor' });

      await nonInteractiveCommand.execute(testDir);

      const claudePath = path.join(testDir, 'CLAUDE.md');
      const cursorProposal = path.join(
        testDir,
        '.cursor/commands/openspec-proposal.md'
      );

      expect(await fileExists(claudePath)).toBe(true);
      expect(await fileExists(cursorProposal)).toBe(true);
    });

    it('should reject combining reserved keywords with explicit tool ids', async () => {
      const nonInteractiveCommand = new InitCommand({ tools: 'all,claude' });

      await expect(nonInteractiveCommand.execute(testDir)).rejects.toThrow(
        /Cannot combine reserved values "all" or "none" with specific tool IDs/
      );
    });
  });

  describe('error handling', () => {
    it('should provide helpful error for insufficient permissions', async () => {
      // This is tricky to test cross-platform, but we can test the error message
      const readOnlyDir = path.join(testDir, 'readonly');
      await fs.mkdir(readOnlyDir);

      // Mock the permission check to fail
      const originalCheck = fs.writeFile;
      vi.spyOn(fs, 'writeFile').mockImplementation(
        async (filePath: any, ...args: any[]) => {
          if (
            typeof filePath === 'string' &&
            filePath.includes('.openspec-test-')
          ) {
            throw new Error('EACCES: permission denied');
          }
          return originalCheck.call(fs, filePath, ...args);
        }
      );

      queueSelections('claude', DONE);
      await expect(initCommand.execute(readOnlyDir)).rejects.toThrow(
        /Insufficient permissions/
      );
    });
  });
});

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
