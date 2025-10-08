import path from "path";
import os from "os";
import { SlashCommandConfigurator } from "./base.js";
import { SlashCommandId, TemplateManager } from "../../templates/index.js";
import { FileSystemUtils } from "../../../utils/file-system.js";
import { OPENSPEC_MARKERS } from "../../config.js";

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: ".codex/prompts/openspec-proposal.md",
  apply: ".codex/prompts/openspec-apply.md",
  archive: ".codex/prompts/openspec-archive.md",
};

export class CodexSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = "codex";
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    // Codex does not use YAML front matter. Provide a heading-style
    // preface that captures the first numbered placeholder `$1`.
    const headers: Record<SlashCommandId, string> = {
      proposal: "Request: $1",
      apply: "Change ID: $1",
      archive: "Change ID: $1",
    };
    return headers[id];
  }

  private getGlobalPromptsDir(): string {
    const home = (process.env.CODEX_HOME && process.env.CODEX_HOME.trim())
      ? process.env.CODEX_HOME.trim()
      : path.join(os.homedir(), ".codex");
    return path.join(home, "prompts");
  }

  // Codex discovers prompts globally. Generate directly in the global directory
  // and wrap shared body with markers.
  async generateAll(projectPath: string, _openspecDir: string): Promise<string[]> {
    const createdOrUpdated: string[] = [];
    for (const target of this.getTargets()) {
      const body = TemplateManager.getSlashCommandBody(target.id).trim();
      const promptsDir = this.getGlobalPromptsDir();
      const filePath = path.join(promptsDir, path.basename(target.path));

      await FileSystemUtils.createDirectory(path.dirname(filePath));

      if (await FileSystemUtils.fileExists(filePath)) {
        await this.updateBody(filePath, body);
      } else {
        const header = this.getFrontmatter(target.id);
        const sections: string[] = [];
        if (header) sections.push(header.trim());
        sections.push(`${OPENSPEC_MARKERS.start}\n${body}\n${OPENSPEC_MARKERS.end}`);
        await FileSystemUtils.writeFile(filePath, sections.join("\n") + "\n");
      }

      createdOrUpdated.push(target.path);
    }
    return createdOrUpdated;
  }

  async updateExisting(projectPath: string, _openspecDir: string): Promise<string[]> {
    const updated: string[] = [];
    for (const target of this.getTargets()) {
      const promptsDir = this.getGlobalPromptsDir();
      const filePath = path.join(promptsDir, path.basename(target.path));
      if (await FileSystemUtils.fileExists(filePath)) {
        const body = TemplateManager.getSlashCommandBody(target.id).trim();
        await this.updateBody(filePath, body);
        updated.push(target.path);
      }
    }
    return updated;
  }

  // Resolve to the global prompts location for configuration detection
  resolveAbsolutePath(_projectPath: string, id: SlashCommandId): string {
    const promptsDir = this.getGlobalPromptsDir();
    const fileName = path.basename(FILE_PATHS[id]);
    return path.join(promptsDir, fileName);
  }
}
