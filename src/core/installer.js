import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { mergeSettings, mergeMcpConfig } from './settings-merger.js';
import { readManifest, writeManifest } from './manifest.js';
import { runDependencyScripts } from './dependency-runner.js';

/**
 * Install a resolved preset chain into the target .claude/ directory.
 * presetChain is an array of preset objects (includes first, main preset last).
 */
export async function install(targetDir, presetChain, options = {}) {
  const { dryRun = false } = options;
  const installedFiles = [];
  // The main preset is the last one in the chain
  const mainPreset = presetChain[presetChain.length - 1];

  fs.ensureDirSync(targetDir);

  // Process each preset in the chain (includes first, then main)
  for (const preset of presetChain) {
    installArtifacts(targetDir, preset, installedFiles, dryRun);

    // Merge settings.json entries
    if (preset.settings && Object.keys(preset.settings).length > 0 && !dryRun) {
      mergeSettings(targetDir, preset.settings);
      console.log(`  ${chalk.green('+')} settings.json merged (${preset.name})`);
    }

    // Merge MCP server configs into .mcp.json
    if (preset.mcp && Object.keys(preset.mcp).length > 0 && !dryRun) {
      mergeMcpConfig(targetDir, preset.mcp);
      console.log(`  ${chalk.green('+')} .mcp.json merged (${preset.name})`);
    }

    // Run dependency scripts
    if (preset.dependencies?.scripts?.length > 0 && !dryRun) {
      await runDependencyScripts(preset._dir, preset.dependencies.scripts);
    }
  }

  // Write manifest tracking all installed files under the main preset name
  if (!dryRun) {
    const manifest = readManifest(targetDir) || { version: '0.1.0', presets: {} };
    manifest.presets[mainPreset.name] = {
      version: mainPreset.version || '0.1.0',
      installedAt: new Date().toISOString(),
      artifacts: installedFiles,
    };
    writeManifest(targetDir, manifest);
  }
}

/**
 * Copy skills, rules, hooks, and templates from a single preset into targetDir.
 */
function installArtifacts(targetDir, preset, installedFiles, dryRun) {
  // Copy skills
  for (const skillDir of preset.artifacts?.skills || []) {
    const src = path.join(preset._dir, 'skills', skillDir);
    const dst = path.join(targetDir, 'skills', skillDir);
    if (!fs.existsSync(src)) continue;

    if (dryRun) {
      console.log(chalk.dim(`  [dry-run] Would copy skill: ${skillDir}`));
    } else {
      fs.ensureDirSync(path.dirname(dst));
      fs.copySync(src, dst, { overwrite: true });
      console.log(`  ${chalk.green('+')} skill: ${skillDir}`);
    }
    installedFiles.push(`skills/${skillDir}`);
  }

  // Copy rules
  for (const ruleFile of preset.artifacts?.rules || []) {
    const src = path.join(preset._dir, 'rules', ruleFile);
    const dst = path.join(targetDir, 'rules', ruleFile);
    if (!fs.existsSync(src)) continue;

    if (dryRun) {
      console.log(chalk.dim(`  [dry-run] Would copy rule: ${ruleFile}`));
    } else {
      fs.ensureDirSync(path.dirname(dst));
      fs.copySync(src, dst, { overwrite: true });
      console.log(`  ${chalk.green('+')} rule: ${ruleFile}`);
    }
    installedFiles.push(`rules/${ruleFile}`);
  }

  // Copy hook scripts
  for (const hookFile of preset.artifacts?.hooks || []) {
    const src = path.join(preset._dir, 'hooks', hookFile);
    const dst = path.join(targetDir, 'hooks', hookFile);
    if (!fs.existsSync(src)) continue;

    if (dryRun) {
      console.log(chalk.dim(`  [dry-run] Would copy hook: ${hookFile}`));
    } else {
      fs.ensureDirSync(path.dirname(dst));
      fs.copySync(src, dst, { overwrite: true });
      console.log(`  ${chalk.green('+')} hook: ${hookFile}`);
    }
    installedFiles.push(`hooks/${hookFile}`);
  }

  // Copy templates (e.g., CLAUDE.md) — go to parent of .claude/
  for (const tplFile of preset.artifacts?.templates || []) {
    const src = path.join(preset._dir, 'templates', tplFile);
    const dst = path.join(targetDir, '..', tplFile);
    if (!fs.existsSync(src)) continue;

    if (fs.existsSync(dst)) {
      console.log(chalk.yellow(`  ~ Skipped template ${tplFile} (already exists)`));
      continue;
    }

    if (dryRun) {
      console.log(chalk.dim(`  [dry-run] Would copy template: ${tplFile}`));
    } else {
      fs.copySync(src, dst);
      console.log(`  ${chalk.green('+')} template: ${tplFile}`);
    }
    installedFiles.push(`templates/${tplFile}`);
  }
}

/**
 * Uninstall a preset by removing artifacts listed in the manifest.
 */
export async function uninstall(targetDir, presetName, options = {}) {
  const { dryRun = false } = options;
  const manifest = readManifest(targetDir);

  if (!manifest?.presets?.[presetName]) {
    console.log(chalk.yellow(`  Preset "${presetName}" not found in manifest. Nothing to remove.`));
    return;
  }

  const { artifacts } = manifest.presets[presetName];

  for (const relPath of artifacts) {
    const fullPath = relPath.startsWith('templates/')
      ? path.join(targetDir, '..', relPath.replace('templates/', ''))
      : path.join(targetDir, relPath);

    if (!fs.existsSync(fullPath)) continue;

    if (dryRun) {
      console.log(chalk.dim(`  [dry-run] Would remove: ${relPath}`));
    } else {
      fs.removeSync(fullPath);
      console.log(`  ${chalk.red('-')} ${relPath}`);
    }
  }

  if (!dryRun) {
    delete manifest.presets[presetName];
    writeManifest(targetDir, manifest);
  }
}
