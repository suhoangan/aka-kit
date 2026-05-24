import prompts from 'prompts';
import { getAvailablePresets } from './preset-resolver.js';
import { presetToCliFlag } from './preset-flags.js';

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

export async function confirmGlobalPreset() {
	const { includeGlobal } = await prompts(
		{
			type: 'confirm',
			name: 'includeGlobal',
			message: 'Also install global user-scope preset (~/.claude hooks/rules)?',
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
