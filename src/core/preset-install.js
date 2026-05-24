import { resolvePresets } from './preset-resolver.js';
import { install, installTemplatesOnly } from './installer.js';

/**
 * Project preset chain without shared (shared is user-scope only).
 * @param {string} presetName
 */
export function resolveProjectPresetChain(presetName) {
	const chain = resolvePresets(presetName);
	return chain.filter((p) => p.name !== 'shared');
}

/**
 * Re-install a project preset into targetDir (matches `aka-kit install` step 2).
 */
export async function reinstallProjectPreset(targetDir, presetName, options = {}) {
	const { dryRun = false, platform = 'claude', scope = 'project' } = options;
	const chain = resolvePresets(presetName);
	const sharedPreset = chain.find((p) => p.name === 'shared');
	if (sharedPreset) {
		installTemplatesOnly(targetDir, sharedPreset, { dryRun, platform });
	}
	const filtered = resolveProjectPresetChain(presetName);
	if (filtered.length === 0) return false;
	await install(targetDir, filtered, { dryRun, platform, scope });
	return true;
}

/**
 * Re-install user-scope presets (shared and/or global) into targetDir.
 * @param {string[]} presetNames e.g. ['shared'] or ['global']
 */
export async function reinstallUserScopePresets(
	targetDir,
	presetNames,
	options = {},
) {
	const { dryRun = false, platform = 'claude', scope = 'global' } = options;
	let ran = false;
	for (const name of presetNames) {
		const chain = resolvePresets(name);
		if (chain.length === 0) continue;
		await install(targetDir, chain, { dryRun, platform, scope });
		ran = true;
	}
	return ran;
}
