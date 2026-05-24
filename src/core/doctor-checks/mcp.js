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
		{
			label: 'claude (project)',
			file: path.join(cwd, '.claude', '.mcp.json'),
			format: 'json',
		},
		{
			label: 'claude (user-scope)',
			file: path.join(home, '.claude', '.mcp.json'),
			format: 'json',
		},
		{
			label: 'cursor (project)',
			file: path.join(cwd, '.cursor', '.mcp.json'),
			format: 'json',
		},
		{
			label: 'cursor (user-scope)',
			file: path.join(home, '.cursor', '.mcp.json'),
			format: 'json',
		},
		{
			label: 'codex (project)',
			file: path.join(cwd, '.codex', 'config.toml'),
			format: 'toml',
		},
		{
			label: 'codex (user-scope)',
			file: path.join(home, '.codex', 'config.toml'),
			format: 'toml',
		},
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
			results.push(result('MCP', loc.label, 'skip', 'not installed'));
			continue;
		}

		try {
			if (loc.format === 'json') {
				const data = JSON.parse(fs.readFileSync(loc.file, 'utf8'));
				const count = Object.keys(data.mcpServers || {}).length;
				if (count === 0) {
					results.push(
						result('MCP', loc.label, 'warn', 'no mcpServers defined'),
					);
				} else {
					results.push(
						result('MCP', loc.label, 'ok', `${count} server(s) configured`),
					);
				}
			} else {
				const data = toml.parse(fs.readFileSync(loc.file, 'utf8'));
				const count = Object.keys(data.mcp_servers || {}).length;
				if (count === 0) {
					results.push(
						result('MCP', loc.label, 'warn', 'no mcp_servers defined'),
					);
				} else {
					results.push(
						result('MCP', loc.label, 'ok', `${count} server(s) configured`),
					);
				}
			}
		} catch (err) {
			results.push(
				result(
					'MCP',
					loc.label,
					'error',
					`parse failed: ${err.message}`,
					`Fix or remove ${loc.file}`,
				),
			);
		}
	}
	return results;
}
