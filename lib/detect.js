import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { REGISTRY } from './registry.js';
import { probe } from './probe.js';

const CONFIG_PATH = join(homedir(), '.config', 'agentpick', 'config.json');

// User Registry Override: entries from ~/.config/agentpick/config.json, merged over the bundled Registry by id.
function loadUserAgents() {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.agents) ? parsed.agents : [];
  } catch {
    return []; // no config, bad JSON, or missing agents field: fall back to bundled registry only
  }
}

function mergeRegistry() {
  const byId = new Map(REGISTRY.map((a) => [a.id, a]));
  for (const override of loadUserAgents()) {
    if (override && override.id) byId.set(override.id, { args: [], ...override });
  }
  return [...byId.values()];
}

// Detect: probe every Registry entry (bundled + user overrides), return the ones found on PATH.
export function detectAgents() {
  return mergeRegistry()
    .map((agent) => ({ ...agent, path: probe(agent.bin) }))
    .filter((agent) => agent.path);
}

export { CONFIG_PATH };
