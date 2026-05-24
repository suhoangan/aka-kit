import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { findSkill, normalizeSkillSlug } from './catalog.js';
import { readManifest, writeManifest } from './manifest.js';
import {
	mergePermissions,
	removePermissionEntries,
} from './settings-merger.js';
import { shouldMergePermissions } from './platform-artifacts.js';

function skillPermissionForSlug(slug) {
	const short = slug.replace(/^aka-/, '');
	return `Skill(aka:${short})`;
}

/**
 * Add a single bundled skill to target .claude/ (or .cursor/).
 */
export async function addSkill(targetDir, query, options = {}) {
	const { dryRun = false, platform = 'claude' } = options;
	const entry = findSkill(query);
	if (!entry) {
		throw new Error(
			`Skill not found: ${query}. Run "aka-kit search ${query}" to browse.`,
		);
	}
	if (!fs.existsSync(entry.path)) {
		throw new Error(`Skill source missing: ${entry.path}`);
	}

	const relPath = `skills/${entry.slug}`;
	const dst = path.join(targetDir, relPath);

	if (dryRun) {
		console.log(chalk.dim(`  [dry-run] Would copy skill: ${entry.slug}`));
		return entry;
	}

	fs.ensureDirSync(path.dirname(dst));
	fs.copySync(entry.path, dst, { overwrite: true });
	console.log(`  ${chalk.green('+')} skill: ${entry.slug}`);

	if (shouldMergePermissions(platform)) {
		mergePermissions(targetDir, {
			allow: [skillPermissionForSlug(entry.slug)],
		});
	}

	const manifest = readManifest(targetDir) || { version: '0.1.0', presets: {} };
	if (!manifest.extras) manifest.extras = { skills: [] };
	if (!manifest.extras.skills.includes(entry.slug)) {
		manifest.extras.skills.push(entry.slug);
	}
	writeManifest(targetDir, manifest);
	return entry;
}

/**
 * Remove a skill directory and optional permission entry.
 */
export async function removeSkill(targetDir, query, options = {}) {
	const { dryRun = false, platform = 'claude' } = options;
	const slug = normalizeSkillSlug(query);
	const relPath = `skills/${slug}`;
	const fullPath = path.join(targetDir, relPath);

	if (!fs.existsSync(fullPath)) {
		throw new Error(`Skill not installed: ${slug}`);
	}

	if (dryRun) {
		console.log(chalk.dim(`  [dry-run] Would remove: ${relPath}`));
		return slug;
	}

	fs.removeSync(fullPath);
	console.log(`  ${chalk.red('-')} ${relPath}`);

	if (shouldMergePermissions(platform)) {
		removePermissionEntries(targetDir, [skillPermissionForSlug(slug)]);
	}

	const manifest = readManifest(targetDir);
	if (manifest?.extras?.skills) {
		manifest.extras.skills = manifest.extras.skills.filter((s) => s !== slug);
		writeManifest(targetDir, manifest);
	}
	return slug;
}
