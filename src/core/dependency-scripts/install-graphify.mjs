/**
 * Bootstrap graphify — wires MCP to project + user Cursor/Claude config dirs.
 */
import { runGraphInit } from './lib/graph-init-core.mjs';

const code = await runGraphInit({
	withGraphify: true,
	skipCodeReviewGraph: true,
	skipHusky: true,
	platform: (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase(),
	targetDir: process.env.AKAKIT_TARGET_DIR || '',
	scope: process.env.AKAKIT_SCOPE || 'project',
});

process.exit(code);
