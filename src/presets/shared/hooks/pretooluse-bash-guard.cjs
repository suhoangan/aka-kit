#!/usr/bin/env node
/**
 * PreToolUse — block destructive Bash unless prefixed with APPROVED:
 * Exit 2 = blocked, 0 = allow. Fail-open on parse errors.
 */
const { readStdinJson, failOpen } = require('./lib/hook-utils.cjs');

const DESTRUCTIVE = [
	{
		re: /\brm\s+-rf\s+(\/|\~|\$HOME\b|\$\{HOME\}|\*|\.\.)/i,
		label: 'rm -rf on root/home/glob',
	},
	{
		re: /\brm\s+-[^\s]*f[^\s]*\s+(\/|\~|\$HOME\b)/i,
		label: 'rm -f on root/home',
	},
	{ re: /\bmkfs\b/i, label: 'mkfs' },
	{ re: /\bdd\s+.*\bof=/i, label: 'dd overwrite' },
	{ re: />\s*\/dev\/sd[a-z]/i, label: 'write raw disk' },
	{
		re: /\bgit\s+push\s+[^\n]*(--force|-f)\b[^\n]*(main|master)\b/i,
		label: 'force push to main/master',
	},
	{
		re: /\bgit\s+push\s+[^\n]*(main|master)\b[^\n]*(--force|-f)\b/i,
		label: 'force push to main/master',
	},
	{ re: /\bchmod\s+-R\s+777\s+\//i, label: 'chmod 777 on /' },
	{ re: /\bdrop\s+database\b/i, label: 'drop database' },
	{ re: /\btruncate\s+table\b/i, label: 'truncate table' },
];

failOpen(() => {
	const payload = readStdinJson();
	if (!payload || payload.tool_name !== 'Bash') process.exit(0);

	const command = payload.tool_input?.command;
	if (!command || typeof command !== 'string') process.exit(0);

	if (/^\s*APPROVED:/i.test(command)) {
		console.error(
			'\x1b[32m✓\x1b[0m Bash guard: user-approved destructive command',
		);
		process.exit(0);
	}

	for (const rule of DESTRUCTIVE) {
		if (rule.re.test(command)) {
			console.error(`
\x1b[33mBASH GUARD\x1b[0m: Blocked potentially destructive command (${rule.label})

  \x1b[33mCommand:\x1b[0m ${command.trim()}

  Ask the user to confirm, then retry with prefix:
  \x1b[32mAPPROVED: ${command.trim()}\x1b[0m
`);
			process.exit(2);
		}
	}

	process.exit(0);
});
