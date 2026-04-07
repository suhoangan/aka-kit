import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { readManifest } from '../core/manifest.js';
import { resolvePresets } from '../core/preset-resolver.js';
import { install } from '../core/installer.js';

/**
 * Register the update command.
 * Re-installs all currently installed presets with latest version.
 */
export function registerUpdateCommand(program) {
  program
    .command('update')
    .description('Re-install presets with latest version')
    .option('--dry-run', 'Preview what would be updated')
    .action(async (options) => {
      const projectDir = path.join(process.cwd(), '.claude');
      const globalDir = path.join(os.homedir(), '.claude');
      let updated = 0;

      // Update project presets
      const projectManifest = readManifest(projectDir);
      if (projectManifest) {
        for (const presetName of Object.keys(projectManifest.presets)) {
          if (presetName === 'global') continue;
          console.log(chalk.bold(`\nUpdating ${chalk.cyan(presetName)} preset...`));
          try {
            const preset = resolvePresets(presetName);
            await install(projectDir, preset, { dryRun: options.dryRun || false });
            console.log(chalk.green(`✓ ${presetName} updated`));
            updated++;
          } catch (err) {
            console.error(chalk.red(`✗ Failed to update ${presetName}: ${err.message}`));
          }
        }
      }

      // Update global preset
      const globalManifest = readManifest(globalDir);
      if (globalManifest?.presets?.global) {
        console.log(chalk.bold(`\nUpdating ${chalk.cyan('global')} preset...`));
        try {
          const preset = resolvePresets('global');
          await install(globalDir, preset, { dryRun: options.dryRun || false });
          console.log(chalk.green('✓ global updated'));
          updated++;
        } catch (err) {
          console.error(chalk.red(`✗ Failed to update global: ${err.message}`));
        }
      }

      if (updated === 0) {
        console.log(chalk.dim('\nNo presets installed. Run "ak-kit install --<preset>" first.'));
      } else {
        console.log(chalk.green(`\n✓ Updated ${updated} preset(s)`));
      }
    });
}
