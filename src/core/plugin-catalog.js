/** Curated plugin catalog for aka-kit presets. */
export const PLUGIN_CATALOG = {
	shared: [
		{
			id: 'claude-mem@thedotmack',
			name: 'claude-mem',
			marketplace: 'thedotmack',
			repo: 'thedotmack/claude-mem',
			description: 'Persistent cross-session memory and observation search',
			defaultEnabled: true,
		},
		{
			id: 'qmd@qmd',
			name: 'qmd',
			marketplace: 'qmd',
			repo: 'tobi/qmd',
			description: 'Markdown knowledge-base search (QMD)',
			defaultEnabled: true,
		},
	],
	nextjs: [],
	php: [],
	hubspot: [],
	global: [],
};

/** extraKnownMarketplaces entries bundled with shared preset. */
export const MARKETPLACE_SOURCES = {
	thedotmack: {
		source: { source: 'github', repo: 'thedotmack/claude-mem' },
	},
	qmd: {
		source: { source: 'github', repo: 'tobi/qmd' },
	},
};

export function getRecommendedPlugins(presetName) {
	const base = PLUGIN_CATALOG.shared || [];
	const extra = PLUGIN_CATALOG[presetName] || [];
	return [...base, ...extra];
}

export function findPlugin(query) {
	const q = query.toLowerCase();
	const all = Object.values(PLUGIN_CATALOG).flat();
	return (
		all.find(
			(p) =>
				p.id.toLowerCase() === q ||
				p.name.toLowerCase() === q ||
				p.id.toLowerCase().startsWith(`${q}@`),
		) || null
	);
}
