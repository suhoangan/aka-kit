/**
 * Bootstrap graphify — wires MCP to project + user Cursor/Claude config dirs.
 */
import fs from 'fs-extra';
import os from 'os';
import path from 'node:path';
import { mergeMcpConfig } from '../settings-merger.js';
import {
	appendGitignoreLine,
	commandExists,
	createLogger,
	gitRepoRoot,
	runOk,
} from './lib/script-helpers.js';
import {
	graphifyMcpImportOk,
	normalizeMcpPath,
	resolveGraphifyPythonBin,
} from './lib/resolve-python-for-mcp.js';
import {
	ensureCoreToolchain,
	ensureGraphify,
} from './lib/prereq-installers.js';
import { getPlatformProfile } from '../../platform-profiles.js';

const { log, warn } = createLogger('graphify');

const scope = process.env.AKAKIT_SCOPE || 'project';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const targetDir = process.env.AKAKIT_TARGET_DIR || '';
const profile = getPlatformProfile(platform);

ensureCoreToolchain();

if (scope === 'global') {
	log(`skipping project graphify on global ${profile.configDir} install`);
	process.exit(0);
}

if (profile.mcpFormat === 'toml') {
	log(`skipping graphify MCP wiring for ${profile.label}`);
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
		'graphify CLI missing — run: uv tool install "graphify[mcp]" or aka-kit install',
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

if (platform === 'cursor') {
	log('installing Cursor graphify rule (.cursor/rules/graphify.mdc)…');
	runOk('graphify', ['cursor', 'install'], { cwd: repo, stdio: 'inherit' });
}

const py = resolveGraphifyPythonBin();
if (!py) {
	warn(
		'no working Python — skip graphify MCP (avoid Windows Store python stub)',
	);
	process.exit(0);
}

if (!graphifyMcpImportOk(py)) {
	warn(
		'graphify [mcp] extra missing — uv tool install "graphify[mcp]" --force',
	);
	process.exit(0);
}

const alias = path.basename(repo);
const mcpEntry = {
	[`graphify-${alias}`]: {
		type: 'stdio',
		command: normalizeMcpPath(py),
		args: ['-m', 'graphify.serve', normalizeMcpPath(graphJson)],
	},
};

const dirs = new Set();
if (targetDir) dirs.add(targetDir);
if (platform === 'cursor') {
	dirs.add(path.join(os.homedir(), '.cursor'));
}
if (platform === 'claude') {
	dirs.add(path.join(os.homedir(), '.claude'));
}

for (const dir of dirs) {
	fs.ensureDirSync(dir);
	mergeMcpConfig(dir, mcpEntry);
	log(
		`MCP wired (${profile.label}): graphify-${alias} → ${path.join(dir, '.mcp.json')}`,
	);
}

process.exit(0);
