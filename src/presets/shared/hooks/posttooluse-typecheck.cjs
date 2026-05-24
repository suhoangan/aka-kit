#!/usr/bin/env node
/**
 * PostToolUse — debounced tsc --noEmit after .ts/.tsx edits when tsconfig.json exists.
 * Non-blocking (exit 0).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
	readStdinJson,
	failOpen,
	projectRoot,
	editedFilePath,
} = require('./lib/hook-utils.cjs');

const TS_EXT = new Set(['.ts', '.tsx']);
const DEBOUNCE_MS = 15000;

function findTsconfig(root, file) {
	const candidates = [];
	let dir = path.isAbsolute(file)
		? path.dirname(file)
		: path.join(root, path.dirname(file));
	while (dir.startsWith(root)) {
		candidates.push(path.join(dir, 'tsconfig.json'));
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	candidates.push(path.join(root, 'tsconfig.json'));
	for (const c of candidates) {
		if (fs.existsSync(c)) return c;
	}
	return null;
}

failOpen(() => {
	const payload = readStdinJson();
	if (!payload) process.exit(0);
	const tool = payload.tool_name || '';
	if (!['Edit', 'Write', 'MultiEdit'].includes(tool)) process.exit(0);

	const file = editedFilePath(payload);
	if (!file || !TS_EXT.has(path.extname(file))) process.exit(0);

	const root = projectRoot(payload);
	const tsconfig = findTsconfig(root, file);
	if (!tsconfig) process.exit(0);

	const stampFile = path.join(path.dirname(__dirname), '.last-typecheck');
	if (fs.existsSync(stampFile)) {
		const age = Date.now() - fs.statSync(stampFile).mtimeMs;
		if (age < DEBOUNCE_MS) process.exit(0);
	}

	const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const result = spawnSync(
		npx,
		['tsc', '--noEmit', '--pretty', 'false', '-p', tsconfig],
		{
			cwd: root,
			encoding: 'utf8',
			timeout: 60000,
			shell: process.platform === 'win32',
		},
	);

	try {
		fs.writeFileSync(stampFile, String(Date.now()));
	} catch {
		/* ignore */
	}

	if (result.status === 0) {
		console.log('\x1b[32m✓\x1b[0m Typecheck passed');
		process.exit(0);
	}

	const out = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
	console.log(
		`\x1b[33mTypecheck errors\x1b[0m — fix before committing:\n${out.slice(0, 4000)}`,
	);
	process.exit(0);
});
