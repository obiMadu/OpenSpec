## Why

Currently, users must validate changes and specs individually by specifying each ID. This creates friction when:
- Teams want to validate all changes/specs before a release
- Developers need to ensure consistency across multiple related changes  
- Users run validation or show commands without arguments and receive errors instead of helpful guidance

## What Changes

- Add new `validate-all` command for bulk validation of all changes and specs
- Enhance `change validate` and `change show` to support interactive selection when no arguments provided
- Enhance `spec validate` and `spec show` to support interactive selection when no arguments provided  
- Maintain backward compatibility - all existing commands with arguments work unchanged

## Impact

- New specs to create: cli-validate-all
- Specs to enhance: cli-change, cli-spec
- Affected code: src/cli/index.ts, src/commands/spec.ts, src/commands/change.ts, src/commands/validate-all.ts (new)