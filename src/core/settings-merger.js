import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

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
  return Array.isArray(sourceValue) && (Array.isArray(targetValue) || targetValue === undefined);
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
      const filteredHooks = entry.hooks.filter(h => !existingCommands.has(h.command));
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

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
