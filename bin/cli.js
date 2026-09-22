#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { detectAgents, CONFIG_PATH } from '../lib/detect.js';
import { REGISTRY } from '../lib/registry.js';
import { MENU_ACTIONS } from '../lib/menuActions.js';
import { selectWithSeparators, isCancel } from '../lib/picker.js';

import { manageProfilesInteractive } from '../lib/profiles.js';

const passthroughArgs = process.argv.slice(2);

async function main() {
  if (passthroughArgs[0] === 'config' || passthroughArgs[0] === '--manage' || passthroughArgs[0] === 'profiles') {
    await manageProfilesInteractive({ detectedAgents: detectAgents() });
    return;
  }

  const detected = detectAgents();

  if (detected.length === 0) {
    console.error('No AI coding-agent CLI detected on PATH.\n');
    console.error('Supported agents:');
    for (const agent of REGISTRY) console.error(`  - ${agent.label} (${agent.bin})`);
    console.error(`\nInstall one of the above, or add a custom agent to ${CONFIG_PATH}`);
    process.exitCode = 1;
    return;
  }

  const chosen = detected.length === 1 ? detected[0] : await pick(detected);
  if (!chosen) return; // user cancelled

  run(chosen);
}

async function pick(detected, initialValue) {
  console.clear();
  const id = await selectWithSeparators({
    message: '🤖 Pick an agent to launch',
    initialValue,
    options: [
      ...detected.map((agent) => ({ value: agent.id, label: agent.label })),
      { value: '__sep__', label: '──────────', separator: true, disabled: true },
      ...MENU_ACTIONS.map((action) => ({ value: action.id, label: action.label })),
    ],
  });
  if (isCancel(id)) return null;

  const action = MENU_ACTIONS.find((a) => a.id === id);
  if (action) {
    const result = await action.run({ detectedAgents: detected });
    if (result.type === 'again') {
      const refreshed = detectAgents();
      return pick(refreshed, id);
    }
    return null; // exit
  }
  return detected.find((agent) => agent.id === id);
}

function run(agent) {
  const child = spawn(agent.path, [...agent.args, ...passthroughArgs], { stdio: 'inherit' });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
}

main();
