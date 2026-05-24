import chalk from 'chalk';
import prompts from 'prompts';
import { resolvePresets } from '../core/preset-resolver.js';
import { install, installTemplatesOnly } from '../core/installer.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
} from '../core/platforms.js';
import {
	pickPlatformInteractive,
	pickPresetInteractive,
	confirmGlobalPreset,
	confirmDryRun,
} from '../core/cli-prompts.js';

/**
 * Interactive wizard — preset + platform + optional global.
 */
export function registerInitCommand(program) {
	program
		.command('init')
		.description('Interactive wizard to install aka-kit presets')
		.option(
			'--platform <platform>',
			'Skip platform prompt: claude | cursor | codex | both | all',
		)
		.option('--dry-run', 'Preview without writing')
		.action(async (options) => {
			console.log(chalk.bold('\naka-kit init\n'));

			const preset = await pickPresetInteractive();
			const platform = options.platform
				? options.platform.toLowerCase()
				: await pickPlatformInteractive();
			const includeGlobal = await confirmGlobalPreset();
			const dryRun = options.dryRun ?? (await confirmDryRun());

			if (!SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(chalk.red(`Invalid platform: ${platform}`));
				process.exit(1);
			}

			const targetSet = resolveTargetDirs(platform);
			const flags = [preset];
			if (includeGlobal) flags.push('global');

			console.log(chalk.dim(`\nPlan: ${flags.join(' + ')} → ${platform}`));
			if (dryRun) console.log(chalk.yellow('Dry-run mode\n'));

			// Reuse install flow inline
			for (const target of targetSet.globalDirs) {
				console.log(
					chalk.bold(
						`\nInstalling ${chalk.cyan('shared')} → ${chalk.dim(target.dir)}`,
					),
				);
				const sharedChain = resolvePresets('shared');
				await install(target.dir, sharedChain, {
					dryRun,
					platform: target.platform,
				});
			}

			for (const name of flags) {
				const isGlobal = name === 'global';
				const targets = isGlobal ? targetSet.globalDirs : targetSet.projectDirs;
				for (const target of targets) {
					console.log(
						chalk.bold(
							`\nInstalling ${chalk.cyan(name)} → ${chalk.dim(target.dir)}`,
						),
					);
					const chain = resolvePresets(name);
					if (!isGlobal) {
						const sharedPreset = chain.find((p) => p.name === 'shared');
						if (sharedPreset) {
							installTemplatesOnly(target.dir, sharedPreset, {
								dryRun,
								platform: target.platform,
							});
						}
					}
					const filtered = chain.filter((p) => p.name !== 'shared');
					if (filtered.length > 0) {
						await install(target.dir, filtered, {
							dryRun,
							platform: target.platform,
						});
					}
				}
			}

			console.log(chalk.green('\n✓ init complete'));
			console.log(chalk.dim('Run: aka-kit doctor --quick\n'));
		});
}
