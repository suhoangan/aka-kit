/**
 * Cross-platform code-review-graph bootstrap (replaces auto-graph-init.sh).
 * Quiet, fail-soft — matches setup.sh --quiet without graphify.
 */
import fs from 'fs-extra';
import path from 'node:path';
import {
	appendGitignoreLine,
	commandExists,
	createLogger,
	gitRepoRoot,
	runOk,
} from './lib/script-helpers.js';
import {
	ensureCodeReviewGraph,
	ensureCoreToolchain,
} from './lib/prereq-installers.js';
import { getPlatformProfile } from '../../platform-profiles.js';

const { warn, log } = createLogger('graph-init');

const scope = process.env.AKAKIT_SCOPE || 'project';
const platform = (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase();
const profile = getPlatformProfile(platform);

if (scope === 'global') {
	log(`skipping graph-init on global ${profile.configDir} install`);
	process.exit(0);
}

ensureCoreToolchain();

const repo = gitRepoRoot();
if (!repo) {
	warn('not a git repo — skipping graph init');
	process.exit(0);
}

if (!commandExists('code-review-graph')) {
	ensureCodeReviewGraph();
}
if (!commandExists('code-review-graph')) {
	warn(
		"missing 'code-review-graph' CLI — skipping. Install: pipx install code-review-graph",
	);
	process.exit(0);
}

if (
	!runOk('code-review-graph', ['build'], {
		cwd: repo,
		stdio: 'ignore',
	})
) {
	warn('code-review-graph build failed — skipping');
	process.exit(0);
}

const alias = path.basename(repo);
runOk('code-review-graph', ['register', repo, '--alias', alias], {
	cwd: repo,
	stdio: 'ignore',
});

appendGitignoreLine(path.join(repo, '.gitignore'), '.code-review-graph/');

const huskyMeta = path.join(repo, '.husky', '_');
if (fs.existsSync(huskyMeta)) {
	for (const hook of ['post-commit', 'post-checkout']) {
		const hookPath = path.join(repo, '.husky', hook);
		const delegate = `[ -x "$HOME/.config/git/hooks/${hook}" ]`;
		const body = `#!/usr/bin/env sh
${delegate} && "$HOME/.config/git/hooks/${hook}" "$@"
exit 0
`;
		const existing = fs.existsSync(hookPath)
			? fs.readFileSync(hookPath, 'utf8')
			: '';
		if (!existing.includes(`config/git/hooks/${hook}`)) {
			fs.writeFileSync(hookPath, body);
			if (process.platform !== 'win32') fs.chmodSync(hookPath, 0o755);
		}
	}
}

process.exit(0);
