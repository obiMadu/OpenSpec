import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Run once before all tests
export async function setup() {
  const distPath = path.join(process.cwd(), 'dist', 'cli', 'index.js');
  
  if (!existsSync(distPath)) {
    console.log('Building project before tests...');
    try {
      execSync('pnpm run build', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.error('Failed to build project:', error);
      process.exit(1);
    }
  }
}