import prompts from 'prompts';
import chalk from 'chalk';
import { getAvailablePresets } from './preset-resolver.js';
import { presetToCliFlag } from './preset-flags.js';
import {
	detectProjectPreset,
	presetDisplayName,
	PROJECT_PRESET_NAMES,
} from './project-detector.js';
import { getPlatformProfile } from './platform-profiles.js';
import { expandPlatform, userScopeDirsHint } from './platforms.js';

export const PLATFORM_CHOICES = [
	{
		title: 'Claude Code',
		value: 'claude',
		description: '~/.claude and <cwd>/.claude',
	},
	{
		title: 'Cursor',
		value: 'cursor',
		description: '~/.cursor and <cwd>/.cursor',
	},
	{
		title: 'OpenAI Codex CLI',
		value: 'codex',
		description: '~/.codex/config.toml + AGENTS.md',
	},
	{
		title: 'Claude + Cursor (both)',
		value: 'both',
		description: 'Legacy alias for claude+cursor',
	},
	{
		title: 'All (claude + cursor + codex)',
		value: 'all',
		description: 'Install for every supported editor',
	},
];

export async function pickPlatformInteractive() {
	const { platform } = await prompts(
		{
			type: 'select',
			name: 'platform',
			message: 'Install target?',
			choices: PLATFORM_CHOICES,
			initial: 0,
		},
		{ onCancel: () => process.exit(130) },
	);
	return platform;
}

export async function pickProjectPresetInteractive(cwd = process.cwd()) {
	const available = getAvailablePresets().filter((p) =>
		PROJECT_PRESET_NAMES.includes(p.name),
	);
	const detection = detectProjectPreset(cwd);
	const detectedIndex = detection.preset
		? available.findIndex((p) => p.name === detection.preset)
		: -1;
	const initial = detectedIndex >= 0 ? detectedIndex : 0;

	if (detection.preset) {
		const label = presetDisplayName(detection.preset);
		console.log(
			chalk.dim(
				`Auto-detected: ${chalk.cyan(label)} (${detection.reason}, ${detection.confidence} confidence)`,
			),
		);
	}

	const { preset } = await prompts(
		{
			type: 'select',
			name: 'preset',
			message: 'Project type?',
			choices: available.map((p) => ({
				title: presetDisplayName(p.name),
				value: p.name,
				description:
					p.name === detection.preset
						? `${p.description} — suggested`
						: p.description,
			})),
			initial,
		},
		{ onCancel: () => process.exit(130) },
	);
	return preset;
}

export async function pickPresetInteractive() {
	const available = getAvailablePresets();
	const { preset } = await prompts(
		{
			type: 'select',
			name: 'preset',
			message: 'Which preset?',
			choices: available.map((p) => ({
				title: p.name,
				value: p.name,
				description: p.description,
			})),
		},
		{ onCancel: () => process.exit(130) },
	);
	return preset;
}

export async function confirmGlobalPreset(platform = 'claude') {
	const dirs = userScopeDirsHint(platform);
	const detail = expandPlatform(platform)
		.map((p) => {
			const prof = getPlatformProfile(p);
			if (prof.supportsHooks) return `${prof.label}: hooks + rules`;
			if (prof.ruleFormat === 'mdc') return `${prof.label}: rules (.mdc)`;
			return `${prof.label}: rules (reference)`;
		})
		.join('; ');

	const { includeGlobal } = await prompts(
		{
			type: 'confirm',
			name: 'includeGlobal',
			message: `Also install user-scope preset (${dirs})? ${detail}`,
			initial: true,
		},
		{ onCancel: () => process.exit(130) },
	);
	return includeGlobal;
}

export async function confirmDryRun() {
	const { dryRun } = await prompts(
		{
			type: 'confirm',
			name: 'dryRun',
			message: 'Preview only (dry-run)?',
			initial: false,
		},
		{ onCancel: () => process.exit(130) },
	);
	return dryRun;
}

export function formatPresetChoice(presetName) {
	return `${presetToCliFlag(presetName)} — ${presetName}`;
}
