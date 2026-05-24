#!/usr/bin/env node
/**
 * CI / prepublish gate: smoke dry-run install + doctor (errors only).
 * Warnings (missing optional binaries, unset env) do not fail the build.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runDoctor } from '../src/core/doctor.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

execFileSync(
	process.execPath,
	['bin/aka-kit.js', 'install', '--nextjs', '--dry-run'],
	{
		cwd: root,
		stdio: 'inherit',
	},
);

const { exitCode, errors, warns } = await runDoctor({
	quick: true,
	json: true,
});
if (errors > 0) {
	console.error(
		`prepublish-check: doctor failed with ${errors} error(s), ${warns} warning(s)`,
	);
	process.exit(exitCode);
}
if (warns > 0) {
	console.error(
		`prepublish-check: doctor passed with ${warns} warning(s) (allowed in CI)`,
	);
}
process.exit(0);
