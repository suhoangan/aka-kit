import { whichBin, runBin, result } from './utils.js';

/**
 * Node version check — required >= 18.
 */
export function checkNode() {
	const major = parseInt(process.versions.node.split('.')[0], 10);
	if (major >= 18) {
		return [result('Runtime', `Node.js v${process.versions.node}`, 'ok')];
	}
	return [
		result(
			'Runtime',
			`Node.js v${process.versions.node}`,
			'error',
			'Node 18+ required',
			'Upgrade Node via nvm / fnm / volta',
		),
	];
}

/**
 * Binaries used by aka-kit dependency scripts and MCP servers.
 * required: 'error' if missing — kit can't function.
 * recommended: 'warn' if missing — features degrade.
 * optional: skipped if missing — purely informational.
 */
const BINARIES = [
	{ name: 'node', level: 'required', detail: 'CLI runtime' },
	{ name: 'npx', level: 'required', detail: 'used by npm-based MCP servers (playwright, figma, agent-browser)' },
	{ name: 'git', level: 'required', detail: 'graph-init, husky hooks, repo detection' },
	{ name: 'rtk', level: 'recommended', detail: 'Rust Token Killer — saves 60–90% tokens', fix: 'scripts/install-rtk.sh' },
	{ name: 'code-review-graph', level: 'recommended', detail: 'structural code graph MCP', fix: 'pipx install code-review-graph' },
	{ name: 'pipx', level: 'recommended', detail: 'installs code-review-graph + graphify', fix: 'See https://pipx.pypa.io/stable/installation/' },
	{ name: 'uv', level: 'recommended', detail: 'installs serena MCP + spec-kit', fix: 'curl -LsSf https://astral.sh/uv/install.sh | sh' },
	{ name: 'uvx', level: 'recommended', detail: 'used to launch serena MCP', fix: 'Comes with uv' },
	{ name: 'specify', level: 'optional', detail: 'GitHub spec-kit CLI', fix: 'uv tool install specify-cli' },
	{ name: 'agent-browser', level: 'optional', detail: 'AI browser automation', fix: 'scripts/install-agent-browser.sh' },
	{ name: 'gh', level: 'optional', detail: 'GitHub CLI for PR / release flows', fix: 'https://cli.github.com/' },
	{ name: 'cargo', level: 'optional', detail: 'Rust toolchain — fallback installer for rtk / agent-browser' },
];

const MAC_ONLY = ['brew'];
const NON_WINDOWS = ['bash'];

/**
 * Check every binary the kit expects. On Windows, bash is best-effort.
 * Returns one result per binary.
 */
export function checkBinaries(opts = {}) {
	const isWin = process.platform === 'win32';
	const isMac = process.platform === 'darwin';
	const results = [];
	const list = [
		...BINARIES,
		...(isMac ? [{ name: 'brew', level: 'optional', detail: 'macOS package manager — fastest install path' }] : []),
		...(!isWin ? [{ name: 'bash', level: 'recommended', detail: 'required for dependency install scripts' }] : []),
	];

	// Windows note about bash scripts
	if (isWin) {
		results.push(
			result(
				'Binaries',
				'bash',
				'warn',
				'Not native on Windows — dependency scripts will be skipped',
				'Use WSL or Git Bash to run install-*.sh scripts',
			),
		);
	}

	for (const b of list) {
		const found = whichBin(b.name);
		if (found) {
			const ver = runBin(b.name, ['--version'], { timeout: 3000 });
			const verStr = ver.ok ? (ver.stdout.split('\n')[0] || '') : '';
			results.push(
				result(
					'Binaries',
					b.name,
					'ok',
					verStr ? `${verStr} (${found})` : found,
				),
			);
		} else {
			const status =
				b.level === 'required' ? 'error'
				: b.level === 'recommended' ? 'warn'
				: 'skip';
			results.push(result('Binaries', b.name, status, b.detail, b.fix));
		}
	}
	return results;
}
