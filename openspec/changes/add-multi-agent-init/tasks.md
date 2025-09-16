# Implementation Tasks

## 1. Extend Init Guard
- [ ] 1.1 Detect existing OpenSpec structures at the start of `openspec init` and enter an extend mode instead of failing.
- [ ] 1.2 Log that core scaffolding will be skipped while still protecting against missing write permissions.

## 2. Update AI Tool Selection
- [ ] 2.1 Present AI tool choices even in extend mode, indicating which tools are already configured.
- [ ] 2.2 Ensure disabled "coming soon" tools remain non-selectable.

## 3. Generate Additional Tool Files
- [ ] 3.1 Create configuration files for newly selected tools while leaving untouched tools unaffected apart from marker-managed sections.
- [ ] 3.2 Summarize created, refreshed, and skipped tools before exiting with the appropriate code.

## 4. Verification
- [ ] 4.1 Add tests covering rerunning `openspec init` to add another tool and the scenario where the user declines to add anything.
