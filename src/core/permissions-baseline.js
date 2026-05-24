/** Shared deny rules — highest precedence. */
export const BASELINE_DENY = [
	'Bash(rm -rf /:*)',
	'Bash(rm -rf /)',
	'Bash(rm -rf ~:*)',
	'Bash(rm -rf ~/*)',
	'Bash(sudo rm:*)',
	'Bash(curl * | bash)',
	'Bash(curl * | sh)',
	'Bash(wget * | bash)',
	'Bash(wget * | sh)',
];

/** Prompt before destructive or irreversible ops. */
export const BASELINE_ASK = [
	'Bash(git push:*)',
	'Bash(git push --force:*)',
	'Bash(git push -f:*)',
	'Bash(git reset --hard:*)',
	'Bash(rm -rf:*)',
	'Bash(rm -r:*)',
	'Bash(DROP *:*)',
	'Bash(TRUNCATE *:*)',
];

/** Common dev Bash allowlist (shared preset). */
export const SHARED_BASH_ALLOW = [
	'Bash(git status:*)',
	'Bash(git diff:*)',
	'Bash(git log:*)',
	'Bash(git branch:*)',
	'Bash(git show:*)',
	'Bash(git stash:*)',
	'Bash(git add:*)',
	'Bash(git commit:*)',
	'Bash(npm:*)',
	'Bash(npx:*)',
	'Bash(pnpm:*)',
	'Bash(yarn:*)',
	'Bash(node:*)',
	'Bash(* --version)',
	'Bash(* --help)',
];

export const NEXTJS_BASH_ALLOW = [
	'Bash(next:*)',
	'Bash(turbo:*)',
	'Bash(vitest:*)',
];

export const PHP_BASH_ALLOW = [
	'Bash(php:*)',
	'Bash(composer:*)',
	'Bash(vendor/bin/*)',
	'Bash(artisan:*)',
];

export const NODE_BACKEND_BASH_ALLOW = ['Bash(tsx:*)', 'Bash(nest:*)'];
