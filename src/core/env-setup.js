import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { expandPlatform } from './platforms.js';
import { getEnvRequirementsForInstall } from './env-requirements.js';
import {
	isInteractiveEnv,
	maskSecret,
	printEnvBanner,
} from './env-interactive.js';

/** @param {string} filePath */
export function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return {};
	const out = {};
	for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
		const t = line.trim();
		if (!t || t.startsWith('#')) continue;
		const eq = t.indexOf('=');
		if (eq <= 0) continue;
		const key = t.slice(0, eq).trim();
		let val = t.slice(eq + 1).trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		out[key] = val;
	}
	return out;
}

/** Merge vars into .env (preserve comments); bootstrap from .env.example if needed. */
export function writeProjectEnv(cwd, vars) {
	const envPath = path.join(cwd, '.env');
	const examplePath = path.join(cwd, '.env.example');
	let lines = [];
	if (fs.existsSync(envPath)) {
		lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
	} else if (fs.existsSync(examplePath)) {
		lines = fs.readFileSync(examplePath, 'utf8').split(/\r?\n/);
	}

	const keysWritten = new Set();
	const out = lines.map((line) => {
		const t = line.trim();
		if (!t || t.startsWith('#')) return line;
		const eq = t.indexOf('=');
		if (eq <= 0) return line;
		const key = t.slice(0, eq).trim();
		if (vars[key] !== undefined && vars[key] !== '') {
			keysWritten.add(key);
			return `${key}=${vars[key]}`;
		}
		return line;
	});

	for (const [key, val] of Object.entries(vars)) {
		if (!val || keysWritten.has(key)) continue;
		out.push(`${key}=${val}`);
	}

	fs.writeFileSync(envPath, `${out.join('\n').replace(/\n?$/, '\n')}`);
	return envPath;
}

/** Cursor claude-mem: ~/.claude-mem/settings.json */
export function writeClaudeMemSettings(geminiKey) {
	if (!geminiKey) return null;
	const dir = path.join(os.homedir(), '.claude-mem');
	const settingsPath = path.join(dir, 'settings.json');
	let settings = {};
	if (fs.existsSync(settingsPath)) {
		try {
			settings = fs.readJsonSync(settingsPath);
		} catch {
			settings = {};
		}
	}
	settings.CLAUDE_MEM_PROVIDER = 'gemini';
	settings.CLAUDE_MEM_GEMINI_API_KEY = geminiKey;
	fs.ensureDirSync(dir);
	fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
	return settingsPath;
}

/** Inject collected keys into platform MCP configs (local only — do not commit secrets). */
export function applyEnvToMcpDirs(cwd, platform, vars) {
	const platforms = expandPlatform(platform);
	const dirs = platforms.map((p) => path.join(cwd, `.${p}`));
	for (const dir of dirs) {
		const mcpPath = path.join(dir, '.mcp.json');
		if (!fs.existsSync(mcpPath)) continue;
		let data;
		try {
			data = fs.readJsonSync(mcpPath);
		} catch {
			continue;
		}
		if (!data.mcpServers) continue;
		let changed = false;

		if (vars.CONTEXT7_API_KEY && data.mcpServers.context7?.headers) {
			data.mcpServers.context7.headers.CONTEXT7_API_KEY = vars.CONTEXT7_API_KEY;
			changed = true;
		}

		if (changed) {
			fs.writeJsonSync(mcpPath, data, { spaces: 2 });
		}
	}
}

function loadExistingValues(cwd, requirements) {
	const fromFile = parseEnvFile(path.join(cwd, '.env'));
	const existing = { ...fromFile };
	for (const req of requirements) {
		if (process.env[req.key]) existing[req.key] = process.env[req.key];
		if (req.envAlias && process.env[req.envAlias]) {
			existing[req.key] = process.env[req.envAlias];
		}
	}
	const memPath = path.join(os.homedir(), '.claude-mem', 'settings.json');
	if (fs.existsSync(memPath)) {
		try {
			const mem = fs.readJsonSync(memPath);
			if (mem.CLAUDE_MEM_GEMINI_API_KEY) {
				existing.CLAUDE_MEM_GEMINI_API_KEY = mem.CLAUDE_MEM_GEMINI_API_KEY;
			}
		} catch {
			/* ignore */
		}
	}
	return existing;
}

