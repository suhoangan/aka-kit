import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { whichBin } from '../../doctor-checks/utils.js';

/** Resolve a CLI name on Windows (npm.cmd, npx.cmd, etc.) and Unix. */
export function resolveCmd(name) {
	if (process.platform === 'win32') {
		return whichBin(name) || whichBin(`${name}.cmd`) || whichBin(`${name}.exe`);
	}
	return whichBin(name);
}

export function commandExists(name) {
	return Boolean(resolveCmd(name));
}

export function run(bin, args, opts = {}) {
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
	const resolved = resolveCmd(bin) || bin;
	return spawnSync(resolved, args, {
		stdio: 'inherit',
		timeout: opts.timeout ?? 180_000,
		cwd: opts.cwd ?? process.cwd(),
		env: { ...process.env, ...opts.env },
	});
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
