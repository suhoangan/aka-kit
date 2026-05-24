import chalk from 'chalk';
import { readManifest } from '../core/manifest.js';
import {
	SUPPORTED_PLATFORMS,
	resolveTargetDirs,
	formatScopeContext,
} from '../core/platforms.js';

/**
 * Register the list command.
 * Shows currently installed presets from `.aka-kit.json` manifests.
 * Defaults to `all` platforms so users see every install at a glance.
 */
export function registerListCommand(program) {
	program
		.command('list')
		.description('Show installed presets')
		.option(
			'--platform <platform>',
			'Show installs for: claude | cursor | codex | both | all (default)',
			'all',
		)
		.action(async (options) => {
			const platform = (options.platform || 'all').toLowerCase();
			if (!SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(chalk.red(`Invalid --platform value: ${options.platform}`));
				console.error(chalk.dim(`Use one of: ${SUPPORTED_PLATFORMS.join(', ')}`));
				process.exit(1);
			}

			const targetSet = resolveTargetDirs(platform);

			console.log(chalk.bold('\nInstalled presets:\n'));

			let anyFound = false;

			for (const target of targetSet.projectDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest || Object.keys(manifest.presets).length === 0) continue;
				anyFound = true;
				console.log(
					chalk.cyan(`  Project [${target.platform}]`) +
						chalk.dim(` (${formatScopeContext(target.scope, target.platform)})`),
				);
				for (const [name, info] of Object.entries(manifest.presets)) {
					console.log(
						`    ${chalk.green('●')} ${name} ${chalk.dim(`v${info.version}`)}`,
					);
				}
				console.log('');
			}

			for (const target of targetSet.globalDirs) {
				const manifest = readManifest(target.dir);
				if (!manifest || Object.keys(manifest.presets).length === 0) continue;
				anyFound = true;
				console.log(
					chalk.cyan(`  User-scope [${target.platform}]`) +
						chalk.dim(` (${formatScopeContext(target.scope, target.platform)})`),
				);
				for (const [name, info] of Object.entries(manifest.presets)) {
					console.log(
						`    ${chalk.green('●')} ${name} ${chalk.dim(`v${info.version}`)}`,
					);
				}
				console.log('');
			}

			if (!anyFound) {
				console.log(chalk.dim('  No presets installed for the selected platform(s).'));
				console.log('');
			}
		});
}
