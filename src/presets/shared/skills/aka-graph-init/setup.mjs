#!/usr/bin/env node
/**
 * Cross-platform aka-graph-init entry (Windows, macOS, Linux).
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

async function loadCore() {
	try {
		const pkg = require.resolve('aka-kit/package.json');
		const corePath = path.join(
			path.dirname(pkg),
			'src/core/dependency-scripts/lib/graph-init-core.mjs',
		);
		return import(pathToFileURL(corePath).href);
	} catch {
		return import(
			'../../../../core/dependency-scripts/lib/graph-init-core.mjs'
		);
	}
}

const core = await loadCore();

try {
	if (process.argv.includes('-h') || process.argv.includes('--help')) {
		core.printGraphInitHelp();
		process.exit(0);
	}
	const opts = core.parseGraphInitArgv(process.argv.slice(2));
	const code = await core.runGraphInit(opts);
	process.exit(code);
} catch (err) {
	if (err.code === 2) {
		console.error(err.message);
		core.printGraphInitHelp();
		process.exit(2);
	}
	throw err;
}
