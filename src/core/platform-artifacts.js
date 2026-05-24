import fs from 'fs-extra';
import path from 'node:path';
import { getPlatformProfile } from './platform-profiles.js';

/**
 * Resolve rule file name + body for the target IDE.
 * Cursor: `.cursor/rules/*.mdc` with YAML frontmatter.
 * Claude: `.claude/rules/*.md`
 * Codex: `.codex/rules/*.md` (reference copy)
 */
export function prepareRuleArtifact(ruleFile, srcPath, platform) {
	const profile = getPlatformProfile(platform);
	const base = ruleFile.replace(/\.md$/i, '');
	const content = fs.readFileSync(srcPath, 'utf8');

	if (profile.ruleFormat === 'mdc') {
		const dstName = `${base}.mdc`;
		return { dstName, body: markdownToMdc(content, base) };
	}

	return {
		dstName: ruleFile.endsWith('.md') ? ruleFile : `${base}.md`,
		body: content,
	};
}

/** @param {string} base kebab-case rule stem */
function markdownToMdc(mdContent, base) {
	if (/^\s*---[\s\S]*?---/.test(mdContent)) return mdContent;

	const title = base
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

	return `---
description: ${title} (aka-kit preset)
alwaysApply: true
---

${mdContent.trimStart()}`;
}

/**
 * Rules directory under config dir — always `rules/` for all platforms.
 * Cursor reads `.cursor/rules/*.mdc`; Claude reads `.claude/rules/*.md`.
 */
export function ruleInstallPath(targetDir, dstName) {
	return path.join(targetDir, 'rules', dstName);
}

/** Whether preset artifact class should install for this platform. */
export function shouldInstallArtifact(kind, platform) {
	const profile = getPlatformProfile(platform);
	switch (kind) {
		case 'skills':
			return true;
		case 'rules':
			return profile.installRules !== false;
		case 'hooks':
			return profile.supportsHooks;
		case 'templates':
			return true;
		default:
			return true;
	}
}

/** Whether settings.json merge applies (Claude hooks/plugins only). */
export function shouldMergeSettings(platform) {
	return getPlatformProfile(platform).supportsClaudeSettings;
}

/** Claude Code permissions block — not used by Cursor/Codex. */
export function shouldMergePermissions(platform) {
	return getPlatformProfile(platform).supportsPermissions;
}
