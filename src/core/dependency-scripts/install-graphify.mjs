/**
 * Bootstrap graphify knowledge graph for the project (per graphify docs).
 * 1. graphify update .  (incremental build → graphify-out/)
 * 2. gitignore graphify-out/
 * 3. Wire graphify MCP into target .mcp.json when graph.json exists
 *
 * Skips on global install (graphify is per-repo).
 */
import fs from 'fs-extra';
import path from 'node:path';
import { mergeMcpConfig } from '../settings-merger.js';
import {
	appendGitignoreLine,
	commandExists,
	createLogger,
	gitRepoRoot,
	resolvePythonBin,
	runOk,
} from './lib/script-helpers.js';
import {
	ensureCoreToolchain,
	ensureGraphify,
} from './lib/prereq-installers.js';

const { log, warn } = createLogger('graphify');

const scope = process.env.AKAKIT_SCOPE || 'project';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const targetDir = process.env.AKAKIT_TARGET_DIR || '';

ensureCoreToolchain();

if (scope === 'global') {
	log('skipping project graphify bootstrap (global install)');
	process.exit(0);
}

if (platform === 'codex') {
	log(
		'skipping graphify MCP wiring for codex (use code-review-graph TOML separately)',
	);
	process.exit(0);
}

const repo = gitRepoRoot();
if (!repo) {
	warn('not a git repo — skipping graphify bootstrap');
	process.exit(0);
}

if (!commandExists('graphify')) ensureGraphify();
if (!commandExists('graphify')) {
	warn(
		'graphify CLI missing — run aka-kit install or: pipx install graphify[mcp]',
	);
	process.exit(0);
}

appendGitignoreLine(path.join(repo, '.gitignore'), 'graphify-out/');

log('building graphify knowledge graph (graphify update .)…');
let built = runOk('graphify', ['update', '.'], {
	cwd: repo,
	stdio: 'inherit',
	timeout: 600_000,
});
if (!built) {
	log('retry with graphify . …');
	built = runOk('graphify', ['.'], {
		cwd: repo,
		stdio: 'inherit',
		timeout: 600_000,
	});
}
if (!built) {
	warn('graphify build failed — run manually: graphify .');
	process.exit(0);
}

const graphJson = path.join(repo, 'graphify-out', 'graph.json');
if (!fs.existsSync(graphJson)) {
	warn('graphify-out/graph.json not found after build');
	process.exit(0);
}

if (targetDir && fs.existsSync(path.dirname(targetDir))) {
	const alias = path.basename(repo);
	const py = resolvePythonBin();
	if (!py) {
		warn('python not found — skip graphify MCP wiring');
		process.exit(0);
	}
	mergeMcpConfig(targetDir, {
		[`graphify-${alias}`]: {
			type: 'stdio',
			command: py,
			args: ['-m', 'graphify.serve', graphJson],
		},
	});
	log(`MCP wired: graphify-${alias} → ${graphJson}`);
}

process.exit(0);
