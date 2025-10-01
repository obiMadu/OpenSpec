export const OPENSPEC_DIR_NAME = 'openspec';

export const OPENSPEC_MARKERS = {
  start: '<!-- OPENSPEC:START -->',
  end: '<!-- OPENSPEC:END -->'
};

export interface OpenSpecConfig {
  aiTools: string[];
}

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  successLabel?: string;
}

export const AI_TOOLS: AIToolOption[] = [
  { name: 'Claude Code', value: 'claude', available: true, successLabel: 'Claude Code' },
  { name: 'Cursor', value: 'cursor', available: true, successLabel: 'Cursor' },
  { name: 'OpenCode', value: 'opencode', available: true, successLabel: 'OpenCode' },
  { name: 'Kilo Code', value: 'kilocode', available: true, successLabel: 'Kilo Code' },
  { name: 'AGENTS.md (works with Codex, Amp, VS Code, GitHub Copilot, …)', value: 'agents', available: false, successLabel: 'your AGENTS.md-compatible assistant' }
];
