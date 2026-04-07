import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { uninstall } from '../core/installer.js';

const PRESET_FLAGS = ['nextjs', 'hubspot', 'php', 'global'];

/**
 * Register the uninstall command.
 * Removes artifacts installed by a preset using the .ak-kit.json manifest.
 */
export function registerUninstallCommand(program) {
  program
    .command('uninstall')
    .description('Remove installed preset artifacts')
    .option('--nextjs', 'Uninstall Next.js preset')
    .option('--hubspot', 'Uninstall HubSpot preset')
    .option('--php', 'Uninstall PHP preset')
    .option('--global', 'Uninstall global user-scope preset')
    .option('--dry-run', 'Preview what would be removed')
    .action(async (options) => {
      const selected = PRESET_FLAGS.filter(flag => options[flag]);

      if (selected.length === 0) {
        console.log(chalk.yellow('No preset selected. Specify which preset to uninstall.'));
        process.exit(1);
      }

      for (const presetName of selected) {
        const targetDir = presetName === 'global'
          ? path.join(os.homedir(), '.claude')
          : path.join(process.cwd(), '.claude');

        console.log(chalk.bold(`\nUninstalling ${chalk.cyan(presetName)} preset from ${chalk.dim(targetDir)}`));

        try {
          await uninstall(targetDir, presetName, { dryRun: options.dryRun || false });
          console.log(chalk.green(`✓ ${presetName} preset uninstalled`));
        } catch (err) {
          console.error(chalk.red(`✗ Failed to uninstall ${presetName}: ${err.message}`));
          process.exit(1);
        }
      }
    });
}
