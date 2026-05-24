#!/usr/bin/env node
/** Shared helpers for aka-kit project hooks — zero deps beyond Node builtins. */
const fs = require('fs');

function readStdinJson() {
	const input = fs.readFileSync(0, 'utf8').trim();
	if (!input) return null;
	try {
		return JSON.parse(input);
	} catch {
		return null;
	}
}

function failOpen(fn) {
	try {
		fn();
	} catch {
		process.exit(0);
	}
}

function projectRoot(payload) {
	if (payload?.cwd && typeof payload.cwd === 'string') return payload.cwd;
	return process.cwd();
}

function editedFilePath(payload) {
	const input = payload?.tool_input || {};
	return input.file_path || input.path || input.filePath || null;
}

function readPackageJson(root) {
	const file = require('path').join(root, 'package.json');
	if (!fs.existsSync(file)) return null;
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

module.exports = {
	readStdinJson,
	failOpen,
	projectRoot,
	editedFilePath,
	readPackageJson,
};
