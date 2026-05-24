import chalk from 'chalk';
import { readManifest } from '../core/manifest.js';
import { resolvePresets } from '../core/preset-resolver.js';
import { install } from '../core/installer.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
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

			// Update project-scope presets per platform target
			for (const target of targetSet.projectDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest) continue;
				for (const presetName of Object.keys(manifest.presets)) {
					if (presetName === 'global') continue;
					console.log(
						chalk.bold(
							`\nUpdating ${chalk.cyan(presetName)} → ${chalk.dim(target.dir)} ${chalk.dim(`[${target.platform}]`)}`,
						),
					);
					try {
						const chain = resolvePresets(presetName);
						await install(target.dir, chain, {
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

			// Update global preset per platform target
			for (const target of targetSet.globalDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest?.presets?.global) continue;
				console.log(
					chalk.bold(
						`\nUpdating ${chalk.cyan('global')} → ${chalk.dim(target.dir)} ${chalk.dim(`[${target.platform}]`)}`,
					),
				);
				try {
					const chain = resolvePresets('global');
					await install(target.dir, chain, {
						dryRun,
						platform: target.platform,
						scope: target.scope,
					});
					console.log(chalk.green('✓ global updated'));
					updated++;
				} catch (err) {
					console.error(chalk.red(`✗ Failed to update global: ${err.message}`));
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
