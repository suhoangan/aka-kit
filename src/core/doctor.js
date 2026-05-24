import chalk from 'chalk';
import { checkNode, checkBinaries } from './doctor-checks/runtime.js';
import { checkMcpConfigs } from './doctor-checks/mcp.js';
import {
	checkSkills,
	checkPermissions,
	checkEnvVars,
} from './doctor-checks/installed.js';
import { reachable, result } from './doctor-checks/utils.js';

const MARKETPLACES = [
	{ name: 'github.com (claude-mem)', url: 'https://github.com/thedotmack/claude-mem' },
	{ name: 'github.com (qmd)', url: 'https://github.com/tobi/qmd' },
];

/**
 * Optional connectivity check — skipped on --quick.
 */
async function checkMarketplaces() {
	const results = [];
	for (const m of MARKETPLACES) {
		const ok = await reachable(m.url, { timeout: 3000 });
		results.push(
			result(
				'Connectivity',
				m.name,
				ok ? 'ok' : 'warn',
				ok ? 'reachable' : 'unreachable',
				ok ? undefined : 'Plugin install may fail without network',
			),
		);
	}
	return results;
}

const ICONS = {
	ok: chalk.green('✓'),
	warn: chalk.yellow('⚠'),
	error: chalk.red('✗'),
	skip: chalk.dim('-'),
};

function renderResults(results) {
	let current = '';
	for (const r of results) {
		if (r.category !== current) {
			console.log(chalk.bold(`\n${r.category}`));
			current = r.category;
		}
		const tail = r.detail ? chalk.dim(` — ${r.detail}`) : '';
		console.log(`  ${ICONS[r.status]} ${r.name}${tail}`);
		if (r.fix && (r.status === 'warn' || r.status === 'error')) {
			console.log(chalk.dim(`      fix: ${r.fix}`));
		}
	}
}

function summarize(results) {
	const counts = { ok: 0, warn: 0, error: 0, skip: 0 };
	for (const r of results) counts[r.status]++;
	console.log('');
	if (counts.error === 0 && counts.warn === 0) {
		console.log(chalk.green.bold(`✓ All ${counts.ok} checks passed (${counts.skip} skipped)`));
	} else {
		console.log(
			chalk.bold(
				`Summary: ${chalk.green(counts.ok + ' ok')}, ` +
					`${chalk.yellow(counts.warn + ' warn')}, ` +
					`${chalk.red(counts.error + ' error')}, ` +
					chalk.dim(counts.skip + ' skip'),
			),
		);
	}
	console.log('');
	return counts;
}

/**
 * Main entrypoint. Returns { results, exitCode } so the command layer can
 * choose how to surface (text, JSON, etc.).
 */
export async function runDoctor(options = {}) {
	const { quick = false, json = false, platform = process.platform } = options;
	const results = [];

	if (!json) {
		console.log(
			chalk.bold('\naka-kit doctor') +
				chalk.dim(`  (platform: ${platform}, node: ${process.versions.node})`),
		);
	}

	results.push(...checkNode());
	results.push(...checkBinaries({ quick }));
	results.push(...checkMcpConfigs());
	results.push(...checkSkills());
	results.push(...checkPermissions());
	results.push(...checkEnvVars());

	if (!quick) {
		results.push(...(await checkMarketplaces()));
	} else if (!json) {
		console.log(chalk.dim('\n(skipping connectivity checks — --quick)'));
	}

	if (!json) {
		renderResults(results);
		summarize(results);
	}

	const errors = results.filter((r) => r.status === 'error').length;
	const warns = results.filter((r) => r.status === 'warn').length;
	const exitCode = errors > 0 ? 2 : warns > 0 ? 1 : 0;

	return { results, exitCode, errors, warns };
}
