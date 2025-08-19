## Why

Currently, users must validate changes and specs individually by specifying each ID. This creates friction when:
- Teams want to validate all changes/specs before a release
- Developers need to ensure consistency across multiple related changes  
- Users run validation or show commands without arguments and receive errors instead of helpful guidance

## What Changes

- Add new top-level CLI commands (`validate-all`, `validate`, `show`) for bulk operations and interactive selection
- Create new spec files to define these commands' behavior
- Enhance existing spec and change subcommands to support interactive selection when no arguments provided
- Maintain backward compatibility - all existing commands with arguments work unchanged

## Impact

- New specs to create: cli-validate-all, cli-validate, cli-show
- Specs to modify in other changes: cli-change, cli-spec
- Affected code: src/cli/index.ts, src/commands/spec.ts, src/commands/change.ts, src/commands/validate-all.ts (new), src/commands/validate.ts (new), src/commands/show.ts (new)