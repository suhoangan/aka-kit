import chalk from 'chalk';
import { searchCatalog } from '../core/catalog.js';
import { presetToCliFlag } from '../core/preset-flags.js';

export function registerSearchCommand(program) {
	program
		.command('search <term>')
		.description('Search bundled skills, rules, and presets')
		.option('--json', 'Machine-readable output')
		.action((term, options) => {
			if (!term?.trim()) {
				console.error(chalk.red('Provide a search term.'));
				process.exit(1);
			}

			const hits = searchCatalog(term.trim());

			if (options.json) {
				console.log(JSON.stringify(hits, null, 2));
				return;
			}

			console.log(chalk.bold(`\nSearch: "${term}"\n`));
			let any = false;

			if (hits.presets.length) {
				any = true;
				console.log(chalk.cyan('Presets'));
				for (const p of hits.presets) {
					console.log(
						`  ${presetToCliFlag(p.name).padEnd(22)} ${p.description}`,
					);
				}
			}

			if (hits.skills.length) {
				any = true;
				console.log(chalk.cyan('\nSkills'));
				for (const s of hits.skills) {
					console.log(`  ${s.slug.padEnd(28)} [${s.preset}] ${s.description}`);
				}
			}

			if (hits.rules.length) {
				any = true;
				console.log(chalk.cyan('\nRules'));
				for (const r of hits.rules) {
					console.log(`  ${r.file.padEnd(28)} [${r.preset}]`);
				}
			}

			if (!any) {
				console.log(chalk.dim('  No matches.'));
			}

			console.log('');
		});
}
