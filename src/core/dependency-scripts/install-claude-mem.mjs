/**
 * Install claude-mem for Claude Code and/or Cursor (non-interactive).
 */
import os from 'node:os';
import { augmentToolPath, createLogger, runOk } from './lib/script-helpers.js';
import { ensureBun, ensureUv } from './lib/prereq-installers.js';

const { log, warn } = createLogger('claude-mem');
const VERSION = process.env.AKAKIT_CLAUDE_MEM_VERSION || '13.3.0';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const scope = process.env.AKAKIT_SCOPE || 'project';

if (platform === 'codex') {
	log('skipping claude-mem for codex platform');
	process.exit(0);
}

ensureUv();
ensureBun();
augmentToolPath();

const ide = platform === 'cursor' ? 'cursor' : 'claude-code';
const installCwd = scope === 'global' ? os.homedir() : process.cwd();

log(`installing claude-mem@${VERSION} for ${ide} (${scope})…`);

const npmArgs = [
	'exec',
	'--yes',
	`--package=claude-mem@${VERSION}`,
	'--',
	'claude-mem',
	'install',
	'--ide',
	ide,
	'--no-auto-start',
];
if (ide === 'cursor') npmArgs.push('--provider', 'gemini');

if (!runOk('npm', npmArgs, { cwd: installCwd, stdio: 'inherit' })) {
	warn(
		`claude-mem install failed — run: npm exec --package=claude-mem@${VERSION} -- claude-mem install --ide ${ide}`,
	);
	process.exit(0);
}

log('claude-mem installed — restart Cursor/Claude Code to load hooks');

const startArgs = [
	'exec',
	'--yes',
	`--package=claude-mem@${VERSION}`,
	'--',
	'claude-mem',
	'start',
];
if (!runOk('npm', startArgs, { stdio: 'ignore', timeout: 45_000 })) {
	warn(
		'start worker manually: npm exec --package=claude-mem -- claude-mem start',
	);
}

process.exit(0);
