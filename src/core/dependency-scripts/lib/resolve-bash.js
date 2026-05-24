import fs from 'fs-extra';
import { whichBin } from '../../doctor-checks/utils.js';

const GIT_BASH_PATHS = [
	'C:\\Program Files\\Git\\bin\\bash.exe',
	'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
	'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
];

const UNIX_BASH_PATHS = [
	'/bin/bash',
	'/usr/local/bin/bash',
	'/opt/homebrew/bin/bash',
];

function isWindowsAppsStub(bashPath) {
	return /\\WindowsApps\\/i.test(bashPath);
}

/** Resolve bash for curl|sh installers (Git Bash on Windows). */
export function resolveBash() {
	if (process.platform === 'win32') {
		for (const candidate of GIT_BASH_PATHS) {
			if (fs.existsSync(candidate)) return candidate;
		}
		const fromPath = whichBin('bash.exe') || whichBin('bash');
		if (fromPath && !isWindowsAppsStub(fromPath)) return fromPath;
		return null;
	}
	const fromPath = whichBin('bash');
	if (fromPath) return fromPath;
	for (const candidate of UNIX_BASH_PATHS) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}
