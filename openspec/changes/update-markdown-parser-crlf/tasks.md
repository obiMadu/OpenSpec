## 1. Guard the regression
- [ ] 1.1 Add a unit test that feeds a CRLF change document into `MarkdownParser.parseChange` and asserts `Why`/`What Changes` are detected.
- [ ] 1.2 Add a CLI spawn/e2e test that writes a CRLF change, runs `openspec validate`, and expects success.

## 2. Normalize parsing
- [ ] 2.1 Normalize line endings when constructing `MarkdownParser` so headers and content comparisons ignore `\r`.
- [ ] 2.2 Ensure all CLI entry points (validate, view, spec conversion) reuse the normalized parser path.

## 3. Document and verify
- [ ] 3.1 Update the `cli-validate` spec with a scenario covering CRLF line endings.
- [ ] 3.2 Run the parser and CLI test suites (`pnpm test`, relevant spawn tests) to confirm the fix.
