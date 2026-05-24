/**
 * Cross-platform @tanstack/intent installer (replaces install-tanstack-intent.sh).
 */
import fs from 'fs-extra';
import path from 'node:path';
import {
	commandExists,
	createLogger,
	runInherit,
} from './lib/script-helpers.js';
import { ensureCoreToolchain } from './lib/prereq-installers.js';

const { log, warn } = createLogger('tanstack-intent');
const VERSION = process.env.AKAKIT_TANSTACK_INTENT_VERSION || '0.0.41';
const pkgPath = path.join(process.cwd(), 'package.json');

ensureCoreToolchain();

if (!fs.existsSync(pkgPath)) {
	log('no package.json in', process.cwd(), '— skipping');
	process.exit(0);
}

const pkgText = fs.readFileSync(pkgPath, 'utf8');
if (!pkgText.includes('"@tanstack/')) {
	log('no @tanstack/* dependency in package.json — skipping');
	process.exit(0);
}

if (!commandExists('npx')) {
	warn('npx not found — install Node.js to enable TanStack Intent skills');
	process.exit(0);
}

log('discovering TanStack skills via @tanstack/intent install…');
const res = runInherit('npx', ['-y', `@tanstack/intent@${VERSION}`, 'install']);
if (res.status === 0) log('TanStack Agent Skills installed');
else warn('@tanstack/intent install failed — see output above');
process.exit(0);
