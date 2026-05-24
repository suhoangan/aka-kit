#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { registerInstallCommand } from '../src/commands/install.js';
import { registerUninstallCommand } from '../src/commands/uninstall.js';
import { registerListCommand } from '../src/commands/list.js';
import { registerUpdateCommand } from '../src/commands/update.js';
import { registerPresetsCommand } from '../src/commands/presets.js';
import { registerDoctorCommand } from '../src/commands/doctor.js';
import { registerInitCommand } from '../src/commands/init.js';
import { registerAddCommand } from '../src/commands/add.js';
import { registerRemoveCommand } from '../src/commands/remove.js';
import { registerUpgradeCommand } from '../src/commands/upgrade.js';
import { registerInfoCommand } from '../src/commands/info.js';
import { registerSearchCommand } from '../src/commands/search.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
	.name('aka-kit')
	.description(
		'AI coding agents toolkit CLI — Claude Code, Cursor, Codex',
	)
	.version(pkg.version, '-v, --version');

// Register all commands
registerInstallCommand(program);
registerUninstallCommand(program);
registerListCommand(program);
registerUpdateCommand(program);
registerPresetsCommand(program);
registerDoctorCommand(program);
registerInitCommand(program);
registerAddCommand(program);
registerRemoveCommand(program);
registerUpgradeCommand(program);
registerInfoCommand(program);
registerSearchCommand(program);

program.parse();
