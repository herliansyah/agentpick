#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { detectAgents, CONFIG_PATH } from '../lib/detect.js';
import { REGISTRY } from '../lib/registry.js';
import { MENU_ACTIONS } from '../lib/menuActions.js';
import { selectWithSeparators, isCancel } from '../lib/picker.js';

const passthroughArgs = process.argv.slice(2);

async function main() {
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
    const result = await action.run();
    if (result.type === 'again') return pick(detected, id); // stay on this action after going back
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
