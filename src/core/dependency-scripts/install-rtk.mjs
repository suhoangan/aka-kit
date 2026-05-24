/**
 * Cross-platform RTK installer (replaces scripts/install-rtk.sh).
 * Idempotent — always exits 0 so aka-kit install never fails.
 */
import {
	commandExists,
	createLogger,
	firstLine,
	run,
	runOk,
} from './lib/script-helpers.js';

const { log, warn } = createLogger('rtk');
const RTK_VERSION = process.env.AKAKIT_RTK_VERSION || 'v0.41.0';

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

const isMac = process.platform === 'darwin';

if (isMac && commandExists('brew') && runOk('brew', ['install', 'rtk'])) {
	const ver = run('rtk', ['--version']);
	log('installed:', firstLine(ver.stdout));
	process.exit(0);
}

if (commandExists('curl') && process.platform !== 'win32') {
	log('installing via curl installer…');
	if (
		runOk(
			'sh',
			[
				'-c',
				`curl -fsSL "https://raw.githubusercontent.com/rtk-ai/rtk/${RTK_VERSION}/install.sh" | sh`,
			],
			{ stdio: 'inherit' },
		)
	) {
		if (!commandExists('rtk')) {
			warn('rtk installed to ~/.local/bin — add it to PATH');
		} else {
			const ver = run('rtk', ['--version']);
			log('installed:', firstLine(ver.stdout));
		}
		process.exit(0);
	}
	warn('curl installer failed');
}

if (
	commandExists('cargo') &&
	runOk('cargo', [
		'install',
		'--git',
		'https://github.com/rtk-ai/rtk',
		'--tag',
		RTK_VERSION,
	])
) {
	const ver = run('rtk', ['--version']);
	log('installed:', firstLine(ver.stdout));
	process.exit(0);
}

warn('could not install rtk automatically. Install manually:');
if (isMac) warn('  macOS:  brew install rtk');
if (process.platform !== 'win32') {
	warn(
		`  Linux:  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/${RTK_VERSION}/install.sh | sh`,
	);
}
warn(
	`  Cargo:  cargo install --git https://github.com/rtk-ai/rtk --tag ${RTK_VERSION}`,
);
if (process.platform === 'win32') {
	warn('  Windows: cargo install (Rust) or see https://github.com/rtk-ai/rtk');
}
process.exit(0);
