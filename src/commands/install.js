import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { resolvePresets } from '../core/preset-resolver.js';
import { install } from '../core/installer.js';

// All available preset flags
const PRESET_FLAGS = ['nextjs', 'hubspot', 'php', 'global'];

/**
 * Register the install command with Commander program.
 * Shared/common preset always installs to ~/.claude/ (global scope).
 * Project presets install to CWD/.claude/ (project scope).
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

      const globalDir = path.join(os.homedir(), '.claude');
      const projectDir = path.join(process.cwd(), '.claude');
      const dryRun = options.dryRun || false;

      // Step 1: Always install shared/common to global (~/.claude/)
      console.log(chalk.bold(`\nInstalling ${chalk.cyan('shared')} preset → ${chalk.dim(globalDir)}`));
      try {
        const sharedChain = resolvePresets('shared');
        await install(globalDir, sharedChain, { dryRun });
        console.log(chalk.green('✓ shared preset installed (global)'));
      } catch (err) {
        console.error(chalk.red(`✗ Failed to install shared: ${err.message}`));
        process.exit(1);
      }

      // Step 2: Install selected presets
      for (const presetName of selected) {
        // Global and shared go to ~/.claude/, project presets to CWD/.claude/
        const targetDir = presetName === 'global' ? globalDir : projectDir;

        console.log(chalk.bold(`\nInstalling ${chalk.cyan(presetName)} preset → ${chalk.dim(targetDir)}`));

        try {
          // Resolve without shared (already installed globally)
          const chain = resolvePresets(presetName);
          // Filter out the shared preset from chain — already installed above
          const filtered = chain.filter(p => p.name !== 'shared');
          if (filtered.length === 0) continue;

          await install(targetDir, filtered, { dryRun });
          console.log(chalk.green(`✓ ${presetName} preset installed`));
        } catch (err) {
          console.error(chalk.red(`✗ Failed to install ${presetName}: ${err.message}`));
          process.exit(1);
        }
      }
    });

  return cmd;
}
