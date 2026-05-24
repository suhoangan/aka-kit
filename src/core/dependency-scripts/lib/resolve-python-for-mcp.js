import fs from 'fs-extra';
import path from 'node:path';
import os from 'os';
import { spawnSync } from 'node:child_process';
import {
	augmentToolPath,
	commandExists,
	resolveCmd,
	runOk,
} from './script-helpers.js';

const isWin = process.platform === 'win32';

export function isWindowsAppsStub(binPath) {
	return /\\WindowsApps\\/i.test(binPath || '');
}

/** True if interpreter runs a minimal import check. */
export function pythonWorks(binPath) {
	if (!binPath || !fs.existsSync(binPath)) return false;
	if (isWindowsAppsStub(binPath)) return false;
	return runOk(binPath, ['-c', 'import sys; print(sys.executable)'], {
		stdio: 'ignore',
	});
}

/** MCP configs on Windows: prefer forward slashes in JSON. */
export function normalizeMcpPath(absPath) {
	return absPath.replace(/\\/g, '/');
}

function uvToolDir(toolName) {
	if (!commandExists('uv')) return null;
	augmentToolPath();
	const uv = resolveCmd('uv') || 'uv';
	const res = spawnSync(uv, ['tool', 'dir', toolName], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	if (res.status !== 0 || !res.stdout?.trim()) return null;
	return res.stdout.trim();
}

function uvToolPython(toolName) {
	const root = uvToolDir(toolName);
	if (!root) return null;
	const candidates = isWin
		? [path.join(root, 'Scripts', 'python.exe'), path.join(root, 'python.exe')]
		: [path.join(root, 'bin', 'python3'), path.join(root, 'bin', 'python')];
	for (const c of candidates) {
		if (pythonWorks(c)) return c;
	}
	return null;
}

function uvPythonFind() {
	if (!commandExists('uv')) return null;
	augmentToolPath();
	const uv = resolveCmd('uv') || 'uv';
	const res = spawnSync(uv, ['python', 'find'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	if (res.status !== 0 || !res.stdout?.trim()) return null;
	const c = res.stdout.trim();
	return pythonWorks(c) ? c : null;
}

function programsPython() {
	if (!isWin) return null;
	const home = process.env.USERPROFILE || os.homedir();
	const pyRoot = path.join(home, 'AppData', 'Local', 'Programs', 'Python');
	if (!fs.existsSync(pyRoot)) return null;
	for (const dir of fs.readdirSync(pyRoot)) {
		const exe = path.join(pyRoot, dir, 'python.exe');
		if (pythonWorks(exe)) return exe;
	}
	return null;
}

/**
 * Resolve Python for graphify MCP — avoids WindowsApps store stub.
 * Prefers uv tool env (graphify), then uv python find, then real python.exe.
 */
export function resolveGraphifyPythonBin() {
	augmentToolPath();

	const fromTool = uvToolPython('graphify');
	if (fromTool) return fromTool;

	const fromUv = uvPythonFind();
	if (fromUv) return fromUv;

	const fromPrograms = programsPython();
	if (fromPrograms) return fromPrograms;

	for (const name of isWin
		? ['py', 'python', 'python3']
		: ['python3', 'python']) {
		const cmd = resolveCmd(name);
		if (cmd && pythonWorks(cmd)) return cmd;
	}

	return null;
}

/** graphify MCP extra installed? */
export function graphifyMcpImportOk(pythonBin) {
	if (!pythonBin) return false;
	return runOk(pythonBin, ['-c', 'import mcp; import graphify.serve'], {
		stdio: 'ignore',
		timeout: 60_000,
	});
}

/** Resolve .mcp.json path: project target → ~/.cursor → ~/.claude.json */
export function resolveMcpConfigPaths(targetDir, platform) {
	const paths = [];
	if (targetDir && fs.existsSync(targetDir)) {
		paths.push(path.join(targetDir, '.mcp.json'));
	}
	const home = os.homedir();
	if (platform === 'cursor' || fs.existsSync(path.join(home, '.cursor'))) {
		paths.push(path.join(home, '.cursor', '.mcp.json'));
	}
	paths.push(path.join(home, '.claude.json'));
	return [...new Set(paths)];
}
