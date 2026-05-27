import chalk from 'chalk';
import {
	parseGraphInitArgv,
	printGraphInitHelp,
	runGraphInit,
} from '../core/dependency-scripts/lib/graph-init-core.mjs';

/**
 * Bootstrap code-review-graph (+ optional graphify) for the current git repo.
 */
export function registerGraphInitCommand(program) {
	program
		.command('graph-init')
		.description(
			'Bootstrap code-review-graph and optional graphify for the current project (Windows-safe)',
		)
		.option('--with-graphify', 'Build graphify graph, Cursor rule, and MCP')
		.option(
			'--skip-code-review-graph',
			'Skip code-review-graph (graphify/MCP only)',
		)
		.option('--alias <name>', 'Registry alias (default: repo folder name)')
		.option('--skip-husky', 'Do not add Husky hook delegates')
		.option('--skip-mcp', 'Skip graphify MCP wiring')
		.option('--quiet', 'Less console output')
		.option(
			'--platform <platform>',
			'claude | cursor (default: AKAKIT_PLATFORM or claude)',
		)
		.action(async (options) => {
			if (options.help) {
				printGraphInitHelp();
				return;
			}

			const argv = [];
			if (options.withGraphify) argv.push('--with-graphify');
			if (options.skipCodeReviewGraph) argv.push('--skip-code-review-graph');
			if (options.alias) argv.push('--alias', options.alias);
			if (options.skipHusky) argv.push('--skip-husky');
			if (options.skipMcp) argv.push('--skip-mcp');
			if (options.quiet) argv.push('--quiet');
			if (options.platform) argv.push('--platform', options.platform);

			try {
				const opts = parseGraphInitArgv(argv);
				const code = await runGraphInit(opts);
				if (code !== 0) process.exit(code);
			} catch (err) {
				if (err.code === 2) {
					console.error(chalk.red(err.message));
					printGraphInitHelp();
					process.exit(2);
				}
				throw err;
			}
		});
}
