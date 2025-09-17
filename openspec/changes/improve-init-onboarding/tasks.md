## 1. Planning & Spec Updates
- [ ] 1.1 Confirm overlap with `add-multi-agent-init` and coordinate extend-mode flow
- [ ] 1.2 Update `openspec/specs/cli-init/spec.md` to capture multi-select onboarding requirements

## 2. Implementation
- [ ] 2.1 Add multi-select support to the `openspec init` prompt, including indicators for existing tool configs
- [ ] 2.2 Enhance success messaging to summarize created/refreshed assets per tool
- [ ] 2.3 Ensure shared instruction template is applied consistently (CLAUDE.md, AGENTS.md, slash commands)

## 3. Quality
- [ ] 3.1 Expand unit tests for init/update flows covering multi-select and summaries
- [ ] 3.2 Perform `openspec init` smoke test in a temp directory (document output)
