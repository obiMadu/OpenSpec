## 1. CLI wiring
- [ ] 1.1 Add Kilo Code to the selectable AI tools in `openspec init`, including "already configured" detection and success summaries.
- [ ] 1.2 Register a `KiloCodeSlashCommandConfigurator` alongside other slash-command tools.

## 2. Workflow generation
- [ ] 2.1 Implement the configurator so it creates `.kilocode/workflows/` (if needed) and writes `openspec-{proposal,apply,archive}.md` with OpenSpec markers.
- [ ] 2.2 Reuse the shared slash-command bodies without front matter; verify resulting files stay Markdown-only with no extra metadata.

## 3. Update support
- [ ] 3.1 Ensure `openspec update` refreshes existing Kilo Code workflows while skipping ones that are absent.
- [ ] 3.2 Add regression coverage confirming marker content is replaced (not duplicated) during updates.

## 4. Documentation
- [ ] 4.1 Update README / docs to note Kilo Code workflow support and path (`.kilocode/workflows/`).
- [ ] 4.2 Mention the integration in CHANGELOG or release notes if applicable.
