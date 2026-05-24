#!/usr/bin/env node
/**
 * UserPromptSubmit — remind to write plan.md before non-trivial implementation tasks.
 * Non-blocking (exit 0).
 */
const fs = require('fs');
const path = require('path');
const {
	readStdinJson,
	failOpen,
	projectRoot,
} = require('./lib/hook-utils.cjs');

const IMPL =
	/\b(implement|build|add feature|create (the|a|an)?\s*(api|endpoint|component|page|module|service|preset|hook|skill)|refactor|migrate|integrate|ship)\b/i;
const SKIP =
	/\b(explain|what is|how does|review only|read only|summarize|status\?|doctor|dry-run)\b/i;
const PLAN_HINT = /\b(plan\.md|\/plan\b|already planned)\b/i;

function hasRecentPlan(root) {
	const plansDir = path.join(root, 'plans');
	if (!fs.existsSync(plansDir)) return false;
	const cutoff = Date.now() - 48 * 60 * 60 * 1000;
	const stack = [plansDir];
	while (stack.length) {
		const dir = stack.pop();
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				stack.push(full);
				continue;
			}
			if (entry.name !== 'plan.md') continue;
			try {
				if (fs.statSync(full).mtimeMs >= cutoff) return true;
			} catch {
				/* ignore */
			}
		}
	}
	return false;
}

failOpen(() => {
	const payload = readStdinJson();
	if (!payload) process.exit(0);

	const prompt = payload.prompt || payload.user_prompt || payload.message || '';
	if (typeof prompt !== 'string' || prompt.length < 40) process.exit(0);
	if (SKIP.test(prompt) || PLAN_HINT.test(prompt)) process.exit(0);
	if (!IMPL.test(prompt)) process.exit(0);

	const root = projectRoot(payload);
	if (hasRecentPlan(root)) process.exit(0);

	console.log(`
\x1b[36mPlan reminder\x1b[0m: Non-trivial task detected — write \`plans/{YYMMDD-HHMM}-{slug}/plan.md\` before implementing.
See \`.claude/rules/planning-rules.md\` (or \`.cursor/rules/planning-rules.md\`).
`);
	process.exit(0);
});
