import path from 'path';
import os from 'os';
import { getPlatformProfile } from './platform-profiles.js';

export const SUPPORTED_PLATFORMS = ['claude', 'cursor', 'codex', 'both', 'all'];
export const DEFAULT_PLATFORM = 'claude';

const PLATFORM_DIRS = {
	claude: '.claude',
	cursor: '.cursor',
	codex: '.codex',
};

/** User-facing scope label (internal value stays `global` | `project`). */
export function scopeLabel(scope) {
	return scope === 'global' ? 'user-scope' : 'project';
}

/** e.g. "user-scope · Cursor (~/.cursor)" or "project · Cursor (<cwd>/.cursor)" */
export function formatScopeContext(scope, platform) {
	const profile = getPlatformProfile(platform);
	const label = scopeLabel(scope);
	if (scope === 'global') {
		const homeDir = path.join(os.homedir(), profile.configDir);
		return `${label} · ${profile.label} (${homeDir})`;
	}
	return `${label} · ${profile.label} (<cwd>/${profile.configDir})`;
}

/** Comma-separated user config dirs for prompts, e.g. ~/.cursor or ~/.claude, ~/.cursor */
export function userScopeDirsHint(platform) {
	return expandPlatform(platform)
		.map((p) => `~/${PLATFORM_DIRS[p]}`)
		.join(', ');
}

/**
 * Expand a platform alias into its concrete platform list.
 *   claude → ['claude']
 *   cursor → ['cursor']
 *   codex  → ['codex']
 *   both   → ['claude', 'cursor']     (legacy alias)
 *   all    → ['claude', 'cursor', 'codex']
 */
export function expandPlatform(platform) {
	if (platform === 'both') return ['claude', 'cursor'];
	if (platform === 'all') return ['claude', 'cursor', 'codex'];
	return [platform];
}

/**
 * Resolve install target directories for the requested platform.
 * Returns { globalDirs, projectDirs } where each entry is { dir, platform }.
 */
export function resolveTargetDirs(platform) {
	const platforms = expandPlatform(platform);
	const globalDirs = [];
	const projectDirs = [];

	for (const p of platforms) {
		const dirName = PLATFORM_DIRS[p];
		if (!dirName) continue;
		globalDirs.push({
			dir: path.join(os.homedir(), dirName),
			platform: p,
			scope: 'global',
		});
		projectDirs.push({
			dir: path.join(process.cwd(), dirName),
			platform: p,
			scope: 'project',
		});
	}

	return { globalDirs, projectDirs };
}

/**
 * Validate a platform value. Throws if unsupported.
 */
export function assertValidPlatform(platform) {
	if (!SUPPORTED_PLATFORMS.includes(platform)) {
		throw new Error(
			`Invalid platform: ${platform}. Use one of: ${SUPPORTED_PLATFORMS.join(', ')}`,
		);
	}
}
