#!/usr/bin/env node
/**
 * Release gate + pack: prepublish-check, then pnpm pack (npm pack fallback).
 * Output: aka-kit-{version}.tgz for GitHub Release assets.
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, renameSync, existsSync, unlinkSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;

execFileSync(process.execPath, ['scripts/prepublish-check.mjs'], {
	cwd: root,
	stdio: 'inherit',
});

function hasCommand(cmd) {
	try {
		execSync(`${cmd} --version`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

if (hasCommand('pnpm')) {
	execFileSync('pnpm', ['pack', '--pack-destination', root], {
		cwd: root,
		stdio: 'inherit',
	});
} else {
	execFileSync('npm', ['pack', '--pack-destination', root], {
		cwd: root,
		stdio: 'inherit',
	});
}

const releaseTarball = `aka-kit-${version}.tgz`;
const defaultTarball = `${pkg.name}-${version}.tgz`;
const srcPath = path.join(root, existsSync(path.join(root, releaseTarball)) ? releaseTarball : defaultTarball);
const dstPath = path.join(root, releaseTarball);

if (!existsSync(srcPath)) {
	console.error(`Expected pack output missing for aka-kit v${version}`);
	process.exit(1);
}

if (srcPath !== dstPath) {
	if (existsSync(dstPath)) unlinkSync(dstPath);
	renameSync(srcPath, dstPath);
}

console.log(`\n✓ Release artifact: ${releaseTarball}`);

if (process.env.GITHUB_OUTPUT) {
	appendFileSync(
		process.env.GITHUB_OUTPUT,
		`tarball=${releaseTarball}\nversion=${version}\n`,
	);
}
