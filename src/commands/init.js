import chalk from 'chalk';
import prompts from 'prompts';
import {
	reinstallProjectPreset,
	reinstallUserScopePresets,
} from '../core/preset-install.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
	formatScopeContext,
} from '../core/platforms.js';
import {
	pickPlatformInteractive,
	pickProjectPresetInteractive,
	confirmGlobalPreset,
	confirmDryRun,
} from '../core/cli-prompts.js';
import { setupRequiredEnv, applyEnvToMcpDirs } from '../core/env-setup.js';

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
		.option('--skip-env', 'Skip API key / env setup prompts')
		.option('--force-interactive', 'Force env UI even when not a TTY')
		.action(async (options) => {
			console.log(chalk.bold('\naka-kit init\n'));

			const platform = options.platform
				? options.platform.toLowerCase()
				: await pickPlatformInteractive();
			const preset = await pickProjectPresetInteractive();
			const includeGlobal = await confirmGlobalPreset(platform);
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

			const envResult = await setupRequiredEnv({
				platform,
				cwd: process.cwd(),
				dryRun,
				skipEnv: options.skipEnv || false,
				forceInteractive: options.forceInteractive || false,
			});

			for (const target of targetSet.globalDirs) {
				console.log(
					chalk.bold(
						`\nInstalling ${chalk.cyan('shared')} → ${chalk.dim(formatScopeContext(target.scope, target.platform))}`,
					),
				);
				await reinstallUserScopePresets(target.dir, ['shared'], {
					dryRun,
					platform: target.platform,
					scope: target.scope,
				});
			}

			for (const name of flags) {
				const isGlobal = name === 'global';
				const targets = isGlobal ? targetSet.globalDirs : targetSet.projectDirs;
				for (const target of targets) {
					console.log(
						chalk.bold(
							`\nInstalling ${chalk.cyan(name)} → ${chalk.dim(formatScopeContext(target.scope, target.platform))}`,
						),
					);
					if (isGlobal) {
						await reinstallUserScopePresets(target.dir, ['global'], {
							dryRun,
							platform: target.platform,
							scope: target.scope,
						});
					} else {
						await reinstallProjectPreset(target.dir, name, {
							dryRun,
							platform: target.platform,
							scope: target.scope,
						});
					}
				}
			}

			if (envResult.values && !dryRun) {
				applyEnvToMcpDirs(process.cwd(), platform, envResult.values);
			}

			console.log(chalk.green('\n✓ init complete'));
			console.log(chalk.dim('Run: aka-kit doctor --quick\n'));
		});
}
