# Implementation Tasks for Init Command

## 1. Core Infrastructure
- [ ] 1.1 Create src/utils/file-system.ts with directory/file creation utilities
- [ ] 1.2 Create src/core/templates/index.ts for template management
- [ ] 1.3 Create src/core/init.ts with main initialization logic
- [ ] 1.4 Create src/core/config.ts for configuration management

## 2. Template Files
- [ ] 2.1 Create src/core/templates/readme-template.ts with OpenSpec README content
- [ ] 2.2 Create src/core/templates/project-template.ts with customizable project.md
- [ ] 2.3 Create src/core/templates/claude-template.ts for CLAUDE.md content with markers

## 3. AI Tool Configurators
- [ ] 3.1 Create src/core/configurators/base.ts with ToolConfigurator interface
- [ ] 3.2 Create src/core/configurators/claude.ts for Claude Code configuration
- [ ] 3.3 Create src/core/configurators/registry.ts for tool registration
- [ ] 3.4 Implement marker-based file updates for existing configurations

## 4. Init Command Implementation
- [ ] 4.1 Add init command to src/cli/index.ts using Commander
- [ ] 4.2 Add --dir flag for custom directory naming
- [ ] 4.3 Implement AI tool selection with multi-select prompt (Claude Code available, others "coming soon")
- [ ] 4.4 Add validation for existing OpenSpec directories with helpful error message
- [ ] 4.5 Implement directory structure creation
- [ ] 4.6 Implement file generation with templates and markers

## 5. User Experience
- [ ] 5.1 Add colorful console output for better UX
- [ ] 5.2 Implement progress indicators (Step 1/3, 2/3, 3/3)
- [ ] 5.3 Add success message with actionable next steps (edit project.md, create first change)
- [ ] 5.4 Add error handling with helpful messages
- [ ] 5.5 Add directory name validation (alphanumeric, hyphens, underscores)

## 6. Testing and Documentation
- [ ] 6.1 Add unit tests for file system utilities
- [ ] 6.2 Add unit tests for marker-based file updates
- [ ] 6.3 Add integration tests for init command
- [ ] 6.4 Update package.json with proper bin configuration
- [ ] 6.5 Test the built CLI command end-to-end