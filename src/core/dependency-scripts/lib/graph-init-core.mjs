/**
 * Cross-platform graph-init (code-review-graph + optional graphify).
 * Used by aka-kit install scripts, `aka-kit graph-init`, and skill setup.mjs.
 */
import fs from 'fs-extra';
import os from 'os';
import path from 'node:path';
import { mergeMcpConfig } from '../../settings-merger.js';
import { getPlatformProfile } from '../../platform-profiles.js';
import {
	appendGitignoreLine,
	commandExists,
	createLogger,
	gitRepoRoot,
	runOk,
} from './script-helpers.js';
import {
	graphifyMcpImportOk,
	normalizeMcpPath,
	resolveGraphifyPythonBin,
	resolveMcpConfigPaths,
} from './resolve-python-for-mcp.js';
import {
	ensureCodeReviewGraph,
	ensureCoreToolchain,
	ensureGraphify,
} from './prereq-installers.js';

const defaultLog = createLogger('graph-init');

/**
 * @param {string[]} argv
 */
export function parseGraphInitArgv(argv) {
	const opts = {
		withGraphify: false,
		skipCodeReviewGraph: false,
		alias: '',
		skipHusky: false,
		skipMcp: false,
		quiet: false,
		platform: (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase(),
		targetDir: process.env.AKAKIT_TARGET_DIR || '',
		scope: process.env.AKAKIT_SCOPE || 'project',
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		switch (arg) {
			case '--with-graphify':
			case '-WithGraphify':
				opts.withGraphify = true;
				break;
			case '--skip-code-review-graph':
				opts.skipCodeReviewGraph = true;
				break;
			case '--alias':
			case '-Alias':
				opts.alias = argv[++i] || '';
				break;
			case '--skip-husky':
			case '-SkipHusky':
				opts.skipHusky = true;
				break;
			case '--skip-mcp':
			case '-SkipMcp':
				opts.skipMcp = true;
				break;
			case '--quiet':
			case '-Quiet':
				opts.quiet = true;
				break;
			case '--platform':
				opts.platform = (argv[++i] || opts.platform).toLowerCase();
				break;
			case '-h':
			case '--help':
				opts.help = true;
				break;
			default:
				if (arg.startsWith('-')) {
					const err = new Error(`Unknown flag: ${arg}`);
					err.code = 2;
					throw err;
				}
		}
	}
	return opts;
}

export function printGraphInitHelp() {
	console.log(`aka-kit graph-init — wire knowledge graph(s) into the current project

Usage:
  aka-kit graph-init [options]
  node setup.mjs [options]

Options:
  --with-graphify           Also build graphify graph, Cursor rule, and MCP
  --skip-code-review-graph  graphify/MCP only (install-graphify hook)
  --alias NAME              Registry alias (default: repo folder name)
  --skip-husky              Do not add Husky hook delegates
  --skip-mcp                Skip graphify MCP wiring
  --quiet                   Less console output
  --platform claude|cursor  MCP/rule targets (default: AKAKIT_PLATFORM or claude)

Windows: use node setup.mjs or aka-kit graph-init (no Git Bash / WSL required).
`);
}

/**
 * @param {ReturnType<typeof parseGraphInitArgv>} options
 * @returns {Promise<number>} exit code
 */
export async function runGraphInit(options) {
	const log = options.quiet
		? () => {}
		: (...args) => defaultLog.log(...args);
	const warn = (...args) => defaultLog.warn(...args);

	const profile = getPlatformProfile(options.platform);

	if (options.scope === 'global' && !options.withGraphify) {
		log(`skipping graph-init on user-scope ${profile.configDir} install`);
		return 0;
	}

	const repo = gitRepoRoot();
	if (!repo) {
		warn('not a git repo — skipping graph init');
		return 0;
	}

	const alias = options.alias || path.basename(repo);
	log(`repo=${repo} alias=${alias}`);

	ensureCoreToolchain();

	if (!options.skipCodeReviewGraph) {
		if (!commandExists('code-review-graph')) {
			ensureCodeReviewGraph();
		}
		if (!commandExists('code-review-graph')) {
			warn(
				"missing 'code-review-graph' CLI — install: pipx install code-review-graph",
			);
			return 0;
		}

		log('building code-review-graph…');
		if (
			!runOk('code-review-graph', ['build'], { cwd: repo, stdio: 'ignore' })
		) {
			warn('code-review-graph build failed — skipping');
			return 0;
		}

		log(`registering as alias '${alias}'…`);
		runOk('code-review-graph', ['register', repo, '--alias', alias], {
			cwd: repo,
			stdio: 'ignore',
		});

		appendGitignoreLine(path.join(repo, '.gitignore'), '.code-review-graph/');
	}

	if (
		!options.skipHusky &&
		fs.existsSync(path.join(repo, '.husky', '_'))
	) {
		log('husky detected — adding hook delegates');
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

	if (!options.withGraphify) {
		log('done.');
		if (!options.quiet) {
			runOk('code-review-graph', ['repos'], { stdio: 'inherit' });
		}
		return 0;
	}

	if (options.scope === 'global') {
		log(`skipping project graphify on user-scope ${profile.configDir} install`);
		return 0;
	}

	if (profile.mcpFormat === 'toml') {
		log(`skipping graphify MCP wiring for ${profile.label}`);
		return 0;
	}

	if (!commandExists('graphify')) {
		ensureGraphify();
	}
	if (!commandExists('graphify')) {
		warn(
			'graphify CLI missing — run: uv tool install "graphify[mcp]" or aka-kit install',
		);
		return 0;
	}

	appendGitignoreLine(path.join(repo, '.gitignore'), 'graphify-out/');

	log('bootstrapping graphify…');
	let built = runOk('graphify', ['update', '.'], {
		cwd: repo,
		stdio: options.quiet ? 'ignore' : 'inherit',
		timeout: 600_000,
	});
	if (!built) {
		built = runOk('graphify', ['.'], {
			cwd: repo,
			stdio: options.quiet ? 'ignore' : 'inherit',
			timeout: 600_000,
		});
	}
	if (!built) {
		warn('graphify build failed — run manually: graphify .');
	}

	const graphJson = path.join(repo, 'graphify-out', 'graph.json');
	if (!fs.existsSync(graphJson)) {
		warn('graphify-out/graph.json not found after build');
		return 0;
	}

	if (options.platform === 'cursor') {
		log('installing Cursor graphify rule (.cursor/rules/graphify.mdc)…');
		runOk('graphify', ['cursor', 'install'], {
			cwd: repo,
			stdio: options.quiet ? 'ignore' : 'inherit',
		});
	}

	if (!options.skipMcp) {
		const py = resolveGraphifyPythonBin();
		if (!py) {
			warn(
				'no working Python — skip graphify MCP (avoid Windows Store python stub)',
			);
		} else if (!graphifyMcpImportOk(py)) {
			warn(
				'graphify [mcp] extra missing — uv tool install "graphify[mcp]" --force',
			);
		} else {
			const mcpEntry = {
				[`graphify-${alias}`]: {
					type: 'stdio',
					command: normalizeMcpPath(py),
					args: ['-m', 'graphify.serve', normalizeMcpPath(graphJson)],
				},
			};

			const dirs = new Set();
			if (options.targetDir) dirs.add(options.targetDir);
			for (const p of resolveMcpConfigPaths(options.targetDir, options.platform)) {
				dirs.add(path.dirname(p));
			}
			if (options.platform === 'cursor') {
				dirs.add(path.join(os.homedir(), '.cursor'));
			}
			if (options.platform === 'claude') {
				dirs.add(path.join(os.homedir(), '.claude'));
			}

			for (const dir of dirs) {
				fs.ensureDirSync(dir);
				mergeMcpConfig(dir, mcpEntry);
				log(
					`MCP wired (${profile.label}): graphify-${alias} → ${path.join(dir, '.mcp.json')}`,
				);
			}
		}
	}

	log('done.');
	if (!options.quiet && commandExists('code-review-graph')) {
		runOk('code-review-graph', ['repos'], { stdio: 'inherit' });
	}
	return 0;
}
