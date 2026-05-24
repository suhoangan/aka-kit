/**
 * GitHub distribution helpers for aka-kit (no npm registry).
 * Install via npm/pnpm/npx using `github:owner/repo#tag`.
 */

export function parseGitHubRepo(repository) {
	if (!repository?.url) return null;
	const m = repository.url.match(
		/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/,
	);
	if (!m) return null;
	return { owner: m[1], repo: m[2] };
}

export function githubRepoSpec(repo, tag) {
	const ref = tag ? (tag.startsWith('v') ? tag : `v${tag}`) : '';
	return `github:${repo.owner}/${repo.repo}${ref ? `#${ref}` : ''}`;
}

export function isVersionLessThan(a, b) {
	const pa = a.replace(/^v/, '').split('.').map(Number);
	const pb = b.replace(/^v/, '').split('.').map(Number);
	for (let i = 0; i < 3; i++) {
		const x = pa[i] || 0;
		const y = pb[i] || 0;
		if (x < y) return true;
		if (x > y) return false;
	}
	return false;
}

export async function fetchLatestGitHubRelease(repo) {
	const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
	const res = await fetch(url, {
		headers: { Accept: 'application/vnd.github+json' },
	});

	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);

	const data = await res.json();
	const tag = data.tag_name || '';
	const version = tag.replace(/^v/, '');
	const tarball =
		data.assets?.find((a) => a.name?.endsWith('.tgz')) ||
		data.assets?.find((a) => a.name?.includes('aka-kit'));

	return {
		tag,
		version,
		githubSpec: githubRepoSpec(repo, tag),
		tarballUrl: tarball?.browser_download_url || null,
		htmlUrl: data.html_url,
	};
}

/** Global install from GitHub repo (npm or pnpm). */
export function globalInstallCommand(repo, tag, { usePnpm = false } = {}) {
	const spec = githubRepoSpec(repo, tag);
	if (usePnpm) return `pnpm add -g ${spec}`;
	return `npm install -g ${spec}`;
}

/** One-off run without global install. */
export function npxInstallCommand(repo, tag, args = '') {
	const spec = githubRepoSpec(repo, tag);
	return `npx --package=${spec} aka-kit${args ? ` ${args}` : ''}`;
}

/** @deprecated Prefer globalInstallCommand / npxInstallCommand */
export function releaseInstallCommand(repo, tag, opts = {}) {
	return globalInstallCommand(repo, tag, opts);
}
