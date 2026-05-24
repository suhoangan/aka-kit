/**
 * Auto-install uv, bun, pipx, Python (if needed), and code-review-graph.
 * Cross-platform: Windows, macOS, Linux.
 */
import { createLogger } from './lib/script-helpers.js';
import { ensurePrerequisites } from './lib/prereq-installers.js';

const { log } = createLogger('prereq');

log('checking toolchain prerequisites…');
const result = ensurePrerequisites();

const ok = Object.values(result).filter(Boolean).length;
const total = Object.keys(result).length;
log(
	`prerequisites: ${ok}/${total} ready (uv, bun, pipx, code-review-graph, cargo)`,
);
process.exit(0);
