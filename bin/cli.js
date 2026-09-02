#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as p from '@clack/prompts';
import { detectAgents, CONFIG_PATH } from '../lib/detect.js';
import { REGISTRY } from '../lib/registry.js';

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

async function pick(detected) {
  p.intro('🤖 agentpick');
  const id = await p.select({
    message: 'Pick an agent to launch',
    options: [
      ...detected.map((agent) => ({ value: agent.id, label: agent.label })),
      { value: '__readme__', label: '📖 About / README' },
      { value: '__cancel__', label: 'Cancel' },
    ],
  });
  if (p.isCancel(id) || id === '__cancel__') {
    p.cancel('Cancelled.');
    return null;
  }
  if (id === '__readme__') {
    showReadme();
    return pick(detected);
  }
  return detected.find((agent) => agent.id === id);
}

function showReadme() {
  const text = readFileSync(new URL('../README.md', import.meta.url), 'utf8').trim();
  p.note(text, '📖 agentpick — README');
}

function run(agent) {
  const child = spawn(agent.path, [...agent.args, ...passthroughArgs], { stdio: 'inherit' });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
}

main();
