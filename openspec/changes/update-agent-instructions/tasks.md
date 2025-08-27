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
- [ ] 2.5 Add explicit Stage 2 implementation steps (read → implement → mark complete)

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
- [ ] 3.10 Document debugging commands: `show --json --deltas-only`

## 4. Add Spec File Documentation
- [ ] 4.1 Add complete spec file structure example with ADDED/MODIFIED sections
- [ ] 4.2 Document scenario formatting requirements (#### Scenario: headers)
- [ ] 4.3 Explain delta file location (changes/{name}/specs/ directory)
- [ ] 4.4 Show how deltas are automatically extracted
- [ ] 4.5 Include warning about most common error (scenario formatting)

## 5. Add Troubleshooting Section
- [ ] 5.1 Document common errors and their solutions
- [ ] 5.2 Add delta detection debugging steps
- [ ] 5.3 Include validation best practices (--strict flag)
- [ ] 5.4 Show how to use JSON output for debugging
- [ ] 5.5 Add examples of silent parsing failures

## 6. Add Agent-Specific Sections
- [ ] 6.1 Add implementation workflow (read docs → implement tasks → mark complete)
- [ ] 6.2 Add spec discovery workflow (check existing before creating)
- [ ] 6.3 Create tool selection matrix (Grep vs Glob vs Read)
- [ ] 6.4 Add error recovery patterns section
- [ ] 6.5 Add context management guide
- [ ] 6.6 Add verification workflows section
- [ ] 6.7 Add best practices section (concise, specific, simple)

## 7. Update CLAUDE.md Template
- [ ] 7.1 Update `src/core/templates/claude-template.ts` with streamlined content
- [ ] 7.2 Include three-stage workflow prominently
- [ ] 7.3 Add comprehensive CLI quick reference (list, show, diff, archive, etc.)
- [ ] 7.4 Add "Before Any Task" checklist
- [ ] 7.5 Add "Before Creating Specs" rule
- [ ] 7.6 Keep complexity management principles
- [ ] 7.7 Add critical scenario formatting note (#### Scenario: headers)
- [ ] 7.8 Include debugging command reference

## 8. Testing and Validation
- [ ] 8.1 Test all documented CLI commands for accuracy
- [ ] 8.2 Run `openspec init` to verify CLAUDE.md generation
- [ ] 8.3 Validate instruction clarity with example scenarios
- [ ] 8.4 Ensure no critical information was lost in streamlining
- [ ] 8.5 Verify decision trees eliminate ambiguity
- [ ] 8.6 Test scenario formatting examples work correctly
- [ ] 8.7 Verify troubleshooting steps resolve common errors