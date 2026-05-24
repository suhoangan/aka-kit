import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { whichBin } from './doctor-checks/utils.js';
import { ensureCoreToolchain } from './dependency-scripts/lib/prereq-installers.js';
import {
	scriptBaseName,
	shouldRunDependencyScript,
} from './dependency-scripts/lib/script-policy.js';
import { formatScopeContext } from './platforms.js';

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

function runNodeScript(nodeScript, context = {}) {
	execFileSync(process.execPath, [nodeScript], {
		stdio: 'inherit',
		cwd: process.cwd(),
		timeout: 600_000, // 10min — claude-mem / MCP prefetch can be slow on first run
		env: {
			...process.env,
			AKAKIT_PLATFORM: context.platform || '',
			AKAKIT_SCOPE: context.scope || '',
			AKAKIT_TARGET_DIR: context.targetDir || '',
		},
	});
}

function runBashScript(bash, scriptPath, context = {}) {
	execFileSync(bash, [scriptPath], {
		stdio: 'inherit',
		cwd: process.cwd(),
		timeout: 180_000,
		env: {
			...process.env,
			AKAKIT_PLATFORM: context.platform || '',
			AKAKIT_SCOPE: context.scope || '',
			AKAKIT_TARGET_DIR: context.targetDir || '',
		},
	});
}

/**
 * Execute dependency install scripts listed in a preset.
 * Prefers cross-platform Node runners in src/core/dependency-scripts/.
 * Falls back to bash .sh on Unix when no Node port exists.
 */
export async function runDependencyScripts(presetDir, scripts, context = {}) {
	// Bootstrap uv/python/pip/pipx/bun/cargo before any package or script install.
	try {
		ensureCoreToolchain();
	} catch (err) {
		console.warn(
			chalk.yellow(`  ⚠ Toolchain bootstrap warning: ${err.message || err}`),
		);
	}

	const bash = resolveBashExecutable();
	const isWin = process.platform === 'win32';

	for (const scriptPath of scripts) {
		const base = scriptBaseName(scriptPath);
		if (!shouldRunDependencyScript(base, context)) {
			const scopeCtx = formatScopeContext(
				context.scope || 'project',
				context.platform || 'claude',
			);
			console.log(chalk.dim(`  Skipped: ${scriptPath} (${scopeCtx})`));
			continue;
		}

		const nodeScript = resolveNodeScript(scriptPath);

		if (nodeScript) {
			console.log(chalk.dim(`  Running: ${path.basename(nodeScript)}`));
			try {
				runNodeScript(nodeScript, context);
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
			runBashScript(bash, fullPath, context);
			console.log(chalk.green(`  ✓ ${scriptPath} completed`));
		} catch (err) {
			const detail =
				err.stderr?.toString?.().trim() || err.message || String(err);
			console.error(chalk.yellow(`  ⚠ ${scriptPath} failed: ${detail}`));
			console.error(chalk.dim('  Continuing installation...'));
		}
	}
}
