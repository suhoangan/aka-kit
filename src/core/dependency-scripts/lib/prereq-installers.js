import {
	augmentToolPath,
	commandExists,
	createLogger,
	resolvePython,
	runOk,
	runPowerShell,
	runSh,
} from './script-helpers.js';

const { log, warn } = createLogger('prereq');
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

export function ensureUv() {
	augmentToolPath();
	if (commandExists('uv')) return true;
	log('installing uv…');
	if (isWin) {
		runPowerShell('irm https://astral.sh/uv/install.ps1 | iex');
	} else {
		runSh('curl -LsSf https://astral.sh/uv/install.sh | sh');
	}
	augmentToolPath();
	if (commandExists('uv')) {
		log('uv installed');
		return true;
	}
	warn('uv install failed — serena MCP and spec-kit need uv');
	return false;
}

export function ensureBun() {
	augmentToolPath();
	if (commandExists('bun')) return true;
	log('installing bun (claude-mem worker)…');
	if (isWin) {
		runPowerShell('irm bun.sh/install.ps1 | iex');
	} else {
		runSh('curl -fsSL https://bun.sh/install | bash');
	}
	augmentToolPath();
	if (commandExists('bun')) {
		log('bun installed');
		return true;
	}
	warn('bun install failed — claude-mem worker may not start');
	return false;
}

export function ensurePython() {
	augmentToolPath();
	if (resolvePython()) return true;
	log('installing Python 3.12…');
	if (isWin && commandExists('winget')) {
		runOk('winget', [
			'install',
			'-e',
			'--id',
			'Python.Python.3.12',
			'--accept-package-agreements',
			'--accept-source-agreements',
			'--silent',
		]);
	} else if (isMac && commandExists('brew')) {
		runOk('brew', ['install', 'python@3.12']);
	} else if (!isWin) {
		runSh('curl -LsSf https://astral.sh/uv/install.sh | sh');
		if (commandExists('uv')) {
			runOk('uv', ['python', 'install', '3.12']);
		}
	} else {
		warn('install Python 3.12+ manually: https://www.python.org/downloads/');
		return false;
	}
	augmentToolPath();
	return Boolean(resolvePython());
}

export function ensurePip() {
	augmentToolPath();
	const py = resolvePython();
	if (!py) return false;
	if (runOk(py, ['-m', 'pip', '--version'])) return true;
	log('bootstrapping pip…');
	runOk(py, ['-m', 'ensurepip', '--upgrade']);
	runOk(py, ['-m', 'pip', 'install', '--upgrade', 'pip']);
	return runOk(py, ['-m', 'pip', '--version']);
}

export function ensurePipx() {
	augmentToolPath();
	if (commandExists('pipx')) return true;

	if (isMac && commandExists('brew')) {
		log('installing pipx via Homebrew…');
		if (runOk('brew', ['install', 'pipx']) && runOk('pipx', ['ensurepath'])) {
			augmentToolPath();
			return commandExists('pipx');
		}
	}

	if (!resolvePython() && !ensurePython()) return false;
	if (!ensurePip()) return false;

	const py = resolvePython();
	log('installing pipx via pip…');
	const attempts = isWin
		? [
				['-3', '-m', 'pip', 'install', '--user', 'pipx'],
				['-m', 'pip', 'install', '--user', 'pipx'],
			]
		: [['-m', 'pip', 'install', '--user', 'pipx']];
	let installed = false;
	for (const args of attempts) {
		if (runOk(py, args)) {
			installed = true;
			break;
		}
	}
	if (!installed) {
		warn('pip install pipx failed');
		return false;
	}
	runOk(
		py,
		isWin ? ['-3', '-m', 'pipx', 'ensurepath'] : ['-m', 'pipx', 'ensurepath'],
	);
	if (
		!runOk(
			py,
			isWin ? ['-3', '-m', 'pipx', '--version'] : ['-m', 'pipx', '--version'],
		)
	) {
		runOk(py, ['-m', 'pipx', 'ensurepath']);
	}
	augmentToolPath();
	if (commandExists('pipx')) {
		log('pipx installed');
		return true;
	}
	warn('pipx not on PATH — restart terminal or add Python Scripts to PATH');
	return false;
}

export function ensureCargo() {
	augmentToolPath();
	if (commandExists('cargo')) return true;
	log('installing Rust (cargo)…');
	if (isWin && commandExists('winget')) {
		runOk('winget', [
			'install',
			'-e',
			'--id',
			'Rustlang.Rustup',
			'--accept-package-agreements',
			'--accept-source-agreements',
			'--silent',
		]);
	} else if (isMac && commandExists('brew')) {
		runOk('brew', ['install', 'rust']);
	} else {
		runSh('curl -fsSL https://sh.rustup.rs | sh -s -- -y');
	}
	augmentToolPath();
	if (commandExists('cargo')) {
		log('cargo installed');
		return true;
	}
	warn('cargo install failed — rtk/agent-browser may need Rust');
	return false;
}

export function ensureCodeReviewGraph() {
	augmentToolPath();
	if (commandExists('code-review-graph')) return true;

	log('installing code-review-graph…');
	if (
		commandExists('pipx') &&
		runOk('pipx', ['install', 'code-review-graph'])
	) {
		augmentToolPath();
		return commandExists('code-review-graph');
	}
	if (
		commandExists('uv') &&
		runOk('uv', ['tool', 'install', 'code-review-graph'])
	) {
		augmentToolPath();
		return commandExists('code-review-graph');
	}
	const py = resolvePython();
	if (
		py &&
		ensurePip() &&
		runOk(py, ['-m', 'pip', 'install', '--user', 'code-review-graph'])
	) {
		augmentToolPath();
		return commandExists('code-review-graph');
	}

	warn(
		'code-review-graph install failed — run: pipx install code-review-graph',
	);
	return false;
}

export function ensureUvx() {
	augmentToolPath();
	if (commandExists('uvx')) return true;
	return ensureUv() && commandExists('uvx');
}

/** Install all recommended toolchain deps (idempotent). */
export function ensurePrerequisites() {
	const uv = ensureUv();
	const bun = ensureBun();
	const pipx = ensurePipx();
	const crg = ensureCodeReviewGraph();
	const cargo = ensureCargo();
	ensureUvx();
	return { uv, bun, pipx, crg, cargo };
}
