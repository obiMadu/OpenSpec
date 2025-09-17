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
  { name: 'AGENTS.md standard', value: 'agents', available: true, successLabel: 'your AGENTS.md-compatible assistant' },
  { name: 'Cursor', value: 'cursor', available: true, successLabel: 'Cursor' },
  { name: 'Aider', value: 'aider', available: false },
  { name: 'Continue', value: 'continue', available: false }
];
