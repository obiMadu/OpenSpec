#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('🔨 Building OpenSpec...\n');

// Clean dist directory
if (existsSync('dist')) {
  console.log('Cleaning dist directory...');
  rmSync('dist', { recursive: true, force: true });
}

// Run TypeScript compiler
console.log('Compiling TypeScript...');
try {
  execSync('tsc', { stdio: 'inherit' });
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}