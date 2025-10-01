## 1. CLI scaffolding command
- [ ] 1.1 Register an `openspec scaffold` command in the CLI entrypoint with `change-id` argument validation.
- [ ] 1.2 Implement generator logic that creates the change directory structure plus default `proposal.md`, `tasks.md`, and delta spec skeletons without overwriting existing populated files.

## 2. Templates and documentation
- [ ] 2.1 Surface copy/paste templates and scaffold usage in the top-level quick reference for `openspec/AGENTS.md`.
- [ ] 2.2 Refresh other CLI docs (`docs/`, README) to mention the scaffold workflow and link to instructions.

## 3. Test coverage
- [ ] 3.1 Add unit tests covering name validation, file generation, and idempotent reruns.
- [ ] 3.2 Add integration coverage ensuring generated files pass `openspec validate --strict` without manual edits.
