import path from 'path';
import os from 'os';

export const SUPPORTED_PLATFORMS = ['claude', 'cursor', 'codex', 'both', 'all'];
export const DEFAULT_PLATFORM = 'claude';

const PLATFORM_DIRS = {
	claude: '.claude',
	cursor: '.cursor',
	codex: '.codex',
};

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
