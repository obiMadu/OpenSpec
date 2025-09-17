# README Update Proposal

## Objectives
- Keep the hero section (logo, badge row, screenshot, tagline) but tighten the narrative that follows.
- Reduce duplication so the reader hears the value proposition once, then moves directly into workflows.
- Highlight tool support and slash-command ergonomics where readers begin setup.
- Simplify the onboarding flow so new users see install → init → first change in one connected path.

## Proposed Outline
1. **Hero & Tagline** – existing art and badges.
2. **Core Value Proposition** – one short section: the problem, the OpenSpec answer, and key outcomes (alignment, determinism, shared specs).
3. **How It Works** – rework the sequence description: propose deltas → review with AI → implement → archive/update specs. Replace or simplify the current diagram to match the narrative.
4. **Getting Started** – merge prerequisites, install, and init into one flow:
   - Supported tools table split into *Primary (full slash commands)* vs *Secondary (AGENTS.md only)*.
   - Install command (`pnpm dlx` or `pnpm add -g`, plus npm fallback) immediately followed by `openspec init`.
   - Condensed bullet list for slash commands instead of the full prompt transcript.
   - Quickstart callout for creating the first change and tracking progress, with `openspec view` instead of `openspec validate` in the main walkthrough.
5. **Workflow Reference** – short "Common Commands" list (list/archive/view/validate) after Getting Started.
6. **Comparison & Adoption** – keep "How OpenSpec Compares" and "Team Adoption" but tighten copy where it repeats alignment talking points.
7. **Updating OpenSpec** – keep instructions but ensure npm version / command reflects the latest release (v0.2.x) and mention `pnpm update` path.
8. **Deep Dive Example** – retain the example file tree and spec snippets for readers who want more depth.

## Content Changes
- Confirm the npm badge and install snippets reference the current published version; update the command to `pnpm add -g @fission-ai/openspec@latest` (with npm alternative noted).
- Move the supported tools list (`README.md:30-39`) into the Getting Started section and reformat into a two-tier table.
- Collapse "OpenSpec" intro copy and `## Why OpenSpec?` (`README.md:41-57`) into a single value-proposition section, then drop the redundant "## Why OpenSpec Works" block (`README.md:253-263`).
- Trim the verbose CLI selection transcript in "Initialize OpenSpec" (`README.md:96-117`) to a succinct bullet list of options and slash commands.
- In "Track Your Work" (`README.md:142-154`), swap the validate example for `openspec view <change>`; keep validation guidance in the command reference instead.
- Refresh the command snippets so they follow the same formatting and focus on the essential workflow steps.

## Next Steps
- Align on the outline, then update `README.md` accordingly.
- Regenerate any diagrams or screenshots if the workflow visual changes.
- Run a final proofread to ensure the new flow stays under ~1,000 words and reads linearly for new contributors.
