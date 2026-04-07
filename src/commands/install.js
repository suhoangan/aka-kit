import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { resolvePresets } from '../core/preset-resolver.js';
import { install } from '../core/installer.js';

// All available preset flags
const PRESET_FLAGS = ['nextjs', 'hubspot', 'php', 'global'];

/**
 * Register the install command with Commander program.
 * Supports --nextjs, --hubspot, --php, --global flags.
 */
export function registerInstallCommand(program) {
  const cmd = program
    .command('install')
    .description('Install preset(s) — skills, hooks, rules, templates')
    .option('--nextjs', 'Install Next.js preset')
    .option('--hubspot', 'Install HubSpot preset')
    .option('--php', 'Install PHP preset')
    .option('--global', 'Install global user-scope preset to ~/.claude/')
    .option('--dry-run', 'Preview what would be installed without making changes')
    .action(async (options) => {
      // Collect selected presets from flags
      const selected = PRESET_FLAGS.filter(flag => options[flag]);

      if (selected.length === 0) {
        console.log(chalk.yellow('No preset selected. Use a flag to choose:'));
        console.log('');
        console.log('  ak-kit install --nextjs');
        console.log('  ak-kit install --hubspot');
        console.log('  ak-kit install --php');
        console.log('  ak-kit install --global');
        console.log('');
        console.log(chalk.dim('Run "ak-kit presets" to see all available presets.'));
        process.exit(1);
      }

      for (const presetName of selected) {
        // Global preset targets ~/.claude/, project presets target CWD/.claude/
        const targetDir = presetName === 'global'
          ? path.join(os.homedir(), '.claude')
          : path.join(process.cwd(), '.claude');

        console.log(chalk.bold(`\nInstalling ${chalk.cyan(presetName)} preset → ${chalk.dim(targetDir)}`));

        try {
          const preset = resolvePresets(presetName);
          await install(targetDir, preset, { dryRun: options.dryRun || false });
          console.log(chalk.green(`✓ ${presetName} preset installed`));
        } catch (err) {
          console.error(chalk.red(`✗ Failed to install ${presetName}: ${err.message}`));
          process.exit(1);
        }
      }
    });

  return cmd;
}
