#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { registerInstallCommand } from '../src/commands/install.js';
import { registerUninstallCommand } from '../src/commands/uninstall.js';
import { registerListCommand } from '../src/commands/list.js';
import { registerUpdateCommand } from '../src/commands/update.js';
import { registerPresetsCommand } from '../src/commands/presets.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('ak-kit')
  .description('Claude Code toolkit — install skills, hooks, rules, MCP, plugins, and templates by project type')
  .version(pkg.version, '-v, --version');

// Register all commands
registerInstallCommand(program);
registerUninstallCommand(program);
registerListCommand(program);
registerUpdateCommand(program);
registerPresetsCommand(program);

program.parse();
