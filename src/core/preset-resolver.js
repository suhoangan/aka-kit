import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = path.join(__dirname, '..', 'presets');

/**
 * Resolve a preset by name, including its "includes" dependencies.
 * Returns an array of { preset, _dir } objects in dependency order
 * (included presets first, then the requested preset).
 */
export function resolvePresets(presetName, _visited = new Set()) {
  if (_visited.has(presetName)) {
    throw new Error(`Circular preset include detected: ${presetName}`);
  }
  _visited.add(presetName);

  const presetDir = path.join(PRESETS_DIR, presetName);
  const presetFile = path.join(presetDir, 'preset.json');

  if (!fs.existsSync(presetFile)) {
    throw new Error(`Preset "${presetName}" not found at ${presetFile}`);
  }

  const preset = fs.readJsonSync(presetFile);
  preset._dir = presetDir;

  // Collect all presets in dependency order (includes first)
  const chain = [];

  if (preset.includes && preset.includes.length > 0) {
    for (const includeName of preset.includes) {
      const included = resolvePresets(includeName, _visited);
      chain.push(...included);
    }
  }

  chain.push(preset);
  return chain;
}

/**
 * List all available presets by scanning the presets directory.
 */
export function getAvailablePresets() {
  const presets = [];
  const dirs = fs.readdirSync(PRESETS_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    if (dir.name === 'shared') continue;

    const presetFile = path.join(PRESETS_DIR, dir.name, 'preset.json');
    if (fs.existsSync(presetFile)) {
      const preset = fs.readJsonSync(presetFile);
      presets.push({ name: preset.name, description: preset.description });
    }
  }

  return presets;
}
