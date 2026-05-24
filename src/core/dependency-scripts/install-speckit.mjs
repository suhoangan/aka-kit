/**
 * Cross-platform spec-kit / specify CLI installer (replaces install-speckit.sh).
 */
import fs from 'fs-extra';
import path from 'node:path';
import {
	commandExists,
	createLogger,
	firstLine,
	gitRepoRoot,
	run,
	runOk,
} from './lib/script-helpers.js';
import { ensureCoreToolchain, ensureUv } from './lib/prereq-installers.js';
import { getPlatformProfile } from '../../platform-profiles.js';

const { log, warn } = createLogger('speckit');
const SPECKIT_VERSION = process.env.AKAKIT_SPECKIT_VERSION || 'v0.8.13';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const scope = process.env.AKAKIT_SCOPE || 'project';
const profile = getPlatformProfile(platform);

if (scope === 'global') {
	log(`skipping spec-kit init on user-scope ${profile.configDir} install`);
	process.exit(0);
}

ensureCoreToolchain();

const repo = gitRepoRoot();
if (!repo) {
	warn('not a git repo — skipping speckit init');
	process.exit(0);
}

const localBin =
	process.platform === 'win32'
		? path.join(process.env.USERPROFILE || '', '.local', 'bin')
		: path.join(process.env.HOME || '', '.local', 'bin');
const env = { PATH: `${localBin}${path.delimiter}${process.env.PATH || ''}` };

function runSpecify(args, opts = {}) {
	const mergedEnv = { ...env, ...opts.env };
	if (commandExists('specify')) {
		return run('specify', args, { ...opts, env: mergedEnv });
	}
	return run('uv', ['tool', 'run', 'specify-cli', ...args], {
		...opts,
		env: mergedEnv,
	});
}

function runSpecifyOk(args, opts = {}) {
	return runSpecify(args, opts).status === 0;
}

if (!commandExists('specify')) {
	if (!commandExists('uv') && !ensureUv()) {
		warn('uv not installed — required for specify CLI');
		warn(
			'  install uv: https://docs.astral.sh/uv/getting-started/installation/',
		);
		warn(
			`  then: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}`,
		);
		process.exit(0);
	}
	log('installing specify CLI via uv tool…');
	if (
		!runOk('uv', [
			'tool',
			'install',
			'specify-cli',
			'--from',
			`git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}`,
		])
	) {
		warn('uv tool install specify-cli failed — skipping');
		process.exit(0);
	}
}

if (!runSpecifyOk(['--version'])) {
	warn('specify installed but not on PATH — try: uv tool run specify-cli');
	process.exit(0);
}

const ver = runSpecify(['--version']);
log('specify version:', firstLine(ver.stdout));

if (fs.existsSync(path.join(repo, '.specify'))) {
	log('.specify/ already present — skipping init');
	process.exit(0);
}

log(
	`initializing spec-kit (${profile.label} / ${profile.specKitIntegration})…`,
);
if (
	runSpecifyOk(
		[
			'init',
			'.',
			'--here',
			'--force',
			'--integration',
			profile.specKitIntegration,
			'--ignore-agent-tools',
		],
		{ cwd: repo, stdio: 'inherit' },
	)
) {
	log(`spec-kit initialized for ${profile.label}. Slash commands available:`);
	log('  /speckit.constitution  /speckit.specify  /speckit.plan');
	log('  /speckit.tasks         /speckit.implement');
} else {
	warn(
		`specify init failed — run manually: specify init . --here --force --integration ${profile.specKitIntegration}`,
	);
}
process.exit(0);
