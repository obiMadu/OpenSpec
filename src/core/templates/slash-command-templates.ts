export type SlashCommandId = 'proposal' | 'apply' | 'archive';

const baseGuardrails = `**Guardrails**
- Default to <100 lines of new code, single-file solutions, and avoid new frameworks unless OpenSpec data requires it.
- Use pnpm for Node.js tooling and keep changes scoped to the requested outcome.`;

const proposalGuardrails = `${baseGuardrails}\n- Ask up to two clarifying questions if the request is ambiguous before editing files.`;

const proposalSteps = `**Steps**
1. Review \`openspec/project.md\`, run \`openspec list\`, and \`openspec list --specs\` to understand current work and capabilities.
2. Choose a unique verb-led \`change-id\` and scaffold \`proposal.md\`, \`tasks.md\`, and optional \`design.md\` under \`openspec/changes/<id>/\`.
3. Draft spec deltas in \`changes/<id>/specs/\` using \`## ADDED|MODIFIED|REMOVED Requirements\` with at least one \`#### Scenario:\` per requirement.
4. Validate with \`openspec validate <id> --strict\` and resolve every issue before sharing the proposal.`;

const proposalReferences = `**Reference**
- Use \`openspec show <id> --json --deltas-only\` or \`openspec show <spec> --type spec\` to inspect details when validation fails.
- Search existing requirements with \`rg -n "Requirement:|Scenario:" openspec/specs\` before writing new ones.`;

const applySteps = `**Steps**
1. Read \`changes/<id>/proposal.md\`, \`design.md\` (if present), and \`tasks.md\` to confirm scope and acceptance criteria.
2. Work through tasks sequentially, keeping edits minimal and focused on the requested change.
3. Mark each task \`- [x]\` immediately after completing it to keep the checklist in sync.
4. Reference \`openspec list\` or \`openspec show <item>\` when additional context is required.`;

const applyReferences = `**Reference**
- Use \`openspec show <id> --json --deltas-only\` if you need additional context from the proposal while implementing.`;

const archiveSteps = `**Steps**
1. Confirm deployment is complete, then move \`changes/<id>/\` to \`changes/archive/YYYY-MM-DD-<id>/\`.
2. Update \`openspec/specs/\` to capture production behaviour, editing existing capabilities before creating new ones.
3. Run \`openspec archive <id> --skip-specs\` only for tooling-only work; otherwise ensure spec deltas are committed.
4. Re-run \`openspec validate --strict\` and review with \`openspec show <id>\` to verify archive changes.`;

const archiveReferences = `**Reference**
- Cross-check capabilities with \`openspec list --specs\` and resolve any outstanding validation issues before finishing.`;

export const slashCommandBodies: Record<SlashCommandId, string> = {
  proposal: [proposalGuardrails, proposalSteps, proposalReferences].join('\n\n'),
  apply: [baseGuardrails, applySteps, applyReferences].join('\n\n'),
  archive: [baseGuardrails, archiveSteps, archiveReferences].join('\n\n')
};

export function getSlashCommandBody(id: SlashCommandId): string {
  return slashCommandBodies[id];
}
