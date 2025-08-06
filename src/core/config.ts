export const OPENSPEC_DIR_NAME = 'openspec';

export interface OpenSpecConfig {
  aiTools: string[];
}

export const OPENSPEC_MARKERS = {
  start: '<!-- OPENSPEC:START -->',
  end: '<!-- OPENSPEC:END -->'
};

export const AI_TOOLS = [
  { name: 'Claude Code', value: 'claude', available: true },
  { name: 'Cursor', value: 'cursor', available: false },
  { name: 'Aider', value: 'aider', available: false },
  { name: 'Continue', value: 'continue', available: false }
];