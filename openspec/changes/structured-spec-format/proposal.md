## Why

OpenSpec specifications lack a consistent structure that makes sections visually identifiable and programmatically parseable across different specs.

## What Changes

- Establish mandatory `### Requirement: [Name]` heading format for all requirement sections
- Require SHALL statements immediately after requirement headings
- Introduce `#### Scenario: [Description]` format for scenario documentation
- Mandate bold keywords (**WHEN**, **THEN**, **AND**) for scenario steps
- Define clear bullet-point structure for scenario conditions and outcomes

## Impact

- Affected specs: openspec-format (new capability)
- Affected code: None initially - this is a documentation standard