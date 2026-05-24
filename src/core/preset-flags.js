/** Preset CLI flag keys (Commander camelCases hyphenated flags). */
export const PRESET_FLAGS = [
	'nextjs',
	'hubspot',
	'php',
	'global',
	'turboStrapiNextjs',
	'fullstackNextjs',
	'nodeBackend',
];

/** Commander flag key → preset directory name. */
export const PRESET_NAME_MAP = {
	turboStrapiNextjs: 'turbo-strapi-nextjs',
	fullstackNextjs: 'fullstack-nextjs',
	nodeBackend: 'node-backend',
};

export function flagKeyToPresetName(flagKey) {
	return PRESET_NAME_MAP[flagKey] || flagKey;
}

export function presetNameToFlag(presetName) {
	for (const [key, name] of Object.entries(PRESET_NAME_MAP)) {
		if (name === presetName) return key;
	}
	return presetName;
}

export function presetToCliFlag(presetName) {
	if (presetName === 'global') return '--global';
	return `--${presetName}`;
}
