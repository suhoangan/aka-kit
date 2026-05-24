/**
 * Install claude-mem for Claude Code and/or Cursor (non-interactive).
 */
import os from 'node:os';
import { augmentToolPath, createLogger, runOk } from './lib/script-helpers.js';
import { ensureCoreToolchain } from './lib/prereq-installers.js';
import { getPlatformProfile } from '../../platform-profiles.js';

const { log, warn } = createLogger('claude-mem');
const VERSION = process.env.AKAKIT_CLAUDE_MEM_VERSION || '13.3.0';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const scope = process.env.AKAKIT_SCOPE || 'project';
const profile = getPlatformProfile(platform);

if (scope === 'project') {
	log(`claude-mem is user-scope only — skipping project ${profile.configDir}`);
	process.exit(0);
}

if (!profile.supportsClaudeMem) {
	log(`skipping claude-mem for ${profile.label}`);
	process.exit(0);
}

ensureCoreToolchain();
augmentToolPath();

// claude-mem hooks are user-level (~/.cursor, ~/.claude) — always install from $HOME
const installCwd = os.homedir();

log(
	`installing claude-mem@${VERSION} for ${profile.label} (user-scope hooks)…`,
);

const ide = profile.claudeMemIde;

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
if (profile.claudeMemProvider) {
	npmArgs.push('--provider', profile.claudeMemProvider);
}

if (!runOk('npm', npmArgs, { cwd: installCwd, stdio: 'inherit' })) {
	warn(
		`claude-mem install failed — run: npm exec --package=claude-mem@${VERSION} -- claude-mem install --ide ${ide}`,
	);
	process.exit(0);
}

log(
	`claude-mem installed for ${profile.label} — restart ${profile.label} to load hooks`,
);

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
