# Implementation Tasks

## 1. Restructure OpenSpec README.md
- [ ] 1.1 Front-load the three-stage workflow as primary content
- [ ] 1.2 Restructure with hierarchy: Core Workflow → Quick Start → Commands → Details → Edge Cases
- [ ] 1.3 Reduce total length by 50% (target: ~285 lines from current ~575)
- [ ] 1.4 Add "Before Any Task" context-gathering checklist
- [ ] 1.5 Add "Before Creating Specs" rule to check existing specs first

## 2. Add Decision Clarity
- [ ] 2.1 Create clear decision trees for "Create Proposal?" scenarios
- [ ] 2.2 Remove ambiguous conditions that confuse agents
- [ ] 2.3 Add concrete examples for each decision branch
- [ ] 2.4 Simplify bug vs feature determination logic

## 3. Update CLI Documentation
- [ ] 3.1 Document `openspec list` and `openspec list --specs` commands
- [ ] 3.2 Document `openspec show` with all flags and interactive mode
- [ ] 3.3 Document `openspec diff [change]` for viewing spec differences
- [ ] 3.4 Document `openspec archive` with --skip-specs option
- [ ] 3.5 Document `openspec validate` with --strict and batch modes
- [ ] 3.6 Document `openspec init` and `openspec update` commands
- [ ] 3.7 Remove all deprecated noun-first command references
- [ ] 3.8 Add concrete usage examples for each command variation
- [ ] 3.9 Document all flags: --json, --type, --no-interactive, etc.

## 4. Add Agent-Specific Sections
- [ ] 4.1 Add spec discovery workflow (check existing before creating)
- [ ] 4.2 Create tool selection matrix (Grep vs Glob vs Read)
- [ ] 4.3 Add error recovery patterns section
- [ ] 4.4 Add context management guide
- [ ] 4.5 Add verification workflows section
- [ ] 4.6 Add best practices section (concise, specific, simple)

## 5. Update CLAUDE.md Template
- [ ] 5.1 Update `src/core/templates/claude-template.ts` with streamlined content
- [ ] 5.2 Include three-stage workflow prominently
- [ ] 5.3 Add comprehensive CLI quick reference (list, show, diff, archive, etc.)
- [ ] 5.4 Add "Before Any Task" checklist
- [ ] 5.5 Add "Before Creating Specs" rule
- [ ] 5.6 Keep complexity management principles

## 6. Testing and Validation
- [ ] 6.1 Test all documented CLI commands for accuracy
- [ ] 6.2 Run `openspec init` to verify CLAUDE.md generation
- [ ] 6.3 Validate instruction clarity with example scenarios
- [ ] 6.4 Ensure no critical information was lost in streamlining
- [ ] 6.5 Verify decision trees eliminate ambiguity