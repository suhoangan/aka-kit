import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { resolvePresets, getAvailablePresets } from './preset-resolver.js';
import { presetToCliFlag } from './preset-flags.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = path.join(__dirname, '..', 'presets');

/** Normalize user input → skill directory slug (aka-foo). */
export function normalizeSkillSlug(input) {
	let s = input.trim();
	if (s.startsWith('aka:')) s = `aka-${s.slice(4)}`;
	else if (!s.startsWith('aka-')) s = `aka-${s}`;
	return s;
}

function readSkillMeta(skillDir) {
	const skillPath = path.join(skillDir, 'SKILL.md');
	if (!fs.existsSync(skillPath)) return { description: '' };
	const raw = fs.readFileSync(skillPath, 'utf8');
	const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!m) return { description: '' };
	const name = m[1].match(/^name:\s*(.+)$/m)?.[1]?.trim() || '';
	const description =
		m[1]
			.match(/^description:\s*(.+)$/m)?.[1]
			?.trim()
			.replace(/^["']|["']$/g, '') || '';
	return { name, description };
}

/**
 * Build searchable catalog of presets, skills, rules.
 */
export function buildCatalog() {
	const skills = new Map();
	const rules = new Map();
	const presetEntries = [];

	const dirs = fs.readdirSync(PRESETS_DIR, { withFileTypes: true });
	for (const dir of dirs) {
		if (!dir.isDirectory()) continue;
		const presetFile = path.join(PRESETS_DIR, dir.name, 'preset.json');
		if (!fs.existsSync(presetFile)) continue;

		const preset = fs.readJsonSync(presetFile);
		preset._dir = path.join(PRESETS_DIR, dir.name);
		presetEntries.push(preset);

		for (const skillSlug of preset.artifacts?.skills || []) {
			if (skills.has(skillSlug)) continue;
			const skillDir = path.join(preset._dir, 'skills', skillSlug);
			const meta = readSkillMeta(skillDir);
			skills.set(skillSlug, {
				slug: skillSlug,
				name: meta.name || skillSlug.replace(/^aka-/, 'aka:'),
				description: meta.description,
				preset: preset.name,
				path: skillDir,
			});
		}

		for (const ruleFile of preset.artifacts?.rules || []) {
			if (rules.has(ruleFile)) continue;
			rules.set(ruleFile, {
				file: ruleFile,
				preset: preset.name,
				path: path.join(preset._dir, 'rules', ruleFile),
			});
		}
	}

	return {
		presets: getAvailablePresets(),
		skills: [...skills.values()],
		rules: [...rules.values()],
	};
}

export function findSkill(query) {
	const slug = normalizeSkillSlug(query);
	const catalog = buildCatalog();
	return catalog.skills.find((s) => s.slug === slug) || null;
}

/** Resolved preset chain summary for `aka-kit info`. */
export function getPresetInfo(presetName) {
	const chain = resolvePresets(presetName);
	const main = chain[chain.length - 1];
	const skills = [];
	const rules = [];
	const hooks = [];
	const templates = [];
	const seen = {
		skills: new Set(),
		rules: new Set(),
		hooks: new Set(),
		templates: new Set(),
	};

	for (const p of chain) {
		for (const s of p.artifacts?.skills || []) {
			if (!seen.skills.has(s)) {
				seen.skills.add(s);
				skills.push(s);
			}
		}
		for (const r of p.artifacts?.rules || []) {
			if (!seen.rules.has(r)) {
				seen.rules.add(r);
				rules.push(r);
			}
		}
		for (const h of p.artifacts?.hooks || []) {
			if (!seen.hooks.has(h)) {
				seen.hooks.add(h);
				hooks.push(h);
			}
		}
		for (const t of p.artifacts?.templates || []) {
			if (!seen.templates.has(t)) {
				seen.templates.add(t);
				templates.push(t);
			}
		}
	}

	const mcp = chain.reduce((acc, p) => ({ ...acc, ...(p.mcp || {}) }), {});
	const plugins = main.settings?.enabledPlugins || {};
	const deps = [
		...new Set(chain.flatMap((p) => p.dependencies?.scripts || [])),
	];

	return {
		name: main.name,
		description: main.description,
		cliFlag: presetToCliFlag(main.name),
		includes: main.includes || [],
		chain: chain.map((p) => p.name),
		skills,
		rules,
		hooks,
		templates,
		mcp: Object.keys(mcp),
		plugins: Object.keys(plugins),
		dependencyScripts: deps,
		permissions: chain.flatMap((p) => p.permissions?.allow || []),
	};
}

export function searchCatalog(term) {
	const q = term.toLowerCase();
	const catalog = buildCatalog();
	const hits = { presets: [], skills: [], rules: [] };

	for (const p of catalog.presets) {
		if (
			p.name.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q)
		) {
			hits.presets.push(p);
		}
	}
	for (const s of catalog.skills) {
		if (
			s.slug.toLowerCase().includes(q) ||
			s.name.toLowerCase().includes(q) ||
			s.description.toLowerCase().includes(q)
		) {
			hits.skills.push(s);
		}
	}
	for (const r of catalog.rules) {
		if (r.file.toLowerCase().includes(q)) {
			hits.rules.push(r);
		}
	}
	return hits;
}
