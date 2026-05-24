#!/usr/bin/env node
/**
 * PostToolUse — run project linter on edited JS/TS files when package.json defines lint.
 * Non-blocking (exit 0); prints lint output for the agent.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
	readStdinJson,
	failOpen,
	projectRoot,
	editedFilePath,
	readPackageJson,
} = require('./lib/hook-utils.cjs');

const LINT_EXT = new Set([
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'.mjs',
	'.cjs',
	'.vue',
	'.svelte',
]);

function lintCommand(root, pkg, file) {
	if (pkg.scripts?.lint) {
		return {
			cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
			args: ['run', 'lint', '--', file],
		};
	}
	const hasEslint =
		pkg.devDependencies?.eslint ||
		pkg.dependencies?.eslint ||
		fs.existsSync(path.join(root, 'eslint.config.js')) ||
		fs.existsSync(path.join(root, 'eslint.config.mjs')) ||
		fs.existsSync(path.join(root, '.eslintrc.json'));
	if (hasEslint) {
		return {
			cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
			args: ['eslint', '--max-warnings', '0', file],
		};
	}
	return null;
}

failOpen(() => {
	const payload = readStdinJson();
	if (!payload) process.exit(0);
	const tool = payload.tool_name || '';
	if (!['Edit', 'Write', 'MultiEdit'].includes(tool)) process.exit(0);

	const file = editedFilePath(payload);
	if (!file || !LINT_EXT.has(path.extname(file))) process.exit(0);

	const root = projectRoot(payload);
	const rel = path.isAbsolute(file) ? path.relative(root, file) : file;
	if (rel.startsWith('..')) process.exit(0);

	const pkg = readPackageJson(root);
	if (!pkg) process.exit(0);

	const spec = lintCommand(root, pkg, rel);
	if (!spec) process.exit(0);

	const result = spawnSync(spec.cmd, spec.args, {
		cwd: root,
		encoding: 'utf8',
		timeout: 45000,
		shell: process.platform === 'win32',
	});

	if (result.status === 0) {
		console.log(`\x1b[32m✓\x1b[0m lint passed: ${rel}`);
		process.exit(0);
	}

	const out = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
	console.log(
		`\x1b[33mLint issues\x1b[0m in ${rel} — fix before committing:\n${out.slice(0, 4000)}`,
	);
	process.exit(0);
});
