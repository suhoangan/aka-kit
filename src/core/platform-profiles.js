/**
 * Per-platform install profiles — dependency scripts and MCP merge use these
 * so Cursor/Claude/Codex get the correct IDE integration, not a Claude-default path.
 */

export const PLATFORM_PROFILES = {
	claude: {
		label: 'Claude Code',
		configDir: '.claude',
		specKitIntegration: 'claude',
		serenaContext: 'claude-code',
		claudeMemIde: 'claude-code',
		claudeMemProvider: null,
		supportsClaudeMem: true,
		supportsHooks: true,
		supportsClaudeSettings: true,
		supportsPermissions: true,
		installRules: true,
		ruleFormat: 'md',
		mcpFormat: 'json',
	},
	cursor: {
		label: 'Cursor',
		configDir: '.cursor',
		specKitIntegration: 'cursor-agent',
		serenaContext: 'ide-assistant',
		claudeMemIde: 'cursor',
		claudeMemProvider: null,
		supportsClaudeMem: true,
		supportsHooks: false,
		supportsClaudeSettings: false,
		supportsPermissions: false,
		installRules: true,
		ruleFormat: 'mdc',
		mcpFormat: 'json',
	},
	codex: {
		label: 'Codex',
		configDir: '.codex',
		specKitIntegration: 'codex',
		serenaContext: 'ide-assistant',
		claudeMemIde: null,
		claudeMemProvider: null,
		supportsClaudeMem: false,
		supportsHooks: false,
		supportsClaudeSettings: false,
		supportsPermissions: false,
		installRules: true,
		ruleFormat: 'md',
		mcpFormat: 'toml',
	},
};

/** @param {string} platform */
export function getPlatformProfile(platform) {
	const key = (platform || 'claude').toLowerCase();
	return PLATFORM_PROFILES[key] || PLATFORM_PROFILES.claude;
}

/**
 * Adjust preset MCP entries for the target IDE (e.g. Serena context for Cursor).
 * @param {Record<string, object>} mcpServers
 * @param {string} platform
 */
export function resolveMcpForPlatform(mcpServers, platform) {
	if (!mcpServers || typeof mcpServers !== 'object') return mcpServers;

	const profile = getPlatformProfile(platform);
	const resolved = JSON.parse(JSON.stringify(mcpServers));

	if (resolved.serena?.args && profile.serenaContext) {
		resolved.serena.args = resolved.serena.args.map((arg) =>
			typeof arg === 'string' && arg.startsWith('--context=')
				? `--context=${profile.serenaContext}`
				: arg,
		);
	}

	return resolved;
}
