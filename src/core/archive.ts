import { promises as fs } from 'fs';
import path from 'path';
import { select, confirm } from '@inquirer/prompts';
import { FileSystemUtils } from '../utils/file-system.js';
import { Validator } from './validation/validator.js';
import chalk from 'chalk';
import {
  extractRequirementsSection,
  parseDeltaSpec,
  normalizeRequirementName,
  type RequirementBlock,
} from './parsers/requirement-blocks.js';

interface SpecUpdate {
  source: string;
  target: string;
  exists: boolean;
}

export class ArchiveCommand {
  async execute(changeName?: string, options: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean } = {}): Promise<void> {
    const targetPath = '.';
    const changesDir = path.join(targetPath, 'openspec', 'changes');
    const archiveDir = path.join(changesDir, 'archive');
    const mainSpecsDir = path.join(targetPath, 'openspec', 'specs');

    // Check if changes directory exists
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error("No OpenSpec changes directory found. Run 'openspec init' first.");
    }

    // Get change name interactively if not provided
    if (!changeName) {
      const selectedChange = await this.selectChange(changesDir);
      if (!selectedChange) {
        console.log('No change selected. Aborting.');
        return;
      }
      changeName = selectedChange;
    }

    const changeDir = path.join(changesDir, changeName);

    // Verify change exists
    try {
      const stat = await fs.stat(changeDir);
      if (!stat.isDirectory()) {
        throw new Error(`Change '${changeName}' not found.`);
      }
    } catch {
      throw new Error(`Change '${changeName}' not found.`);
    }

    // Validate specs and change before archiving
    if (!options.noValidate) {
      const validator = new Validator();
      let hasValidationErrors = false;

      // Validate change.md file
      const changeFile = path.join(changeDir, 'change.md');
      try {
        await fs.access(changeFile);
        const changeReport = await validator.validateChange(changeFile);
        
        if (!changeReport.valid) {
          hasValidationErrors = true;
          console.log(chalk.red(`\nValidation errors in change.md:`));
          for (const issue of changeReport.issues) {
            if (issue.level === 'ERROR') {
              console.log(chalk.red(`  ✗ ${issue.message}`));
            } else if (issue.level === 'WARNING') {
              console.log(chalk.yellow(`  ⚠ ${issue.message}`));
            }
          }
        }
      } catch {
        // Change file doesn't exist, skip validation
      }

      // Validate spec files
      const changeSpecsDir = path.join(changeDir, 'specs');
      try {
        const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
            
            try {
              await fs.access(specFile);
              const report = await validator.validateSpec(specFile);
              
              if (!report.valid) {
                hasValidationErrors = true;
                console.log(chalk.red(`\nValidation errors in ${entry.name}/spec.md:`));
                for (const issue of report.issues) {
                  if (issue.level === 'ERROR') {
                    console.log(chalk.red(`  ✗ ${issue.message}`));
                  } else if (issue.level === 'WARNING') {
                    console.log(chalk.yellow(`  ⚠ ${issue.message}`));
                  }
                }
              }
            } catch {
              // Spec file doesn't exist, skip validation
            }
          }
        }
      } catch {
        // No specs directory, skip validation
      }

      if (hasValidationErrors) {
        console.log(chalk.red('\nValidation failed. Please fix the errors before archiving.'));
        console.log(chalk.yellow('To skip validation (not recommended), use --no-validate flag.'));
        return;
      }
    } else {
      // Log warning when validation is skipped
      const timestamp = new Date().toISOString();
      
      if (!options.yes) {
        const proceed = await confirm({
          message: chalk.yellow('⚠️  WARNING: Skipping validation may archive invalid specs. Continue? (y/N)'),
          default: false
        });
        if (!proceed) {
          console.log('Archive cancelled.');
          return;
        }
      } else {
        console.log(chalk.yellow(`\n⚠️  WARNING: Skipping validation may archive invalid specs.`));
      }
      
      console.log(chalk.yellow(`[${timestamp}] Validation skipped for change: ${changeName}`));
      console.log(chalk.yellow(`Affected files: ${changeDir}`));
    }

    // Check for incomplete tasks
    const tasksPath = path.join(changeDir, 'tasks.md');
    const incompleteTasks = await this.checkIncompleteTasks(tasksPath);
    
    if (incompleteTasks > 0) {
      if (!options.yes) {
        const proceed = await confirm({
          message: `Warning: ${incompleteTasks} incomplete task(s) found. Continue?`,
          default: false
        });
        if (!proceed) {
          console.log('Archive cancelled.');
          return;
        }
      } else {
        console.log(`Warning: ${incompleteTasks} incomplete task(s) found. Continuing due to --yes flag.`);
      }
    }

    // Handle spec updates unless skipSpecs flag is set
    if (options.skipSpecs) {
      console.log('Skipping spec updates (--skip-specs flag provided).');
    } else {
      // Find specs to update
      const specUpdates = await this.findSpecUpdates(changeDir, mainSpecsDir);
      
      if (specUpdates.length > 0) {
        console.log('\nSpecs to update:');
        for (const update of specUpdates) {
          const status = update.exists ? 'update' : 'create';
          const capability = path.basename(path.dirname(update.target));
          console.log(`  ${capability}: ${status}`);
        }

        let shouldUpdateSpecs = true;
        if (!options.yes) {
          shouldUpdateSpecs = await confirm({
            message: 'Proceed with spec updates?',
            default: true
          });
          if (!shouldUpdateSpecs) {
            console.log('Skipping spec updates. Proceeding with archive.');
          }
        }

        if (shouldUpdateSpecs) {
          // Prepare all updates first (validation pass, no writes)
          const prepared: Array<{ update: SpecUpdate; rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> = [];
          try {
            for (const update of specUpdates) {
              const built = await this.buildUpdatedSpec(update);
              prepared.push({ update, rebuilt: built.rebuilt, counts: built.counts });
            }
          } catch (err: any) {
            console.log(String(err.message || err));
            console.log('Aborted. No files were changed.');
            return;
          }

          // All validations passed; write files and display counts
          let totals = { added: 0, modified: 0, removed: 0, renamed: 0 };
          for (const p of prepared) {
            await this.writeUpdatedSpec(p.update, p.rebuilt, p.counts);
            totals.added += p.counts.added;
            totals.modified += p.counts.modified;
            totals.removed += p.counts.removed;
            totals.renamed += p.counts.renamed;
          }
          console.log(
            `Totals: + ${totals.added}, ~ ${totals.modified}, - ${totals.removed}, → ${totals.renamed}`
          );
          console.log('Specs updated successfully.');
        }
      }
    }

    // Create archive directory with date prefix
    const archiveName = `${this.getArchiveDate()}-${changeName}`;
    const archivePath = path.join(archiveDir, archiveName);

    // Check if archive already exists
    try {
      await fs.access(archivePath);
      throw new Error(`Archive '${archiveName}' already exists.`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create archive directory if needed
    await fs.mkdir(archiveDir, { recursive: true });

    // Move change to archive
    await fs.rename(changeDir, archivePath);
    
    console.log(`Change '${changeName}' archived as '${archiveName}'.`);
  }

  private async selectChange(changesDir: string): Promise<string | null> {
    // Get all directories in changes (excluding archive)
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changeDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name)
      .sort();

    if (changeDirs.length === 0) {
      console.log('No active changes found.');
      return null;
    }

    console.log('Available changes:');
    const choices = changeDirs.map(name => ({
      name: name,
      value: name
    }));

    try {
      const answer = await select({
        message: 'Select a change to archive',
        choices
      });
      return answer;
    } catch (error) {
      // User cancelled (Ctrl+C)
      return null;
    }
  }

  private async checkIncompleteTasks(tasksPath: string): Promise<number> {
    try {
      const content = await fs.readFile(tasksPath, 'utf-8');
      const lines = content.split('\n');
      let incompleteTasks = 0;
      
      for (const line of lines) {
        if (line.includes('- [ ]')) {
          incompleteTasks++;
        }
      }
      
      return incompleteTasks;
    } catch {
      // No tasks.md file or error reading it
      return 0;
    }
  }

  private async findSpecUpdates(changeDir: string, mainSpecsDir: string): Promise<SpecUpdate[]> {
    const updates: SpecUpdate[] = [];
    const changeSpecsDir = path.join(changeDir, 'specs');

    try {
      const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
          const targetFile = path.join(mainSpecsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specFile);
            
            // Check if target exists
            let exists = false;
            try {
              await fs.access(targetFile);
              exists = true;
            } catch {
              exists = false;
            }

            updates.push({
              source: specFile,
              target: targetFile,
              exists
            });
          } catch {
            // Source spec doesn't exist, skip
          }
        }
      }
    } catch {
      // No specs directory in change
    }

    return updates;
  }

  private async buildUpdatedSpec(update: SpecUpdate): Promise<{ rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> {
    // Read change spec content (delta-format expected)
    const changeContent = await fs.readFile(update.source, 'utf-8');

    // Parse deltas from the change spec file
    const plan = parseDeltaSpec(changeContent);
    const hasAnyDelta = (plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length) > 0;
    if (!hasAnyDelta) {
      throw new Error(
        `Delta parsing found no operations for ${path.basename(path.dirname(update.source))}. ` +
        `Provide ADDED/MODIFIED/REMOVED/RENAMED sections in change spec.`
      );
    }

    // Load or create base target content
    let targetContent: string;
    try {
      targetContent = await fs.readFile(update.target, 'utf-8');
    } catch {
      // Target spec does not exist; only ADDED operations are permitted
      if (plan.modified.length > 0 || plan.removed.length > 0 || plan.renamed.length > 0) {
        throw new Error(
          `${path.basename(path.dirname(update.target))}: target spec does not exist; ` +
          `only ADDED requirements are allowed for new specs.`
        );
      }
      targetContent = this.buildSpecSkeleton(path.basename(path.dirname(update.target)));
    }

    // Extract requirements section and build name->block map
    const parts = extractRequirementsSection(targetContent);
    const nameToBlock = new Map<string, RequirementBlock>();
    for (const block of parts.bodyBlocks) {
      nameToBlock.set(normalizeRequirementName(block.name), block);
    }

    // Apply operations in order: RENAMED → REMOVED → MODIFIED → ADDED
    // RENAMED
    for (const r of plan.renamed) {
      const from = normalizeRequirementName(r.from);
      const to = normalizeRequirementName(r.to);
      if (!nameToBlock.has(from)) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} RENAMED failed for header "### Requirement: ${r.from}" — source not found`
        );
      }
      if (nameToBlock.has(to)) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} RENAMED failed for header "### Requirement: ${r.to}" — target already exists`
        );
      }
      const block = nameToBlock.get(from)!;
      const newHeader = `### Requirement: ${to}`;
      const rawLines = block.raw.split('\n');
      rawLines[0] = newHeader;
      const renamedBlock: RequirementBlock = {
        headerLine: newHeader,
        name: to,
        raw: rawLines.join('\n'),
      };
      nameToBlock.delete(from);
      nameToBlock.set(to, renamedBlock);
    }

    // REMOVED
    for (const name of plan.removed) {
      const key = normalizeRequirementName(name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} REMOVED failed for header "### Requirement: ${name}" — not found`
        );
      }
      nameToBlock.delete(key);
    }

    // MODIFIED
    for (const mod of plan.modified) {
      const key = normalizeRequirementName(mod.name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} MODIFIED failed for header "### Requirement: ${mod.name}" — not found`
        );
      }
      // Replace block with provided raw (ensure header line matches key)
      const modHeaderMatch = mod.raw.split('\n')[0].match(/^###\s*Requirement:\s*(.+)\s*$/);
      if (!modHeaderMatch || normalizeRequirementName(modHeaderMatch[1]) !== key) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} MODIFIED failed for header "### Requirement: ${mod.name}" — header mismatch in content`
        );
      }
      nameToBlock.set(key, mod);
    }

    // ADDED
    for (const add of plan.added) {
      const key = normalizeRequirementName(add.name);
      if (nameToBlock.has(key)) {
        throw new Error(
          `${path.basename(path.dirname(update.target))} ADDED failed for header "### Requirement: ${add.name}" — already exists`
        );
      }
      nameToBlock.set(key, add);
    }

    // Validate duplicates
    if (nameToBlock.size !== new Set(Array.from(nameToBlock.keys())).size) {
      throw new Error(
        `${path.basename(path.dirname(update.target))} validation failed — duplicate requirement headers detected`
      );
    }

    // Recompose requirements section preserving original ordering where possible
    const keptOrder: RequirementBlock[] = [];
    const seen = new Set<string>();
    for (const block of parts.bodyBlocks) {
      const key = normalizeRequirementName(block.name);
      const replacement = nameToBlock.get(key);
      if (replacement) {
        keptOrder.push(replacement);
        seen.add(key);
      }
    }
    // Append any newly added that were not in original order
    for (const [key, block] of nameToBlock.entries()) {
      if (!seen.has(key)) {
        keptOrder.push(block);
      }
    }

    const reqBody = [
      parts.preamble && parts.preamble.trim() ? parts.preamble.trimEnd() : ''
    ]
      .filter(Boolean)
      .concat(keptOrder.map(b => b.raw))
      .join('\n\n')
      .trimEnd();

    const rebuilt = [
      parts.before.trimEnd(),
      parts.headerLine,
      reqBody,
      parts.after
    ]
      .filter((s, idx) => !(idx === 0 && s === ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    return {
      rebuilt,
      counts: {
        added: plan.added.length,
        modified: plan.modified.length,
        removed: plan.removed.length,
        renamed: plan.renamed.length,
      }
    };
  }

  private async writeUpdatedSpec(update: SpecUpdate, rebuilt: string, counts: { added: number; modified: number; removed: number; renamed: number }): Promise<void> {
    // Create target directory if needed
    const targetDir = path.dirname(update.target);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(update.target, rebuilt);

    const specName = path.basename(path.dirname(update.target));
    console.log(`Applying changes to openspec/specs/${specName}/spec.md:`);
    if (counts.added) console.log(`  + ${counts.added} added`);
    if (counts.modified) console.log(`  ~ ${counts.modified} modified`);
    if (counts.removed) console.log(`  - ${counts.removed} removed`);
    if (counts.renamed) console.log(`  → ${counts.renamed} renamed`);
  }

  private buildSpecSkeleton(specFolderName: string): string {
    const titleBase = specFolderName;
    return `# ${titleBase} Specification\n\n## Purpose\nTBD — created by archiving change. Update Purpose after archive.\n\n## Requirements\n`;
  }

  private getArchiveDate(): string {
    // Returns date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  }
}