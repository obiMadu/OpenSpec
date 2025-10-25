import { TaskManagementMode } from '../config.js';

export type SlashCommandId = 'proposal' | 'apply' | 'archive';

const baseGuardrails = `**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to \`openspec/AGENTS.md\` (located inside the \`openspec/\` directory—run \`ls openspec\` or \`openspec update\` if you don't see it) if you need additional OpenSpec conventions or clarifications.`;

const proposalGuardrails = `${baseGuardrails}\n- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.`;

function getProposalSteps(mode: TaskManagementMode): string {
  const steps = [
    '1. Review `openspec/project.md`, run `openspec list` and `openspec list --specs`, and inspect related code or docs (e.g., via `rg`/`ls`) to ground the proposal in current behaviour; note any gaps that require clarification.',
    mode === 'bd'
      ? '2. Choose a unique verb-led `change-id`, scaffold `proposal.md`, optional `design.md`, spec deltas under `openspec/changes/<id>/`, and create or update a bd issue to manage implementation tasks.'
      : '2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, and `design.md` (when needed) under `openspec/changes/<id>/`.',
    '3. Map the change into concrete capabilities or requirements, breaking multi-scope efforts into distinct spec deltas with clear relationships and sequencing.',
    '4. Capture architectural reasoning in `design.md` when the solution spans multiple systems, introduces new patterns, or demands trade-off discussion before committing to specs.',
    '5. Draft spec deltas in `changes/<id>/specs/<capability>/spec.md` (one folder per capability) using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement and cross-reference related capabilities when relevant.',
    mode === 'bd'
      ? '6. Break implementation into bd tasks: capture granular work items, dependencies, validation steps, and owners so progress stays visible.'
      : '6. Draft `tasks.md` as an ordered list of small, verifiable work items that deliver user-visible progress, include validation (tests, tooling), and highlight dependencies or parallelizable work.',
    '7. Validate with `openspec validate <id> --strict` and resolve every issue before sharing the proposal.',
  ];
  return `**Steps**\n${steps.join('\n')}`;
}

const proposalReferences = `**Reference**
- Use \`openspec show <id> --json --deltas-only\` or \`openspec show <spec> --type spec\` to inspect details when validation fails.
- Search existing requirements with \`rg -n "Requirement:|Scenario:" openspec/specs\` before writing new ones.
- Explore the codebase with \`rg <keyword>\`, \`ls\`, or direct file reads so proposals align with current implementation realities.`;

function getApplySteps(mode: TaskManagementMode): string {
  if (mode === 'bd') {
    const steps = [
      'Track these steps through bd so status, owners, and blockers stay accurate.',
      '1. Read `changes/<id>/proposal.md`, `design.md` (if present), and the linked bd issue to confirm scope and acceptance criteria.',
      '2. Review the bd task list, clarify dependencies, and ensure each item has a concrete outcome before starting execution.',
      '3. Complete tasks sequentially, updating the bd issue with notes, links, and status changes as work progresses.',
      '4. Surface blockers or questions in bd comments so stakeholders see them immediately.',
      '5. Close or hand off every bd task before marking the issue complete, and summarize validation or follow-up actions.',
    ];
    return `**Steps**\n${steps.join('\n')}`;
  }

  const steps = [
    'Track these steps as TODOs and complete them one by one.',
    '1. Read `changes/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope and acceptance criteria.',
    '2. Work through tasks sequentially, keeping edits minimal and focused on the requested change.',
    '3. Confirm completion before updating statuses—make sure every item in `tasks.md` is finished.',
    '4. Update the checklist after all work is done so each task is marked `- [x]` and reflects reality.',
    '5. Reference `openspec list` or `openspec show <item>` when additional context is required.',
  ];
  return `**Steps**\n${steps.join('\n')}`;
}

function getApplyReferences(mode: TaskManagementMode): string {
  if (mode === 'bd') {
    return `**Reference**
- Use \`bd update <issue> --status in_progress\` (or your workflow’s equivalent) to reflect ownership and timing.
- Cross-check \`openspec show <id> --json --deltas-only\` when you need additional proposal context while implementing.`;
  }

  return `**Reference**
- Use \`openspec show <id> --json --deltas-only\` if you need additional context from the proposal while implementing.`;
}

const archiveSteps = `**Steps**
1. Determine the change ID to archive:
   - If this prompt already includes a specific change ID (for example inside a \`<ChangeId>\` block populated by slash-command arguments), use that value after trimming whitespace.
   - If the conversation references a change loosely (for example by title or summary), run \`openspec list\` to surface likely IDs, share the relevant candidates, and confirm which one the user intends.
   - Otherwise, review the conversation, run \`openspec list\`, and ask the user which change to archive; wait for a confirmed change ID before proceeding.
   - If you still cannot identify a single change ID, stop and tell the user you cannot archive anything yet.
2. Validate the change ID by running \`openspec list\` (or \`openspec show <id>\`) and stop if the change is missing, already archived, or otherwise not ready to archive.
3. Run \`openspec archive <id> --yes\` so the CLI moves the change and applies spec updates without prompts (use \`--skip-specs\` only for tooling-only work).
4. Review the command output to confirm the target specs were updated and the change landed in \`changes/archive/\`.
5. Validate with \`openspec validate --strict\` and inspect with \`openspec show <id>\` if anything looks off.`;

const archiveReferences = `**Reference**
- Use \`openspec list\` to confirm change IDs before archiving.
- Inspect refreshed specs with \`openspec list --specs\` and address any validation issues before handing off.`;

export function getSlashCommandBody(id: SlashCommandId, mode: TaskManagementMode = 'markdown'): string {
  const bodies: Record<SlashCommandId, string> = {
    proposal: [proposalGuardrails, getProposalSteps(mode), proposalReferences].join('\n\n'),
    apply: [baseGuardrails, getApplySteps(mode), getApplyReferences(mode)].join('\n\n'),
    archive: [baseGuardrails, archiveSteps, archiveReferences].join('\n\n'),
  };
  return bodies[id];
}
