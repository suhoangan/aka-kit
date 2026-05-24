import chalk from 'chalk';
import { getPresetInfo } from '../core/catalog.js';

export function registerInfoCommand(program) {
	program
		.command('info [preset]')
		.description('Show what a preset installs (before installing)')
		.option('--json', 'Machine-readable output')
		.action((presetArg, options) => {
			const presetName = presetArg || 'nextjs';

			let info;
			try {
				info = getPresetInfo(presetName);
			} catch (err) {
				console.error(chalk.red(err.message));
				console.error(chalk.dim('Run "aka-kit presets" for available names.'));
				process.exit(1);
			}

			if (options.json) {
				console.log(JSON.stringify(info, null, 2));
				return;
			}

			console.log(chalk.bold(`\n${info.name} preset\n`));
			console.log(info.description);
			console.log(chalk.dim(`Install: aka-kit install ${info.cliFlag}`));
			if (info.includes.length) {
				console.log(chalk.dim(`Includes: ${info.includes.join(', ')}`));
			}
			console.log(chalk.dim(`Chain: ${info.chain.join(' → ')}`));

			const section = (title, items) => {
				if (!items.length) return;
				console.log(chalk.bold(`\n${title} (${items.length})`));
				for (const item of items) console.log(`  • ${item}`);
			};

			section('Skills', info.skills);
			section('Rules', info.rules);
			section('Hooks', info.hooks);
			section('Templates', info.templates);
			section('MCP servers', info.mcp);
			section('Plugins', info.plugins);
			section('Dependency scripts', info.dependencyScripts);

			console.log('');
		});
}
