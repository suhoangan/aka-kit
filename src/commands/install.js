import chalk from 'chalk';
import { resolvePresets } from '../core/preset-resolver.js';
import { install, installTemplatesOnly } from '../core/installer.js';
import {
	SUPPORTED_PLATFORMS,
	DEFAULT_PLATFORM,
	resolveTargetDirs,
} from '../core/platforms.js';
import { pickPlatformInteractive } from '../core/cli-prompts.js';
import { PRESET_FLAGS, flagKeyToPresetName } from '../core/preset-flags.js';

/**
 * Register the install command with Commander program.
 * Shared/common preset installs to user config dir (global scope).
 * Project presets install to CWD config dir (project scope).
 */
export function registerInstallCommand(program) {
	const cmd = program
		.command('install')
		.description('Install preset(s) — skills, hooks, rules, templates')
		.option('--nextjs', 'Install Next.js preset')
		.option('--hubspot', 'Install HubSpot preset')
		.option('--php', 'Install PHP preset')
		.option('--global', 'Install global user-scope preset')
		.option(
			'--turbo-strapi-nextjs',
			'Install Turborepo + Strapi v5 + Next.js 15 preset',
		)
		.option(
			'--fullstack-nextjs',
			'Install full-stack Next.js preset (nextjs + shared full-stack skills)',
		)
		.option(
			'--node-backend',
			'Install Node.js backend preset (API + MCP builder)',
		)
		.option(
			'--platform <platform>',
			'Install target: claude | cursor | codex | both | all (prompts if omitted in TTY)',
		)
		.option(
			'--dry-run',
			'Preview what would be installed without making changes',
		)
		.option('--docs', 'Show setup docs for install command')
		.action(async (options) => {
			if (options.docs) {
				printDocs();
				return;
			}

			// Resolve platform: explicit flag wins; TTY prompts; non-TTY falls back to default
			let platform;
			if (options.platform) {
				platform = options.platform.toLowerCase();
			} else if (process.stdin.isTTY) {
				platform = await pickPlatformInteractive();
			} else {
				platform = DEFAULT_PLATFORM;
			}

			if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(chalk.red(`Invalid platform: ${platform}`));
				console.error(
					chalk.dim(`Use one of: ${SUPPORTED_PLATFORMS.join(', ')}`),
				);
				process.exit(1);
			}

			const selected = PRESET_FLAGS.filter((flag) => options[flag]);

			if (selected.length === 0) {
				console.log(chalk.yellow('No preset selected. Use a flag to choose:'));
				console.log('');
				console.log('  aka-kit install --nextjs');
				console.log('  aka-kit install --fullstack-nextjs');
				console.log('  aka-kit install --node-backend');
				console.log('  aka-kit install --hubspot');
				console.log('  aka-kit install --php');
				console.log('  aka-kit install --global');
				console.log('');
				console.log(
					chalk.dim('Run "aka-kit presets" to see all available presets.'),
				);
				process.exit(1);
			}

			const dryRun = options.dryRun || false;
			const targetSet = resolveTargetDirs(platform);

			// Step 1: Always install shared/common to all selected global targets
			for (const target of targetSet.globalDirs) {
				console.log(
					chalk.bold(
						`\nInstalling ${chalk.cyan('shared')} preset → ${chalk.dim(target.dir)} ${chalk.dim(`[${target.platform}]`)}`,
					),
				);
				try {
					const sharedChain = resolvePresets('shared');
					await install(target.dir, sharedChain, {
						dryRun,
						platform: target.platform,
					});
					console.log(chalk.green('✓ shared preset installed (global)'));
				} catch (err) {
					console.error(
						chalk.red(`✗ Failed to install shared: ${err.message}`),
					);
					process.exit(1);
				}
			}

			// Step 2: Install selected presets
			for (const flagKey of selected) {
				// Resolve preset directory name (handle camelCase → kebab-case for hyphenated flags)
				const presetName = flagKeyToPresetName(flagKey);
				const targets =
					flagKey === 'global' ? targetSet.globalDirs : targetSet.projectDirs;
				for (const target of targets) {
					console.log(
						chalk.bold(
							`\nInstalling ${chalk.cyan(presetName)} preset → ${chalk.dim(target.dir)} ${chalk.dim(`[${target.platform}]`)}`,
						),
					);

					try {
						const chain = resolvePresets(presetName);
						// For project presets, copy shared templates (e.g. CLAUDE.md / AGENTS.md) to project root
						if (flagKey !== 'global') {
							const sharedPreset = chain.find((p) => p.name === 'shared');
							if (sharedPreset)
								installTemplatesOnly(target.dir, sharedPreset, {
									dryRun,
									platform: target.platform,
								});
						}
						// Filter out the shared preset from chain — already installed globally
						const filtered = chain.filter((p) => p.name !== 'shared');
						if (filtered.length === 0) continue;

						await install(target.dir, filtered, {
							dryRun,
							platform: target.platform,
						});
						console.log(chalk.green(`✓ ${presetName} preset installed`));
					} catch (err) {
						console.error(
							chalk.red(`✗ Failed to install ${presetName}: ${err.message}`),
						);
						process.exit(1);
					}
				}
			}
		});

	return cmd;
}

function printDocs() {
	console.log(chalk.bold('\naka-kit setup docs\n'));
	console.log('Install one or more presets:');
	console.log('  aka-kit install --nextjs');
	console.log('  aka-kit install --fullstack-nextjs');
	console.log('  aka-kit install --node-backend');
	console.log('  aka-kit install --php');
	console.log('  aka-kit install --hubspot');
	console.log('  aka-kit install --global');
	console.log('');
	console.log('Choose a platform:');
	console.log(
		'  aka-kit install --nextjs --platform claude   # Claude Code (default)',
	);
	console.log('  aka-kit install --nextjs --platform cursor   # Cursor');
	console.log(
		'  aka-kit install --nextjs --platform codex    # OpenAI Codex CLI',
	);
	console.log(
		'  aka-kit install --nextjs --platform both     # Claude + Cursor',
	);
	console.log(
		'  aka-kit install --nextjs --platform all      # Claude + Cursor + Codex',
	);
	console.log('');
	console.log('Preview without writing:');
	console.log('  aka-kit install --nextjs --dry-run');
	console.log('');
	console.log(chalk.dim('Target locations:'));
	console.log(chalk.dim('  - Claude:  ~/.claude   and  <cwd>/.claude'));
	console.log(chalk.dim('  - Cursor:  ~/.cursor   and  <cwd>/.cursor'));
	console.log(chalk.dim('  - Codex:   ~/.codex    and  <cwd>/.codex'));
	console.log('');
	console.log(chalk.dim('Codex specifics:'));
	console.log(
		chalk.dim(
			'  - Templates: CLAUDE.md (claude/cursor), AGENTS.md (codex), .gitignore, .env.example, docs/, .husky/post-commit',
		),
	);
	console.log(
		chalk.dim(
			'  - MCP: merged into ~/.codex/config.toml as [mcp_servers.*] tables',
		),
	);
	console.log(
		chalk.dim(
			'  - Skills/rules/hooks copy as reference (Codex has no native runtime for them)',
		),
	);
}
