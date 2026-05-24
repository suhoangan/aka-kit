import chalk from 'chalk';
import { uninstall } from '../core/installer.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
	formatScopeContext,
} from '../core/platforms.js';

const PRESET_FLAGS = [
	'nextjs',
	'hubspot',
	'php',
	'global',
	'shared',
	'turboStrapiNextjs',
	'fullstackNextjs',
	'nodeBackend',
];

const PRESET_NAME_MAP = {
	turboStrapiNextjs: 'turbo-strapi-nextjs',
	fullstackNextjs: 'fullstack-nextjs',
	nodeBackend: 'node-backend',
};

const USER_SCOPE_PRESETS = new Set(['global', 'shared']);

/**
 * Register the uninstall command.
 * Removes artifacts installed by a preset using the `.aka-kit.json` manifest.
 */
export function registerUninstallCommand(program) {
	program
		.command('uninstall')
		.description('Remove installed preset artifacts')
		.option('--nextjs', 'Uninstall Next.js preset')
		.option('--hubspot', 'Uninstall HubSpot preset')
		.option('--php', 'Uninstall PHP preset')
		.option(
			'--global',
			'Uninstall user-scope global preset (~/.claude, ~/.cursor, or ~/.codex)',
		)
		.option(
			'--shared',
			'Uninstall user-scope shared preset (skills/rules/MCP from aka-kit)',
		)
		.option('--turbo-strapi-nextjs', 'Uninstall turbo-strapi-nextjs preset')
		.option('--fullstack-nextjs', 'Uninstall fullstack-nextjs preset')
		.option('--node-backend', 'Uninstall node-backend preset')
		.option(
			'--platform <platform>',
			'Uninstall target: claude (default) | cursor | codex | both | all',
			DEFAULT_PLATFORM,
		)
		.option('--dry-run', 'Preview what would be removed')
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

			const selected = PRESET_FLAGS.filter((flag) => options[flag]);

			if (selected.length === 0) {
				console.log(
					chalk.yellow(
						'No preset selected. Specify which preset to uninstall.',
					),
				);
				console.log('');
				console.log('  aka-kit uninstall --nextjs --platform cursor');
				console.log('  aka-kit uninstall --shared --platform cursor');
				console.log('  aka-kit uninstall --global --platform claude');
				process.exit(1);
			}

			const targetSet = resolveTargetDirs(platform);

			for (const flagKey of selected) {
				const presetName = PRESET_NAME_MAP[flagKey] || flagKey;
				const targets = USER_SCOPE_PRESETS.has(presetName)
					? targetSet.globalDirs
					: targetSet.projectDirs;

				for (const target of targets) {
					console.log(
						chalk.bold(
							`\nUninstalling ${chalk.cyan(presetName)} from ${chalk.dim(formatScopeContext(target.scope, target.platform))}`,
						),
					);

					try {
						await uninstall(target.dir, presetName, {
							dryRun: options.dryRun || false,
						});
						console.log(chalk.green(`✓ ${presetName} preset uninstalled`));
					} catch (err) {
						console.error(
							chalk.red(`✗ Failed to uninstall ${presetName}: ${err.message}`),
						);
						process.exit(1);
					}
				}
			}
		});
}
