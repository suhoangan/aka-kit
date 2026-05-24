/**
 * Cross-platform agent-browser installer (replaces scripts/install-agent-browser.sh).
 */
import {
	commandExists,
	createLogger,
	firstLine,
	run,
	runOk,
} from './lib/script-helpers.js';

const { log, warn } = createLogger('agent-browser');
const VERSION = process.env.AKAKIT_AGENT_BROWSER_VERSION || '0.27.0';

if (commandExists('agent-browser')) {
	const ver = run('agent-browser', ['--version']);
	log('agent-browser already installed', firstLine(ver.stdout));
	process.exit(0);
}

let installed = false;
const isMac = process.platform === 'darwin';

if (isMac && commandExists('brew')) {
	log('installing via Homebrew…');
	if (runOk('brew', ['install', 'agent-browser'])) installed = true;
	else warn('brew install agent-browser failed — falling back to npm');
}

if (!installed && commandExists('npm')) {
	log('installing via npm…');
	if (runOk('npm', ['install', '-g', `agent-browser@${VERSION}`])) {
		installed = true;
	} else {
		warn('npm install -g agent-browser failed — falling back to cargo');
	}
}

if (!installed && commandExists('cargo')) {
	log('installing via cargo…');
	if (runOk('cargo', ['install', 'agent-browser'])) installed = true;
}

if (!installed) {
	warn('could not install agent-browser — install via npm, brew, or cargo');
	warn('see https://github.com/vercel-labs/agent-browser');
	process.exit(0);
}

if (commandExists('agent-browser')) {
	const ver = run('agent-browser', ['--version']);
	log('installed:', firstLine(ver.stdout));
	log('downloading Chrome for Testing (one-time)…');
	const installArgs =
		process.platform === 'linux' ? ['install', '--with-deps'] : ['install'];
	if (!runOk('agent-browser', installArgs)) {
		warn('agent-browser install failed (Chrome download)');
	}
}

process.exit(0);
