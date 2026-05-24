import chalk from 'chalk';
import { addSkill } from '../core/skill-manager.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
} from '../core/platforms.js';

export function registerAddCommand(program) {
	program
		.command('add <skill>')
		.description('Add a single bundled skill to an existing install')
		.option(
			'--platform <platform>',
			'Target: claude (default) | cursor | codex | both | all',
			DEFAULT_PLATFORM,
		)
		.option('--global', 'Install to user config dir instead of project')
		.option('--dry-run', 'Preview without writing')
		.action(async (skill, options) => {
			const platform = (options.platform || DEFAULT_PLATFORM).toLowerCase();
			if (!SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(chalk.red(`Invalid --platform: ${options.platform}`));
				process.exit(1);
			}

			const targetSet = resolveTargetDirs(platform);
			const targets = options.global
				? targetSet.globalDirs
				: targetSet.projectDirs;

			console.log(chalk.bold(`\nAdding skill: ${chalk.cyan(skill)}\n`));

			for (const target of targets) {
				console.log(chalk.dim(`  → ${target.dir} [${target.platform}]`));
				try {
					await addSkill(target.dir, skill, {
						dryRun: options.dryRun,
						platform: target.platform,
					});
				} catch (err) {
					console.error(chalk.red(`✗ ${err.message}`));
					process.exit(1);
				}
			}

			console.log(chalk.green('\n✓ skill added\n'));
		});
}
