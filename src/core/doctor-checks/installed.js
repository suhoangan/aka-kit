import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseSkillFrontmatter, result } from './utils.js';
import { DOCTOR_ENV_VARS } from '../env-requirements.js';
import { parseEnvFile } from '../env-setup.js';

/**
 * Install directories the doctor inspects.
 */
function installDirs() {
	const home = os.homedir();
	const cwd = process.cwd();
	return [
		{ label: 'claude (project)', dir: path.join(cwd, '.claude') },
		{ label: 'claude (global)', dir: path.join(home, '.claude') },
		{ label: 'cursor (project)', dir: path.join(cwd, '.cursor') },
		{ label: 'cursor (global)', dir: path.join(home, '.cursor') },
		{ label: 'codex (project)', dir: path.join(cwd, '.codex') },
		{ label: 'codex (global)', dir: path.join(home, '.codex') },
	];
}

/**
 * Walk every install dir's skills/ folder. For each skill, validate SKILL.md
 * has the required frontmatter fields (name, description).
 */
export function checkSkills() {
	const results = [];
	for (const loc of installDirs()) {
		const skillsDir = path.join(loc.dir, 'skills');
		if (!fs.existsSync(skillsDir)) continue;
		let total = 0;
		let bad = 0;
		const badNames = [];
		const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			total++;
			const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
			if (!fs.existsSync(skillFile)) {
				bad++;
				badNames.push(`${entry.name} (no SKILL.md)`);
				continue;
			}
			const fm = parseSkillFrontmatter(skillFile);
			if (!fm || !fm.name || !fm.description) {
				bad++;
				badNames.push(`${entry.name} (bad frontmatter)`);
			}
		}
		if (total === 0) continue;
		if (bad === 0) {
			results.push(
				result('Skills', loc.label, 'ok', `${total} skill(s) valid`),
			);
		} else {
			results.push(
				result(
					'Skills',
					loc.label,
					'warn',
					`${bad}/${total} skill(s) invalid: ${badNames.join('; ')}`,
					`Edit SKILL.md frontmatter to add name: and description:`,
				),
			);
		}
	}
	if (results.length === 0) {
		results.push(
			result(
				'Skills',
				'no installs found',
				'skip',
				'Run `aka-kit install --<preset>` to install',
			),
		);
	}
	return results;
}

/**
 * Detect orphan permissions: Skill(aka:foo) declared in settings.json allow-list
 * but the corresponding skill directory doesn't exist.
 */
export function checkPermissions() {
	const results = [];
	for (const loc of installDirs()) {
		const settingsFile = path.join(loc.dir, 'settings.json');
		if (!fs.existsSync(settingsFile)) continue;
		let allow;
		try {
			const parsed = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
			allow = parsed?.permissions?.allow || [];
		} catch (err) {
			results.push(
				result(
					'Permissions',
					loc.label,
					'error',
					`settings.json parse failed: ${err.message}`,
				),
			);
			continue;
		}
		const skillsDir = path.join(loc.dir, 'skills');
		const installedSkills = fs.existsSync(skillsDir)
			? new Set(
					fs
						.readdirSync(skillsDir, { withFileTypes: true })
						.filter((e) => e.isDirectory())
						.map((e) => e.name),
				)
			: new Set();
		const orphans = [];
		for (const perm of allow) {
			const m = perm.match(/^Skill\(([^)]+)\)$/);
			if (!m) continue;
			const slug = m[1];
			// Try both colon-form (aka:foo → aka-foo) and flat form (foo → foo).
			const colonDir = slug.replace(':', '-');
			if (!installedSkills.has(colonDir) && !installedSkills.has(slug)) {
				orphans.push(perm);
			}
		}
		if (orphans.length === 0) {
			results.push(
				result(
					'Permissions',
					loc.label,
					'ok',
					`${allow.length} permission(s), 0 orphans`,
				),
			);
		} else {
			results.push(
				result(
					'Permissions',
					loc.label,
					'warn',
					`${orphans.length} orphan permission(s): ${orphans.join(', ')}`,
					`Re-run "aka-kit install --<preset>" or remove orphan entries from settings.json`,
				),
			);
		}
	}
	return results;
}

/**
 * Check env vars referenced by MCP servers and install wizard.
 */
const ENV_VARS = DOCTOR_ENV_VARS;

export function checkEnvVars() {
	const results = [];
	const cwd = process.cwd();
	const dotEnv = parseEnvFile(path.join(cwd, '.env'));

	for (const ev of ENV_VARS) {
		const val = process.env[ev.name] || dotEnv[ev.name];
		if (val) {
			const masked =
				val.length > 6 ? `${val.slice(0, 3)}…${val.slice(-3)}` : '***';
			results.push(result('Env vars', ev.name, 'ok', `set (${masked})`));
		} else {
			const status = ev.level === 'required' ? 'error' : 'warn';
			results.push(result('Env vars', ev.name, status, 'not set', ev.detail));
		}
	}
	return results;
}
