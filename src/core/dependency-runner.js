import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Execute dependency install scripts listed in a preset.
 * Scripts are relative to the preset directory.
 * Errors are caught and logged — installation continues.
 */
export async function runDependencyScripts(presetDir, scripts) {
  for (const scriptPath of scripts) {
    const fullPath = path.join(presetDir, scriptPath);

    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`  ⚠ Dependency script not found: ${scriptPath}`));
      continue;
    }

    console.log(chalk.dim(`  Running: ${scriptPath}`));
    try {
      execSync(`bash "${fullPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 60000, // 60s max per script
      });
      console.log(chalk.green(`  ✓ ${scriptPath} completed`));
    } catch (err) {
      console.error(chalk.yellow(`  ⚠ ${scriptPath} failed: ${err.message}`));
      console.error(chalk.dim('  Continuing installation...'));
    }
  }
}
