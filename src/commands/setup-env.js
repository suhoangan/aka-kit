import chalk from 'chalk';
import { DEFAULT_PLATFORM, SUPPORTED_PLATFORMS } from '../core/platforms.js';
import { pickPlatformInteractive } from '../core/cli-prompts.js';
import { setupRequiredEnv } from '../core/env-setup.js';

/**
 * Standalone env wizard — visible interactive API key setup.
 */
export function registerSetupEnvCommand(program) {
	program
		.command('setup-env')
		.description(
			'Interactive UI to configure API keys (Context7, Gemini, Figma, …)',
		)
		.option(
			'--platform <platform>',
			'claude | cursor | codex | both | all (prompts if omitted in TTY)',
		)
		.option('--force-interactive', 'Force prompts even when stdin is not a TTY')
		.action(async (options) => {
			let platform;
			if (options.platform) {
				platform = options.platform.toLowerCase();
			} else if (process.stdin.isTTY) {
				platform = await pickPlatformInteractive();
			} else {
				platform = DEFAULT_PLATFORM;
			}

			if (!SUPPORTED_PLATFORMS.includes(platform)) {
				console.error(chalk.red(`Invalid platform: ${platform}`));
				process.exit(1);
			}

			const result = await setupRequiredEnv({
				platform,
				cwd: process.cwd(),
				dryRun: false,
				skipEnv: false,
				forceInteractive: options.forceInteractive || false,
			});

			if (result.skipped) {
				process.exit(result.reason === 'non-tty' ? 1 : 0);
			}

			console.log(chalk.green('✓ Environment configured'));
			console.log(chalk.dim('  Run: aka-kit doctor --quick\n'));
		});
}
