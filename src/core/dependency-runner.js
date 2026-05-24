import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';
import chalk from 'chalk';
import { whichBin } from './doctor-checks/utils.js';

/** Common bash locations when PATH is stripped (GUI apps, npm hooks, IDE terminals). */
const BASH_FALLBACKS =
	process.platform === 'win32'
		? [
				'C:\\Program Files\\Git\\bin\\bash.exe',
				'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
			]
		: ['/bin/bash', '/usr/local/bin/bash', '/opt/homebrew/bin/bash'];

/**
 * Resolve a bash executable. PATH lookup first, then known install paths.
 * Returns null when bash is unavailable (e.g. Windows without Git Bash).
 */
export function resolveBashExecutable() {
	const name = process.platform === 'win32' ? 'bash.exe' : 'bash';
	const fromPath = whichBin(name);
	if (fromPath) return fromPath;

	for (const candidate of BASH_FALLBACKS) {
		try {
			if (fs.existsSync(candidate)) return candidate;
		} catch {
			// ignore EACCES
		}
	}
	return null;
}

let bashSkipNoticeShown = false;

function logBashUnavailable() {
	if (bashSkipNoticeShown) return;
	bashSkipNoticeShown = true;
	console.log(
		chalk.yellow(
			'  ⚠ bash not found — skipping dependency install scripts (.sh)',
		),
	);
	console.log(
		chalk.dim(
			'  Install bash (macOS/Linux: usually preinstalled) or Git Bash / WSL on Windows.',
		),
	);
}

/**
 * Execute dependency install scripts listed in a preset.
 * Scripts are relative to the preset directory.
 * Errors are caught and logged — installation continues.
 */
export async function runDependencyScripts(presetDir, scripts) {
	const bash = resolveBashExecutable();
	if (!bash) {
		logBashUnavailable();
		for (const scriptPath of scripts) {
			console.log(chalk.dim(`  Skipped: ${scriptPath} (no bash)`));
		}
		return;
	}

	for (const scriptPath of scripts) {
		const fullPath = path.resolve(presetDir, scriptPath);

		if (!fs.existsSync(fullPath)) {
			console.log(
				chalk.yellow(`  ⚠ Dependency script not found: ${scriptPath}`),
			);
			continue;
		}

		console.log(chalk.dim(`  Running: ${scriptPath}`));
		try {
			execFileSync(bash, [fullPath], {
				stdio: 'inherit',
				cwd: process.cwd(),
				timeout: 180000, // 3min — network installers (brew/curl/cargo)
				env: process.env,
			});
			console.log(chalk.green(`  ✓ ${scriptPath} completed`));
		} catch (err) {
			const detail =
				err.stderr?.toString?.().trim() || err.message || String(err);
			console.error(chalk.yellow(`  ⚠ ${scriptPath} failed: ${detail}`));
			console.error(chalk.dim('  Continuing installation...'));
		}
	}
}
