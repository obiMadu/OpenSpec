import { TaskManagementMode } from '../config.js';

export function agentsRootStubTemplate(mode: TaskManagementMode = 'markdown'): string {
  const base = `# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open \`@/openspec/AGENTS.md\` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use \`@/openspec/AGENTS.md\` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.
`;

  if (mode !== 'bd') {
    return base;
  }

  const bdBlock = `
## bd Issue Tracking

OpenSpec manages planning with bd (Beads). Run \`bd onboard\` right now so bd can install its latest agent instructions and update this file automatically. Let bd finish and follow whatever additional setup it prompts for (such as \`bd init\`).

Once bd has written its instructions, follow that workflow for all task tracking (create and update bd issues for each actionable task) and coordinate work through bd.
`;


  return `${base}${bdBlock}`;
}


