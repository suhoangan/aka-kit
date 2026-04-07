import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { readManifest } from '../core/manifest.js';

/**
 * Register the list command.
 * Shows currently installed presets from .ak-kit.json manifests.
 */
export function registerListCommand(program) {
  program
    .command('list')
    .description('Show installed presets')
    .action(async () => {
      const projectDir = path.join(process.cwd(), '.claude');
      const globalDir = path.join(os.homedir(), '.claude');

      console.log(chalk.bold('\nInstalled presets:\n'));

      // Check project-level manifest
      const projectManifest = readManifest(projectDir);
      if (projectManifest && Object.keys(projectManifest.presets).length > 0) {
        console.log(chalk.cyan('  Project') + chalk.dim(` (${projectDir})`));
        for (const [name, info] of Object.entries(projectManifest.presets)) {
          console.log(`    ${chalk.green('●')} ${name} ${chalk.dim(`v${info.version}`)}`);
        }
      } else {
        console.log(chalk.dim('  No project presets installed.'));
      }

      console.log('');

      // Check global manifest
      const globalManifest = readManifest(globalDir);
      if (globalManifest && globalManifest.presets?.global) {
        console.log(chalk.cyan('  Global') + chalk.dim(` (${globalDir})`));
        const info = globalManifest.presets.global;
        console.log(`    ${chalk.green('●')} global ${chalk.dim(`v${info.version}`)}`);
      } else {
        console.log(chalk.dim('  No global preset installed.'));
      }

      console.log('');
    });
}
