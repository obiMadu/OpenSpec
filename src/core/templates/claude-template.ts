export const claudeTemplate = `# OpenSpec Project

This document provides instructions for AI coding assistants on how to use OpenSpec conventions for spec-driven development. Follow these rules precisely when working on OpenSpec-enabled projects.

This project uses OpenSpec for spec-driven development. Specifications are the source of truth.

See @openspec/README.md for detailed conventions and guidelines.

## Complexity Management

**Default to minimal solutions:**
- Propose <100 lines of new code for features
- Prefer single-file implementations until proven insufficient
- Avoid frameworks, abstractions, and optimizations without clear justification
- Choose boring, well-understood patterns over novel approaches

**Question requests for complexity:**
- Caching? → Ask for performance data and targets
- New framework? → Suggest plain code first
- Extra layers? → Start with the thinnest viable design

**Justify complexity with data:**
- Performance metrics showing current solution is too slow
- Concrete scale requirements (e.g., >1000 users, >100MB data)
- Multiple proven use cases requiring an abstraction
`;