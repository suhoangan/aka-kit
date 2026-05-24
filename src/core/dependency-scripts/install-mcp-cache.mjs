/**
 * Prefetch MCP npm packages into npm cache (no server startup).
 * Cross-platform — Windows and macOS.
 */
import { augmentToolPath, createLogger, runOk } from './lib/script-helpers.js';
import { ensureCoreToolchain } from './lib/prereq-installers.js';

const { log, warn } = createLogger('mcp-cache');

ensureCoreToolchain();
augmentToolPath();

/** Mirrors shared/preset.json MCP pinned versions. */
const MCP_PACKAGES = [
	{ name: '@playwright/mcp', version: '0.0.75' },
	{ name: 'agent-browser-mcp', version: '0.1.3' },
	{ name: '@vkhanhqui/figma-mcp-go', version: '0.1.3' },
];

for (const { name, version } of MCP_PACKAGES) {
	const spec = `${name}@${version}`;
	log(`prefetch ${spec}…`);
	if (runOk('npm', ['cache', 'add', spec], { timeout: 120_000 })) {
		log(`  ✓ ${name}`);
	} else {
		warn(`  ⚠ ${name} prefetch failed (MCP may download on first use)`);
	}
}

process.exit(0);
