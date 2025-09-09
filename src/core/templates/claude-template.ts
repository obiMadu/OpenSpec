export const claudeTemplate = `# OpenSpec Project

This project uses OpenSpec for spec-driven development. Specifications are the source of truth.

See @openspec/README.md for detailed conventions and guidelines.

## Three-Stage Workflow

### Stage 1: Creating Changes
Create proposal for: features, breaking changes, architecture changes
Skip proposal for: bug fixes, typos, non-breaking updates

### Stage 2: Implementing Changes
1. Read proposal.md to understand the change
2. Read design.md if it exists for technical context
3. Read tasks.md for implementation checklist
4. Complete tasks one by one
5. Mark each task complete immediately: \`- [x]\`
6. Validate strictly: \`openspec validate [change] --strict\`
7. Approval gate: Do not start implementation until the proposal is approved

### Stage 3: Archiving
After deployment, use \`openspec archive [change]\` (add \`--skip-specs\` for tooling-only changes)

## Before Any Task

**Always:**
- Check existing specs: \`openspec list --specs\`
- Check active changes: \`openspec list\`
- Read relevant specs before creating new ones
- Prefer modifying existing specs over creating duplicates

## CLI Quick Reference

\`\`\`bash
# Essential
openspec list              # Active changes
openspec list --specs      # Existing specifications
openspec show [item]       # View details
openspec diff [change]     # Show spec differences
openspec validate --strict # Validate thoroughly
openspec archive [change]  # Archive after deployment

# Interactive
openspec show              # Prompts for selection
openspec validate          # Bulk validation

# Debugging
openspec show [change] --json --deltas-only
\`\`\`

## Creating Changes

1. **Directory:** \`changes/[change-id]/\`
   - Change ID naming: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`), unique (append `-2`, `-3` if needed)
2. **Files:**
   - \`proposal.md\` - Why, what, impact
   - \`tasks.md\` - Implementation checklist
   - \`design.md\` - Only if needed (cross-cutting, new deps/data model, security/perf/migration complexity, or high ambiguity)
   - \`specs/[capability]/spec.md\` - Delta changes (ADDED/MODIFIED/REMOVED). For multiple capabilities, include multiple files.
3. **If ambiguous:** ask 1–2 clarifying questions before scaffolding

## Search Guidance
- Enumerate specs: \`openspec spec list --long\` (or \`--json\`)
- Enumerate changes: \`openspec list\`
- Show details: \`openspec show <spec-id> --type spec\`, \`openspec show <change-id> --json --deltas-only\`
- Full-text search (use ripgrep): \`rg -n "Requirement:|Scenario:" openspec/specs\`

## Critical: Scenario Format

**CORRECT:**
\`\`\`markdown
#### Scenario: User login
- **WHEN** valid credentials
- **THEN** return token
\`\`\`

**WRONG:** Using bullets (- **Scenario**), bold (**Scenario:**), or ### headers

Every requirement MUST have scenarios using \`#### Scenario:\` format.

## Complexity Management

**Default to minimal:**
- <100 lines of new code
- Single-file implementations
- No frameworks without justification
- Boring, proven patterns

**Only add complexity with:**
- Performance data showing need
- Concrete scale requirements (>1000 users)
- Multiple proven use cases

## Troubleshooting

**"Change must have at least one delta"**
- Check \`changes/[name]/specs/\` exists
- Verify operation prefixes (## ADDED Requirements)

**"Requirement must have at least one scenario"**
- Use \`#### Scenario:\` format (4 hashtags)
- Don't use bullets or bold

**Debug:** \`openspec show [change] --json --deltas-only\`
`;
