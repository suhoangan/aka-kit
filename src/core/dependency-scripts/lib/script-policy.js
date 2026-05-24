/**
 * Which dependency scripts run per install scope/platform.
 * Global ~/.cursor must not run project-only steps (graphify, speckit, graph-init).
 */

import { getPlatformProfile } from '../../platform-profiles.js';

/** IDE hook installers — user scope only (~/.cursor, ~/.claude). */
export const GLOBAL_SCOPE_ONLY_SCRIPTS = new Set(['install-claude-mem']);

/** Machine-wide CLIs — run once on global scope, skip on project scope. */
export const GLOBAL_CLI_SCRIPTS = new Set([
	'install-rtk',
	'install-agent-browser',
]);

/** Repo/project steps — only when installing <cwd>/.cursor (or .claude). */
export const PROJECT_ONLY_SCRIPTS = new Set([
	'install-speckit',
	'auto-graph-init',
	'install-graphify',
	'install-tanstack-intent',
]);

/** Expensive/idempotent — once per aka-kit install session. */
export const SESSION_ONCE_SCRIPTS = new Set([
	'install-prerequisites',
	'install-mcp-cache',
	...GLOBAL_CLI_SCRIPTS,
]);

const _sessionOnceRan = new Set();

/**
 * @param {string} scriptBase  e.g. install-graphify
 * @param {{ scope?: string, platform?: string }} context
 */
export function shouldRunDependencyScript(scriptBase, context = {}) {
	const scope = context.scope || 'project';
	const platform = (context.platform || 'claude').toLowerCase();

	if (PROJECT_ONLY_SCRIPTS.has(scriptBase) && scope === 'global') {
		return false;
	}

	if (GLOBAL_SCOPE_ONLY_SCRIPTS.has(scriptBase) && scope === 'project') {
		return false;
	}

	if (
		scriptBase === 'install-claude-mem' &&
		!getPlatformProfile(platform).supportsClaudeMem
	) {
		return false;
	}

	if (GLOBAL_CLI_SCRIPTS.has(scriptBase) && scope === 'project') {
		return false;
	}

	// graphify MCP wiring is JSON-only (Claude/Cursor)
	if (scriptBase === 'install-graphify' && platform === 'codex') {
		return false;
	}

	if (SESSION_ONCE_SCRIPTS.has(scriptBase)) {
		if (_sessionOnceRan.has(scriptBase)) return false;
		_sessionOnceRan.add(scriptBase);
	}

	return true;
}

/** @param {string} scriptPath preset-relative path */
export function scriptBaseName(scriptPath) {
	return scriptPath.replace(/^.*\//, '').replace(/\.(sh|mjs|js|cjs)$/i, '');
}
