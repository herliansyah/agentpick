#!/usr/bin/env node
import { spawn } from 'node:child_process';
import pc from 'picocolors';
import { detectAgents, CONFIG_PATH } from '../lib/detect.js';
import { REGISTRY } from '../lib/registry.js';
import { showReadmeModal } from '../lib/modal.js';
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
      { value: '__readme__', label: '📖 About / README' },
      { value: '__cancel__', label: 'Cancel' },
    ],
  });
  if (isCancel(id) || id === '__cancel__') {
    console.log(pc.dim('Cancelled.'));
    return null;
  }
  if (id === '__readme__') {
    await showReadmeModal();
    return pick(detected, '__readme__'); // stay on README after going back
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
