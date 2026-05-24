import chalk from 'chalk';
import {
	reinstallProjectPreset,
	reinstallUserScopePresets,
} from '../core/preset-install.js';
import { readManifest } from '../core/manifest.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
	formatScopeContext,
} from '../core/platforms.js';

/**
 * Register the update command.
 * Re-installs all currently installed presets with latest version.
 */
export function registerUpdateCommand(program) {
	program
		.command('update')
		.description('Re-install presets with latest version')
		.option(
			'--platform <platform>',
			'Update target: claude (default) | cursor | codex | both | all',
			DEFAULT_PLATFORM,
		)
		.option('--dry-run', 'Preview what would be updated')
		.action(async (options) => {
			const platform = (options.platform || DEFAULT_PLATFORM).toLowerCase();
			if (!SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(
					chalk.red(`Invalid --platform value: ${options.platform}`),
				);
				console.error(
					chalk.dim(`Use one of: ${SUPPORTED_PLATFORMS.join(', ')}`),
				);
				process.exit(1);
			}

			const targetSet = resolveTargetDirs(platform);
			const dryRun = options.dryRun || false;
			let updated = 0;

			// Update project-scope presets (never re-install shared into project)
			for (const target of targetSet.projectDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest) continue;
				for (const presetName of Object.keys(manifest.presets)) {
					if (presetName === 'global' || presetName === 'shared') continue;
					console.log(
						chalk.bold(
							`\nUpdating ${chalk.cyan(presetName)} → ${chalk.dim(formatScopeContext(target.scope, target.platform))}`,
						),
					);
					try {
						await reinstallProjectPreset(target.dir, presetName, {
							dryRun,
							platform: target.platform,
							scope: target.scope,
						});
						console.log(chalk.green(`✓ ${presetName} updated`));
						updated++;
					} catch (err) {
						console.error(
							chalk.red(`✗ Failed to update ${presetName}: ${err.message}`),
						);
					}
				}
			}

			// Update user-scope shared + global presets
			for (const target of targetSet.globalDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest) continue;
				const userPresets = ['shared', 'global'].filter(
					(n) => manifest.presets?.[n],
				);
				if (userPresets.length === 0) continue;

				for (const presetName of userPresets) {
					console.log(
						chalk.bold(
							`\nUpdating ${chalk.cyan(presetName)} → ${chalk.dim(formatScopeContext(target.scope, target.platform))}`,
						),
					);
					try {
						await reinstallUserScopePresets(target.dir, [presetName], {
							dryRun,
							platform: target.platform,
							scope: target.scope,
						});
						console.log(chalk.green(`✓ ${presetName} updated`));
						updated++;
					} catch (err) {
						console.error(
							chalk.red(`✗ Failed to update ${presetName}: ${err.message}`),
						);
					}
				}
			}

			if (updated === 0) {
				console.log(
					chalk.dim(
						'\nNo presets installed for the selected platform(s). Run "aka-kit install --<preset>" first.',
					),
				);
			} else {
				console.log(chalk.green(`\n✓ Updated ${updated} preset(s)`));
			}
		});
}
