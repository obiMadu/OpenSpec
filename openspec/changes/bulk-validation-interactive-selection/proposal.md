## Why

Currently, users must validate changes and specs individually by specifying each ID. This creates friction when:
- Teams want to validate all changes/specs before a release
- Developers need to ensure consistency across multiple related changes  
- Users run validation or show commands without arguments and receive errors instead of helpful guidance
- The subcommand structure requires users to know in advance whether they're validating a change or spec

## What Changes

- Add new top-level `validate` command with intuitive flags (--all, --changes, --specs)
- Add new top-level `show` command for displaying changes or specs interactively
- Enhance existing `change validate/show` and `spec validate/show` to support interactive selection (backwards compatibility)
- Interactive selection by default when no arguments provided
- Support direct item validation: `openspec validate <item>`

## Impact

- New specs to create: cli-validate, cli-show
- Specs to enhance: cli-change, cli-spec (for backwards compatibility)
- Affected code: src/cli/index.ts, src/commands/validate.ts (new), src/commands/show.ts (new), src/commands/spec.ts, src/commands/change.ts