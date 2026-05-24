import fs from 'fs';
import os from 'os';
import path from 'path';
import toml from '@iarna/toml';
import { result } from './utils.js';

/**
 * Locations to scan for MCP config across all editors.
 * Returns array of { label, file, format }.
 */
function mcpConfigLocations() {
	const home = os.homedir();
	const cwd = process.cwd();
	return [
		{ label: 'claude (project)', file: path.join(cwd, '.claude', '.mcp.json'), format: 'json' },
		{ label: 'claude (global)', file: path.join(home, '.claude', '.mcp.json'), format: 'json' },
		{ label: 'cursor (project)', file: path.join(cwd, '.cursor', '.mcp.json'), format: 'json' },
		{ label: 'cursor (global)', file: path.join(home, '.cursor', '.mcp.json'), format: 'json' },
		{ label: 'codex (global)', file: path.join(home, '.codex', 'config.toml'), format: 'toml' },
	];
}

/**
 * Validate each MCP config that exists: must parse, must declare at least one server.
 * Missing files are 'skip' (not installed for that editor).
 */
export function checkMcpConfigs() {
	const results = [];
	for (const loc of mcpConfigLocations()) {
		if (!fs.existsSync(loc.file)) {
			results.push(result('MCP config', loc.label, 'skip', 'not installed'));
			continue;
		}
		try {
			const text = fs.readFileSync(loc.file, 'utf8');
			let parsed;
			let servers;
			if (loc.format === 'json') {
				parsed = JSON.parse(text);
				servers = parsed.mcpServers || {};
			} else {
				parsed = toml.parse(text);
				servers = parsed.mcp_servers || {};
			}
			const names = Object.keys(servers);
			if (names.length === 0) {
				results.push(
					result('MCP config', loc.label, 'warn', `${loc.file} parses but declares no servers`),
				);
			} else {
				results.push(
					result(
						'MCP config',
						loc.label,
						'ok',
						`${names.length} server(s): ${names.join(', ')}`,
					),
				);
			}
		} catch (err) {
			results.push(
				result(
					'MCP config',
					loc.label,
					'error',
					`parse failed: ${err.message}`,
					`Inspect ${loc.file}`,
				),
			);
		}
	}
	return results;
}
