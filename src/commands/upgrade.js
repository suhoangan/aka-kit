import { execFileSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import chalk from 'chalk';
import {
	parseGitHubRepo,
	fetchLatestGitHubRelease,
	isVersionLessThan,
	globalInstallCommand,
} from '../core/github-release.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

function hasCommand(cmd) {
	try {
		execSync(`${cmd} --version`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

export function registerUpgradeCommand(program) {
	program
		.command('upgrade')
		.description('Update aka-kit CLI from latest GitHub release tag')
		.option('--check', 'Show current vs latest version without installing')
		.action(async (options) => {
			const repo = parseGitHubRepo(pkg.repository);
			if (!repo) {
				console.error(chalk.red('No GitHub repository in package.json'));
				process.exit(1);
			}

			console.log(
				chalk.bold(`\naka-kit upgrade (${repo.owner}/${repo.repo})\n`),
			);
			console.log(chalk.dim(`Current: v${pkg.version}`));

			let latest;
			try {
				latest = await fetchLatestGitHubRelease(repo);
			} catch (err) {
				console.error(chalk.red(err.message));
				process.exit(1);
			}

			if (!latest) {
				console.log(chalk.yellow('\nNo GitHub Release published yet.\n'));
				console.log(
					chalk.dim('  Dev install: git clone && npm install && npm link\n'),
				);
				process.exit(options.check ? 0 : 1);
			}

			console.log(chalk.dim(`Latest:  v${latest.version} (${latest.tag})`));
			console.log(chalk.dim(`Spec:    ${latest.githubSpec}`));
			console.log(chalk.dim(`Release: ${latest.htmlUrl}`));

			if (options.check) return;

			if (!isVersionLessThan(pkg.version, latest.version)) {
				console.log(chalk.green('\n✓ Already on latest version\n'));
				return;
			}

			const usePnpm = hasCommand('pnpm');
			const installCmd = globalInstallCommand(repo, latest.tag, { usePnpm });

			console.log(chalk.cyan(`\n${installCmd}\n`));

			try {
				const spec = latest.githubSpec;
				if (usePnpm) {
					execFileSync('pnpm', ['add', '-g', spec], { stdio: 'inherit' });
				} else {
					execFileSync('npm', ['install', '-g', spec], { stdio: 'inherit' });
				}
				console.log(chalk.green('\n✓ Upgrade complete\n'));
			} catch {
				console.error(chalk.red('\nUpgrade failed. Run manually:\n'));
				console.error(chalk.dim(`  ${installCmd}\n`));
				process.exit(1);
			}
		});
}
