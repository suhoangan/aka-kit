/**
 * Cross-platform RTK installer — Windows, macOS, Linux.
 */
import {
	augmentToolPath,
	commandExists,
	createLogger,
	firstLine,
	run,
	runOk,
	runSh,
} from './lib/script-helpers.js';
import { ensureCargo, ensureCoreToolchain } from './lib/prereq-installers.js';

const { log, warn } = createLogger('rtk');
const RTK_VERSION = process.env.AKAKIT_RTK_VERSION || 'v0.41.0';
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

ensureCoreToolchain();
augmentToolPath();

function rtkWorks() {
	if (!commandExists('rtk')) return false;
	return runOk('rtk', ['gain', '--help'], { stdio: 'ignore' });
}

if (rtkWorks()) {
	const ver = run('rtk', ['--version']);
	log('rtk already installed', firstLine(ver.stdout));
	process.exit(0);
}

if (commandExists('rtk')) {
	warn(
		"found 'rtk' but it doesn't support 'rtk gain' — uninstall wrong package first",
	);
	process.exit(0);
}

if (isMac && commandExists('brew') && runOk('brew', ['install', 'rtk'])) {
	const ver = run('rtk', ['--version']);
	log('installed:', firstLine(ver.stdout));
	process.exit(0);
}

const curlInstall = `curl -fsSL "https://raw.githubusercontent.com/rtk-ai/rtk/${RTK_VERSION}/install.sh" | sh`;
log('installing via curl installer…');
if (runSh(curlInstall).status === 0) {
	augmentToolPath();
	if (!commandExists('rtk')) {
		warn('rtk installed to ~/.local/bin — add it to PATH');
	} else {
		const ver = run('rtk', ['--version']);
		log('installed:', firstLine(ver.stdout));
	}
	process.exit(0);
}
warn('curl installer failed (needs Git Bash on Windows)');

if (ensureCargo()) {
	augmentToolPath();
	if (
		runOk('cargo', [
			'install',
			'--git',
			'https://github.com/rtk-ai/rtk',
			'--tag',
			RTK_VERSION,
		])
	) {
		const ver = run('rtk', ['--version']);
		log('installed via cargo:', firstLine(ver.stdout));
		process.exit(0);
	}
}

warn('could not install rtk automatically. Install manually:');
if (isMac) warn('  macOS:  brew install rtk');
if (isWin) warn('  Windows: install Git Bash + re-run, or: cargo install …');
warn(
	`  Cargo:  cargo install --git https://github.com/rtk-ai/rtk --tag ${RTK_VERSION}`,
);
process.exit(0);
