import chalk from 'chalk';

/** True when stdin/stdout support interactive prompts. */
export function isInteractiveEnv(opts = {}) {
	if (opts.skipEnv) return false;
	if (opts.forceInteractive) return true;
	if (process.env.AKAKIT_FORCE_INTERACTIVE === '1') return true;
	return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export function maskSecret(value) {
	if (!value) return '(empty)';
	if (value.length <= 8) return '••••••••';
	return `${value.slice(0, 4)}${'•'.repeat(Math.min(12, value.length - 6))}${value.slice(-2)}`;
}

/** Print a visible checklist before input fields. */
export function printEnvBanner(platform, requirements, existing) {
	console.log('');
	console.log(
		chalk.bold.cyan('  ╭─────────────────────────────────────────────╮'),
	);
	console.log(
		chalk.bold.cyan('  │  API keys & environment                     │'),
	);
	console.log(
		chalk.bold.cyan('  ╰─────────────────────────────────────────────╯'),
	);
	console.log(chalk.dim(`  Platform: ${platform}`));
	console.log('');

	for (const req of requirements) {
		const cur = existing[req.key]?.trim();
		const badge = cur
			? chalk.green('● set')
			: req.required
				? chalk.yellow('○ required')
				: chalk.dim('○ optional');
		console.log(
			`  ${badge}  ${chalk.bold(req.label)} ${chalk.dim(`(${req.key})`)}`,
		);
		console.log(chalk.dim(`         ${req.description}`));
		if (req.url) console.log(chalk.blue(`         ${req.url}`));
		if (cur) console.log(chalk.dim(`         current: ${maskSecret(cur)}`));
		console.log('');
	}

	console.log(
		chalk.dim('  Type your keys below (shown as •••). Enter = keep existing.'),
	);
	console.log(chalk.dim('  Ctrl+C to cancel.\n'));
}
