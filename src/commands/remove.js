import chalk from 'chalk';
import { removeSkill } from '../core/skill-manager.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
} from '../core/platforms.js';

export function registerRemoveCommand(program) {
	program
		.command('remove <skill>')
		.description('Remove a single skill from an existing install')
		.option(
			'--platform <platform>',
			'Target: claude (default) | cursor | codex | both | all',
			DEFAULT_PLATFORM,
		)
		.option('--global', 'Remove from user config dir instead of project')
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

			console.log(chalk.bold(`\nRemoving skill: ${chalk.cyan(skill)}\n`));

			for (const target of targets) {
				console.log(chalk.dim(`  → ${target.dir} [${target.platform}]`));
				try {
					await removeSkill(target.dir, skill, { dryRun: options.dryRun });
				} catch (err) {
					console.error(chalk.yellow(`  ~ ${err.message}`));
				}
			}

			console.log(chalk.green('\n✓ done\n'));
		});
}
