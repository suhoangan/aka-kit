import chalk from 'chalk';
import { getAvailablePresets } from '../core/preset-resolver.js';

/**
 * Register the presets command.
 * Lists all available presets with descriptions.
 */
export function registerPresetsCommand(program) {
  program
    .command('presets')
    .description('List available presets')
    .action(() => {
      const available = getAvailablePresets();

      console.log(chalk.bold('\nAvailable presets:\n'));

      for (const preset of available) {
        const flag = preset.name === 'global' ? '--global' : `--${preset.name}`;
        console.log(`  ${chalk.cyan(flag.padEnd(14))} ${preset.description}`);
      }

      console.log(chalk.dim('\nUsage: ak-kit install <flag>'));
      console.log(chalk.dim('Example: ak-kit install --nextjs --global\n'));
    });
}
