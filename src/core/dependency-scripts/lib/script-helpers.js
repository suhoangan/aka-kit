import path from 'node:path';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { whichBin } from '../../doctor-checks/utils.js';
import { resolveBash } from './resolve-bash.js';

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

/** Resolve a CLI name on Windows (npm.cmd, npx.cmd, etc.) and Unix. */
export function resolveCmd(name) {
	if (isWin) {
		return whichBin(name) || whichBin(`${name}.cmd`) || whichBin(`${name}.exe`);
	}
	return whichBin(name);
}

export function commandExists(name) {
	return Boolean(resolveCmd(name));
}

/** Append common user tool paths (uv, pipx, bun, cargo, Python) to process.env.PATH. */
export function augmentToolPath() {
	const home = isWin ? process.env.USERPROFILE : process.env.HOME;
	if (!home) return;
	const extra = [
		path.join(home, '.local', 'bin'),
		path.join(home, '.cargo', 'bin'),
		path.join(home, '.bun', 'bin'),
		path.join(home, 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts'),
		path.join(home, 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts'),
		path.join(home, 'AppData', 'Local', 'Microsoft', 'WindowsApps'),
	];
	if (isWin) {
		const pyRoot = path.join(home, 'AppData', 'Local', 'Programs', 'Python');
		if (fs.existsSync(pyRoot)) {
			for (const dir of fs.readdirSync(pyRoot)) {
				extra.push(path.join(pyRoot, dir));
				extra.push(path.join(pyRoot, dir, 'Scripts'));
			}
		}
	}
	const parts = (process.env.PATH || '').split(path.delimiter);
	for (const dir of extra) {
		if (fs.existsSync(dir) && !parts.includes(dir)) parts.unshift(dir);
	}
	process.env.PATH = parts.join(path.delimiter);
}

export function resolvePython() {
	augmentToolPath();
	for (const name of isWin
		? ['py', 'python', 'python3']
		: ['python3', 'python']) {
		if (commandExists(name)) return name;
	}
	return null;
}

/** Absolute path to Python for MCP configs (Windows-safe). */
export function resolvePythonBin() {
	const name = resolvePython();
	if (!name) return null;
	return resolveCmd(name) || name;
}

export function run(bin, args, opts = {}) {
	augmentToolPath();
	const resolved = resolveCmd(bin) || bin;
	return spawnSync(resolved, args, {
		encoding: opts.encoding ?? 'utf8',
		stdio: opts.stdio ?? ['ignore', 'pipe', 'pipe'],
		timeout: opts.timeout ?? 180_000,
		cwd: opts.cwd ?? process.cwd(),
		env: { ...process.env, ...opts.env },
	});
}

export function runOk(bin, args, opts = {}) {
	return run(bin, args, opts).status === 0;
}

export function runInherit(bin, args, opts = {}) {
	augmentToolPath();
	const resolved = resolveCmd(bin) || bin;
	return spawnSync(resolved, args, {
		stdio: 'inherit',
		timeout: opts.timeout ?? 180_000,
		cwd: opts.cwd ?? process.cwd(),
		env: { ...process.env, ...opts.env },
	});
}

export function runPowerShell(script, opts = {}) {
	return runInherit(
		'powershell',
		['-ExecutionPolicy', 'Bypass', '-NoProfile', '-Command', script],
		opts,
	);
}

export function runSh(script, opts = {}) {
	const bash = resolveBash();
	if (!bash) return { status: 1 };
	return spawnSync(bash, ['-lc', script], {
		stdio: 'inherit',
		timeout: opts.timeout ?? 180_000,
		cwd: opts.cwd ?? process.cwd(),
		env: process.env,
	});
}

/** Run npx with package@version (cross-platform npx.cmd on Windows). */
export function runNpx(packageSpec, args = [], opts = {}) {
	return runInherit('npx', ['-y', packageSpec, ...args], opts);
}

export function runNpxOk(packageSpec, args = [], opts = {}) {
	return runNpx(packageSpec, args, opts).status === 0;
}

export function firstLine(text) {
	return (text || '').split('\n')[0].trim();
}

export function gitRepoRoot(cwd = process.cwd()) {
	const res = run('git', ['rev-parse', '--show-toplevel'], { cwd });
	if (res.status !== 0) return null;
	return res.stdout.trim();
}

export function appendGitignoreLine(gitignorePath, line) {
	fs.ensureFileSync(gitignorePath);
	const content = fs.readFileSync(gitignorePath, 'utf8');
	const lines = content.split(/\r?\n/);
	if (lines.some((l) => l === line)) return;
	const prefix = content.length > 0 && !content.endsWith('\n') ? '\n' : '';
	fs.appendFileSync(gitignorePath, `${prefix}${line}\n`);
}

export function createLogger(tag) {
	return {
		log: (...args) => console.log(`[aka-kit:${tag}]`, ...args),
		warn: (...args) => console.warn(`[aka-kit:${tag}]`, ...args),
	};
}