function persistCollected(cwd, platform, requirements, collected) {
	const projectVars = {};
	for (const req of requirements) {
		if (req.targets.includes('project-env') && collected[req.key]) {
			projectVars[req.key] = collected[req.key];
		}
	}

	const written = [];

	if (Object.keys(projectVars).length > 0) {
		const envPath = writeProjectEnv(cwd, projectVars);
		written.push(envPath);
		process.env.CONTEXT7_API_KEY =
			projectVars.CONTEXT7_API_KEY || process.env.CONTEXT7_API_KEY;
	}

	if (collected.CLAUDE_MEM_GEMINI_API_KEY) {
		written.push(writeClaudeMemSettings(collected.CLAUDE_MEM_GEMINI_API_KEY));
	}

	applyEnvToMcpDirs(cwd, platform, collected);
	return written;
}

/**
 * Visible interactive form — one field at a time with password masking (•••).
 * @param {object[]} requirements
 * @param {Record<string, string>} existing
 */
export async function promptEnvForm(requirements, existing) {
	const collected = { ...existing };

	for (const req of requirements) {
		const hasCurrent = Boolean(existing[req.key]?.trim());
		const reqTag = req.required
			? chalk.yellow('required')
			: chalk.dim('optional');

		const { value } = await prompts(
			{
				type: 'password',
				name: 'value',
				message: `${req.label} [${reqTag}]`,
				validate: (v) => {
					const trimmed = (v || '').trim();
					if (trimmed) return true;
					if (hasCurrent) return true;
					if (req.required) {
						return 'Required — paste your API key (or Ctrl+C to skip install setup)';
					}
					return true;
				},
			},
			{ onCancel: () => process.exit(130) },
		);

		const trimmed = (value || '').trim();
		if (trimmed) {
			collected[req.key] = trimmed;
			console.log(chalk.green(`  ✓ ${req.key} saved (${maskSecret(trimmed)})`));
		} else if (hasCurrent) {
			console.log(chalk.dim(`  → kept existing ${req.key}`));
		} else if (req.required) {
			console.log(chalk.yellow(`  ⚠ ${req.key} left empty`));
		} else {
			console.log(chalk.dim(`  → skipped optional ${req.key}`));
		}
	}

	return collected;
}

/**
 * Interactive env wizard during install/init/setup-env.
 * @param {{ platform: string, cwd?: string, dryRun?: boolean, skipEnv?: boolean, forceInteractive?: boolean }} opts
 */
export async function setupRequiredEnv(opts) {
	const {
		platform,
		cwd = process.cwd(),
		dryRun = false,
		skipEnv = false,
		forceInteractive = false,
	} = opts;

	if (skipEnv || dryRun) {
		return { skipped: true, reason: skipEnv ? 'skip-env' : 'dry-run' };
	}

	if (!isInteractiveEnv({ skipEnv, forceInteractive })) {
		console.log(chalk.yellow('\nNon-interactive terminal — env UI skipped.'));
		console.log(
			chalk.dim('  Run in a terminal: aka-kit setup-env --platform cursor'),
		);
		console.log(
			chalk.dim('  Or set AKAKIT_FORCE_INTERACTIVE=1 to force prompts.\n'),
		);
		return { skipped: true, reason: 'non-tty' };
	}

	const requirements = getEnvRequirementsForInstall(platform);
	if (requirements.length === 0) {
		return { skipped: true, reason: 'none' };
	}

	const existing = loadExistingValues(cwd, requirements);
	printEnvBanner(platform, requirements, existing);

	const collected = await promptEnvForm(requirements, existing);

	console.log(chalk.bold('\n  Saving…'));
	const written = persistCollected(cwd, platform, requirements, collected);
	for (const f of written) {
		console.log(chalk.green(`  ✓ ${f}`));
	}
	if (written.length > 0) {
		console.log(
			chalk.dim(
				'  MCP headers updated in .mcp.json (keep secrets out of git)\n',
			),
		);
	}

	return { skipped: false, values: collected };
}
