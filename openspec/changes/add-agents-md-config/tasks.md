# Implementation Tasks

## 1. Extend Init Workflow
- [ ] 1.1 Add an "AGENTS.md standard" option to the `openspec init` tool-selection prompt, respecting the existing UI conventions.
- [ ] 1.2 Generate or refresh a root-level `AGENTS.md` file using the OpenSpec markers when that option is selected, sourcing content from the canonical template.

## 2. Enhance Update Command
- [ ] 2.1 Ensure `openspec update` writes the root `AGENTS.md` from the latest template (creating it if missing) alongside `openspec/AGENTS.md`.
- [ ] 2.2 Update success messaging and logging to reflect creation vs refresh of the AGENTS standard file.

## 3. Shared Template Handling
- [ ] 3.1 Refactor template utilities if necessary so both commands reuse the same content without duplication.
- [ ] 3.2 Add automated tests covering init/update flows for projects with and without an existing `AGENTS.md`, ensuring markers behave correctly.

## 4. Documentation
- [ ] 4.1 Update CLI specs and user-facing docs to describe AGENTS standard support.
- [ ] 4.2 Run `openspec validate add-agents-md-config --strict` and document any notable behavior changes.
