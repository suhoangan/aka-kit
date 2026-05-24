import chalk from 'chalk';
import { runDoctor } from '../core/doctor.js';

/**
 * Register the doctor command — environment + install health-check.
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — warnings only
 *   2 — errors present
 */
export function registerDoctorCommand(program) {
	program
		.command('doctor')
		.description(
			'Health-check the environment, MCP config, installed skills, and permissions',
		)
		.option('--quick', 'Skip slow checks (network / marketplace reachability)')
		.option('--json', 'Emit results as JSON instead of human output')
		.action(async (options) => {
			try {
				const out = await runDoctor({
					quick: options.quick || false,
					json: options.json || false,
				});
				if (options.json) {
					console.log(JSON.stringify(out, null, 2));
				}
				process.exit(out.exitCode);
			} catch (err) {
				console.error(chalk.red(`doctor failed: ${err.message}`));
				process.exit(2);
			}
		});
}
