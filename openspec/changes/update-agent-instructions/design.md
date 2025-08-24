# Design: Agent Instructions Update

## Approach

### Instruction Brevity
- Reduce total instruction length by ~50% while maintaining all critical information
- Use imperative mood ("Create proposal" vs "You should create a proposal")
- Replace verbose explanations with concise bullet points
- Consolidate related sections to avoid repetition

### Three-Stage Workflow Documentation
The workflow is now prominently featured as a core concept:
1. **Creating** - Proposal generation phase
2. **Implementing** - Code development phase  
3. **Archiving** - Post-deployment finalization phase

This structure helps agents understand the lifecycle and their role at each stage.

### CLI Documentation Updates
- Focus on the unified `openspec show` command as primary interface
- Document interactive mode capabilities
- Include all current flags and options
- Remove references to deprecated noun-first commands

### Best Practices Section
Added explicit guidance for AI agents:
- Be concise (avoid preambles)
- Be specific (use exact references)
- Start simple (minimal first implementation)
- Justify complexity (require data/metrics)

## Trade-offs

### What We're Removing
- Lengthy explanations of concepts that can be inferred
- Redundant examples that don't add clarity
- Verbose edge case documentation (moved to reference section)
- Deprecated command documentation

### What We're Keeping
- All critical workflow steps
- Complete CLI command reference
- Complexity management principles
- Directory structure visualization
- Quick reference summary

## Implementation Notes

The CLAUDE.md template is intentionally more concise than README.md since:
- It appears in every project root
- Agents can reference the full README.md for details
- It needs to load quickly in AI context windows
- Focus is on immediate actionable guidance