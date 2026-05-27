/**
 * Cross-platform code-review-graph bootstrap (replaces auto-graph-init.sh).
 * Quiet, fail-soft — matches setup.sh --quiet without graphify.
 */
import { runGraphInit } from './lib/graph-init-core.mjs';

const code = await runGraphInit({
	withGraphify: false,
	quiet: true,
	platform: (process.env.AKAKIT_PLATFORM || 'claude').toLowerCase(),
	targetDir: process.env.AKAKIT_TARGET_DIR || '',
	scope: process.env.AKAKIT_SCOPE || 'project',
});

process.exit(code);
