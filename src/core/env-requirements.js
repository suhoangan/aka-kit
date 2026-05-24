import { expandPlatform } from './platforms.js';

/**
 * Env vars the install wizard may collect.
 * @typedef {'project-env' | 'claude-mem-settings'} EnvTarget
 */

export const ENV_REQUIREMENTS = [
	{
		key: 'CONTEXT7_API_KEY',
		label: 'Context7 API key',
		description: 'Docs MCP (context7) — free tier at context7.com',
		url: 'https://context7.com/dashboard',
		required: true,
		platforms: ['claude', 'cursor', 'codex'],
		targets: ['project-env'],
		mcpServer: 'context7',
		mcpHeader: 'CONTEXT7_API_KEY',
	},
	{
		key: 'FIGMA_API_KEY',
		label: 'Figma access token',
		description: 'Optional — figma MCP when using Figma designs',
		url: 'https://www.figma.com/developers/api#access-tokens',
		required: false,
		platforms: ['claude', 'cursor', 'codex'],
		targets: ['project-env'],
	},
	{
		key: 'CLAUDE_MEM_GEMINI_API_KEY',
		label: 'Gemini API key',
		description: 'claude-mem on Cursor (observation extraction)',
		url: 'https://aistudio.google.com/apikey',
		required: true,
		platforms: ['cursor'],
		targets: ['claude-mem-settings'],
		envAlias: 'GEMINI_API_KEY',
	},
];

/** @param {string} platform claude | cursor | codex | both | all */
export function getEnvRequirementsForInstall(platform) {
	const platforms = expandPlatform(platform);
	return ENV_REQUIREMENTS.filter((req) =>
		req.platforms.some((p) => platforms.includes(p)),
	);
}

/** Flat list for doctor checks. */
export const DOCTOR_ENV_VARS = ENV_REQUIREMENTS.filter((r) =>
	r.targets.includes('project-env'),
).map((r) => ({
	name: r.key,
	level: r.doctorLevel || (r.required ? 'recommended' : 'optional'),
	detail: r.description + (r.url ? ` — ${r.url}` : ''),
}));
