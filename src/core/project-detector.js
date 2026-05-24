import path from 'path';
import fs from 'fs-extra';

const PRESET_LABELS = {
	nextjs: 'Next.js',
	'fullstack-nextjs': 'Full-stack Next.js',
	'node-backend': 'Node.js backend',
	php: 'PHP',
	hubspot: 'HubSpot CMS',
	'turbo-strapi-nextjs': 'Turborepo + Strapi + Next.js',
};

/** Presets offered in the project-type picker (excludes global/shared). */
export const PROJECT_PRESET_NAMES = [
	'nextjs',
	'fullstack-nextjs',
	'node-backend',
	'php',
	'hubspot',
	'turbo-strapi-nextjs',
];

function readPackageJson(cwd) {
	const pkgPath = path.join(cwd, 'package.json');
	if (!fs.existsSync(pkgPath)) return null;
	try {
		return fs.readJsonSync(pkgPath);
	} catch {
		return null;
	}
}

function mergedDeps(pkg) {
	if (!pkg) return {};
	return { ...pkg.dependencies, ...pkg.devDependencies };
}

function hasAny(deps, names) {
	return names.some((n) => n in deps);
}

function exists(cwd, ...segments) {
	return fs.existsSync(path.join(cwd, ...segments));
}

/**
 * Guess project preset from cwd signals.
 * @returns {{ preset: string|null, confidence: 'high'|'medium'|'low'|null, reason: string|null }}
 */
export function detectProjectPreset(cwd = process.cwd()) {
	const pkg = readPackageJson(cwd);
	const deps = mergedDeps(pkg);

	if (exists(cwd, 'hubspot.config.yml') || exists(cwd, 'hsproject.json')) {
		return result('hubspot', 'high', 'HubSpot config file found');
	}

	if (
		exists(cwd, 'composer.json') ||
		exists(cwd, 'artisan') ||
		exists(cwd, 'public', 'index.php')
	) {
		return result('php', 'high', 'PHP / Composer project');
	}

	const hasTurbo =
		exists(cwd, 'turbo.json') || exists(cwd, 'turbo.jsonc') || deps.turbo;
	const hasNext = deps.next;
	const hasStrapi =
		deps['@strapi/strapi'] ||
		exists(cwd, 'apps', 'strapi') ||
		exists(cwd, 'packages', 'strapi');

	if (hasTurbo && hasNext && hasStrapi) {
		return result(
			'turbo-strapi-nextjs',
			'high',
			'Turborepo + Next.js + Strapi',
		);
	}

	if (hasNext) {
		const fullstackDeps = [
			'better-auth',
			'@clerk/nextjs',
			'next-auth',
			'@auth/core',
			'drizzle-orm',
			'prisma',
			'@prisma/client',
			'stripe',
			'@supabase/supabase-js',
		];
		if (hasAny(deps, fullstackDeps)) {
			return result(
				'fullstack-nextjs',
				'medium',
				'Next.js + auth / database / payments',
			);
		}
		return result('nextjs', 'high', 'Next.js in package.json');
	}

	const backendDeps = [
		'express',
		'fastify',
		'@nestjs/core',
		'nestjs',
		'hono',
		'koa',
		'@hono/node-server',
	];
	if (hasAny(deps, backendDeps)) {
		return result('node-backend', 'high', 'Node.js API framework');
	}

	if (deps.react) {
		return result('nextjs', 'low', 'React project (Next.js not detected)');
	}

	return result(null, null, null);
}

function result(preset, confidence, reason) {
	return { preset, confidence, reason };
}

export function presetDisplayName(presetName) {
	return PRESET_LABELS[presetName] || presetName;
}
