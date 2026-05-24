import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { whichBin } from './doctor-checks/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_SCRIPTS_DIR = path.join(__dirname, 'dependency-scripts');

/** Git Bash paths — checked before generic PATH (WindowsApps bash.exe is a broken stub). */
const GIT_BASH_PATHS = [
	'C:\\Program Files\\Git\\bin\\bash.exe',
	'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
	'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
];

const UNIX_BASH_PATHS = [
	'/bin/bash',
	'/usr/local/bin/bash',
	'/opt/homebrew/bin/bash',
];

function isWindowsAppsStub(bashPath) {
	return /\\WindowsApps\\/i.test(bashPath);
}

/**
 * Resolve bash for legacy .sh fallback. Prefers Git Bash on Windows;
 * rejects WindowsApps stub that fails script execution.
 */
export function resolveBashExecutable() {
	if (process.platform === 'win32') {
		for (const candidate of GIT_BASH_PATHS) {
			if (fs.existsSync(candidate)) return candidate;
		}
		const fromPath = whichBin('bash.exe') || whichBin('bash');
		if (fromPath && !isWindowsAppsStub(fromPath)) return fromPath;
		return null;
	}

	const fromPath = whichBin('bash');
	if (fromPath) return fromPath;
	for (const candidate of UNIX_BASH_PATHS) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

/** Map preset script path (e.g. scripts/install-rtk.sh) → bundled Node runner. */
function resolveNodeScript(scriptPath) {
	const base = path.basename(scriptPath).replace(/\.(sh|mjs|js|cjs)$/i, '');
	const mjs = path.join(NODE_SCRIPTS_DIR, `${base}.mjs`);
	return fs.existsSync(mjs) ? mjs : null;
}

let bashSkipNoticeShown = false;

function logBashUnavailable(scriptPath) {
	if (!bashSkipNoticeShown) {
		bashSkipNoticeShown = true;
		console.log(
			chalk.yellow(
				'  ⚠ bash not available — using Node dependency scripts where possible',
			),
		);
	}
	console.log(chalk.dim(`  Skipped: ${scriptPath} (no bash, no Node port)`));
}

function runNodeScript(nodeScript) {
	execFileSync(process.execPath, [nodeScript], {
		stdio: 'inherit',
		cwd: process.cwd(),
		timeout: 180_000,
		env: process.env,
	});
}

function runBashScript(bash, scriptPath) {
	execFileSync(bash, [scriptPath], {
		stdio: 'inherit',
		cwd: process.cwd(),
		timeout: 180_000,
		env: process.env,
	});
}

/**
 * Execute dependency install scripts listed in a preset.
 * Prefers cross-platform Node runners in src/core/dependency-scripts/.
 * Falls back to bash .sh on Unix when no Node port exists.
 */
export async function runDependencyScripts(presetDir, scripts) {
	const bash = resolveBashExecutable();
	const isWin = process.platform === 'win32';

	for (const scriptPath of scripts) {
		const nodeScript = resolveNodeScript(scriptPath);

		if (nodeScript) {
			console.log(chalk.dim(`  Running: ${path.basename(nodeScript)}`));
			try {
				runNodeScript(nodeScript);
				console.log(chalk.green(`  ✓ ${scriptPath} completed`));
			} catch (err) {
				const detail =
					err.stderr?.toString?.().trim() || err.message || String(err);
				console.error(chalk.yellow(`  ⚠ ${scriptPath} failed: ${detail}`));
				console.error(chalk.dim('  Continuing installation...'));
			}
			continue;
		}

		const fullPath = path.resolve(presetDir, scriptPath);
		if (!fs.existsSync(fullPath)) {
			console.log(
				chalk.yellow(`  ⚠ Dependency script not found: ${scriptPath}`),
			);
			continue;
		}

		if (isWin && !bash) {
			logBashUnavailable(scriptPath);
			continue;
		}

		if (!bash) {
			logBashUnavailable(scriptPath);
			continue;
		}

		console.log(chalk.dim(`  Running: ${scriptPath}`));
		try {
			runBashScript(bash, fullPath);
			console.log(chalk.green(`  ✓ ${scriptPath} completed`));
		} catch (err) {
			const detail =
				err.stderr?.toString?.().trim() || err.message || String(err);
			console.error(chalk.yellow(`  ⚠ ${scriptPath} failed: ${detail}`));
			console.error(chalk.dim('  Continuing installation...'));
		}
	}
}
