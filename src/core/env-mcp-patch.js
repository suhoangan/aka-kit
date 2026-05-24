import fs from 'fs-extra';
import os from 'os';
import path from 'node:path';
import TOML from '@iarna/toml';
import { expandPlatform } from './platforms.js';
import { getPlatformProfile } from './platform-profiles.js';

/**
 * Inject collected keys into MCP configs (project + user-scope per platform).
 */
export function applyEnvToMcpDirs(cwd, platform, vars) {
	const platforms = expandPlatform(platform);
	const home = os.homedir();

	for (const p of platforms) {
		const profile = getPlatformProfile(p);
		const dirs = [
			path.join(cwd, profile.configDir),
			path.join(home, profile.configDir),
		];

		for (const dir of [...new Set(dirs)]) {
			if (!fs.existsSync(dir)) continue;
			if (profile.mcpFormat === 'toml') {
				patchCodexToml(dir, vars);
			} else {
				patchMcpJson(dir, vars);
			}
		}
	}
}

function patchMcpJson(dir, vars) {
	const mcpPath = path.join(dir, '.mcp.json');
	if (!fs.existsSync(mcpPath)) return;
	let data;
	try {
		data = fs.readJsonSync(mcpPath);
	} catch {
		return;
	}
	if (!data.mcpServers) return;
	let changed = false;

	if (vars.CONTEXT7_API_KEY && data.mcpServers.context7?.headers) {
		data.mcpServers.context7.headers.CONTEXT7_API_KEY = vars.CONTEXT7_API_KEY;
		changed = true;
	}

	if (changed) {
		fs.writeJsonSync(mcpPath, data, { spaces: 2 });
	}
}

function patchCodexToml(dir, vars) {
	const tomlPath = path.join(dir, 'config.toml');
	if (!fs.existsSync(tomlPath)) return;
	let existing;
	try {
		existing = TOML.parse(fs.readFileSync(tomlPath, 'utf8'));
	} catch {
		return;
	}
	if (!existing.mcp_servers?.context7) return;

	const entry = existing.mcp_servers.context7;
	if (!entry.headers) entry.headers = {};

	if (vars.CONTEXT7_API_KEY) {
		entry.headers.CONTEXT7_API_KEY = vars.CONTEXT7_API_KEY;
		fs.writeFileSync(tomlPath, TOML.stringify(existing));
	}
}
