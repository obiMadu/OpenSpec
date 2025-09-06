import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Ensures the project is built before running tests that spawn CLI subprocesses.
 * This is needed because tests that use execSync to run the CLI binary
 * require the dist directory to exist.
 */
export function ensureBuild(): void {
  const projectRoot = process.cwd();
  const distPath = path.join(projectRoot, 'dist');
  const cliPath = path.join(distPath, 'cli', 'index.js');
  
  // Check if dist/cli/index.js exists
  if (!existsSync(cliPath)) {
    console.log('Building project for tests that spawn CLI subprocesses...');
    try {
      // Run build without silent flag to see any errors
      execSync('pnpm run build', { 
        stdio: 'inherit',
        cwd: projectRoot 
      });
      
      // Verify the build succeeded
      if (!existsSync(cliPath)) {
        throw new Error(`Build completed but ${cliPath} still does not exist`);
      }
    } catch (error) {
      console.error('Failed to build project:', error);
      throw new Error('Project build failed. Tests that spawn CLI subprocesses will fail.');
    }
  }
}