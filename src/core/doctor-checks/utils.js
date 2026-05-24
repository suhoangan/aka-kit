import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * Cross-platform `which`. Returns absolute path to binary or null.
 * On Windows, honours PATHEXT to try .EXE / .CMD / .BAT extensions.
 */
export function whichBin(name) {
	const isWin = process.platform === 'win32';
	const exts = isWin
		? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM')
			.split(';')
			.filter(Boolean)
		: [''];
	const paths = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
	for (const p of paths) {
		for (const ext of exts) {
			// On Windows the bare name may also already have an extension — try both.
			const candidates = isWin && /\.[a-z0-9]+$/i.test(name)
				? [path.join(p, name)]
				: [path.join(p, name + ext)];
			for (const full of candidates) {
				try {
					if (fs.existsSync(full) && fs.statSync(full).isFile()) {
						return full;
					}
				} catch {
					// ignore EACCES / ENOENT
				}
			}
		}
	}
	return null;
}

/**
 * Run `<bin> <args>` with a timeout. Returns { ok, stdout, stderr, code }.
 * `shell: false` to avoid shell injection. `timeout` in ms.
 */
export function runBin(bin, args = [], { timeout = 5000 } = {}) {
	try {
		const res = spawnSync(bin, args, {
			timeout,
			encoding: 'utf8',
			shell: false,
		});
		return {
			ok: res.status === 0,
			stdout: (res.stdout || '').trim(),
			stderr: (res.stderr || '').trim(),
			code: res.status,
			signal: res.signal,
		};
	} catch (err) {
		return { ok: false, stdout: '', stderr: err.message, code: -1 };
	}
}

/**
 * Try fetching a URL with HEAD; falls back to GET. Returns true if 2xx/3xx.
 * Uses global fetch (Node 18+). Timeout via AbortController.
 */
export async function reachable(url, { timeout = 3000 } = {}) {
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), timeout);
	try {
		let res = await fetch(url, { method: 'HEAD', signal: controller.signal });
		if (res.status === 405 || res.status === 501) {
			res = await fetch(url, { method: 'GET', signal: controller.signal });
		}
		return res.status >= 200 && res.status < 400;
	} catch {
		return false;
	} finally {
		clearTimeout(t);
	}
}

/**
 * Parse SKILL.md frontmatter (YAML between leading `---` markers).
 * Returns { name, description, raw } or null on failure.
 */
export function parseSkillFrontmatter(filePath) {
	try {
		const text = fs.readFileSync(filePath, 'utf8');
		const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
		if (!match) return null;
		const block = match[1];
		const get = (key) => {
			const m = block.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm'));
			return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
		};
		return {
			name: get('name'),
			description: get('description'),
			raw: block,
		};
	} catch {
		return null;
	}
}

/**
 * Build a check result object — central shape used by renderer.
 */
export function result(category, name, status, detail, fix) {
	return { category, name, status, detail, fix };
}
