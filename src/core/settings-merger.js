import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import TOML from '@iarna/toml';

/**
 * Replace {{HOOKS_DIR}} with platform-specific hooks path (e.g. .claude/hooks).
 */
export function resolveSettingsForTarget(presetSettings, targetDir) {
	if (!presetSettings) return presetSettings;
	const hooksDir = `${path.basename(targetDir).replace(/\\/g, '/')}/hooks`;
	const json = JSON.stringify(presetSettings);
	return JSON.parse(json.replaceAll('{{HOOKS_DIR}}', hooksDir));
}

/**
 * Deep merge preset settings into the target .claude/settings.json.
 * - Objects: deep merge (existing keys preserved)
 * - Arrays (hooks): concat + dedupe by command field
 * - Scalars: existing values win (preset fills gaps only)
 * Creates backup before modifying.
 */
export function mergeSettings(targetDir, presetSettings) {
	const settingsPath = path.join(targetDir, 'settings.json');
	let existing = {};

	if (fs.existsSync(settingsPath)) {
		// Backup existing settings before merge
		const backupPath = path.join(targetDir, `settings.json.bak.${Date.now()}`);
		fs.copySync(settingsPath, backupPath);
		existing = fs.readJsonSync(settingsPath);
	}

	const merged = deepMerge(existing, presetSettings);
	fs.writeJsonSync(settingsPath, merged, { spaces: 2 });
}

/**
 * Deep merge two objects with hook-aware array handling.
 * Target (existing user config) takes precedence for scalar values.
 */
function deepMerge(target, source) {
	const result = { ...target };

	for (const [key, sourceValue] of Object.entries(source)) {
		const targetValue = result[key];

		if (isHooksArray(key, sourceValue, targetValue)) {
			// Hook arrays: concat and dedupe by command field
			result[key] = dedupeHookEntries(targetValue || [], sourceValue);
		} else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
			// Recursively merge objects
			result[key] = deepMerge(targetValue, sourceValue);
		} else if (targetValue === undefined) {
			// Only fill gaps — don't overwrite existing scalars
			result[key] = sourceValue;
		}
	}

	return result;
}

/**
 * Detect if a key/value pair represents a hooks array.
 * Hooks entries have a "hooks" sub-array with "command" fields.
 */
function isHooksArray(key, sourceValue, targetValue) {
	return (
		Array.isArray(sourceValue) &&
		(Array.isArray(targetValue) || targetValue === undefined)
	);
}

/**
 * Concat hook entry arrays, deduplicating by the command string
 * inside each hook object's hooks[].command field.
 */
function dedupeHookEntries(existing, incoming) {
	const existingCommands = new Set();
	for (const entry of existing) {
		if (entry.hooks) {
			for (const hook of entry.hooks) {
				if (hook.command) existingCommands.add(hook.command);
			}
		}
	}

	const newEntries = [];
	for (const entry of incoming) {
		if (entry.hooks) {
			// Filter out hooks whose command already exists
			const filteredHooks = entry.hooks.filter(
				(h) => !existingCommands.has(h.command),
			);
			if (filteredHooks.length > 0) {
				newEntries.push({ ...entry, hooks: filteredHooks });
			}
		} else {
			newEntries.push(entry);
		}
	}

	return [...existing, ...newEntries];
}

/**
 * Merge MCP server configs into .mcp.json in the target directory.
 * Adds new servers without overwriting existing ones.
 */
export function mergeMcpConfig(targetDir, mcpServers) {
	const mcpPath = path.join(targetDir, '.mcp.json');
	let existing = { mcpServers: {} };

	if (fs.existsSync(mcpPath)) {
		const backupPath = path.join(targetDir, `.mcp.json.bak.${Date.now()}`);
		fs.copySync(mcpPath, backupPath);
		existing = fs.readJsonSync(mcpPath);
		if (!existing.mcpServers) existing.mcpServers = {};
	}

	// Only add servers that don't already exist (don't overwrite user configs)
	for (const [name, config] of Object.entries(mcpServers)) {
		if (!existing.mcpServers[name]) {
			existing.mcpServers[name] = config;
		}
	}

	fs.writeJsonSync(mcpPath, existing, { spaces: 2 });
}

/**
 * Merge permissions (allow / deny / ask) into settings.json.
 * Adds new entries without duplicating existing ones.
 */
export function mergePermissions(targetDir, permissions) {
	const settingsPath = path.join(targetDir, 'settings.json');
	let existing = {};

	if (fs.existsSync(settingsPath)) {
		existing = fs.readJsonSync(settingsPath);
	}

	if (!existing.permissions) existing.permissions = {};
	for (const key of ['allow', 'deny', 'ask']) {
		if (!existing.permissions[key]) existing.permissions[key] = [];
		const incoming = permissions[key] || [];
		const set = new Set(existing.permissions[key]);
		for (const entry of incoming) {
			if (!set.has(entry)) {
				existing.permissions[key].push(entry);
				set.add(entry);
			}
		}
	}

	fs.writeJsonSync(settingsPath, existing, { spaces: 2 });
}

/**
 * Remove permission entries from settings.json (best-effort on uninstall/remove).
 */
export function removePermissionEntries(targetDir, entries) {
	const settingsPath = path.join(targetDir, 'settings.json');
	if (!fs.existsSync(settingsPath)) return;

	const existing = fs.readJsonSync(settingsPath);
	if (!existing.permissions) return;

	for (const key of ['allow', 'deny', 'ask']) {
		if (!existing.permissions[key]) continue;
		const drop = new Set(entries);
		existing.permissions[key] = existing.permissions[key].filter(
			(e) => !drop.has(e),
		);
	}

	fs.writeJsonSync(settingsPath, existing, { spaces: 2 });
}

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Merge MCP server configs into Codex's config.toml.
 * Codex reads `[mcp_servers.NAME]` tables with command/args/env keys —
 * same shape as Claude's .mcp.json entries, just serialized as TOML.
 * Non-destructive: existing servers are preserved.
 */
export function mergeMcpConfigToml(targetDir, mcpServers) {
	const tomlPath = path.join(targetDir, 'config.toml');
	let existing = {};

	if (fs.existsSync(tomlPath)) {
		const backupPath = path.join(targetDir, `config.toml.bak.${Date.now()}`);
		fs.copySync(tomlPath, backupPath);
		try {
			existing = TOML.parse(fs.readFileSync(tomlPath, 'utf8'));
		} catch (err) {
			console.log(
				chalk.yellow(
					`  ⚠ Could not parse existing config.toml: ${err.message}`,
				),
			);
			existing = {};
		}
	} else {
		fs.ensureDirSync(targetDir);
	}

	if (!existing.mcp_servers) existing.mcp_servers = {};

	for (const [name, config] of Object.entries(mcpServers)) {
		if (!existing.mcp_servers[name]) {
			existing.mcp_servers[name] = sanitizeMcpEntry(config);
		}
	}

	fs.writeFileSync(tomlPath, TOML.stringify(existing));
}

/**
 * TOML can't represent undefined/null. Strip empty values and coerce types.
 */
function sanitizeMcpEntry(entry) {
	const out = {};
	for (const [k, v] of Object.entries(entry)) {
		if (v === undefined || v === null) continue;
		out[k] = v;
	}
	return out;
}
