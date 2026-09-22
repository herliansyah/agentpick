import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { CONFIG_PATH } from './detect.js';
import { REGISTRY } from './registry.js';

// Curated known flags for popular coding-agent CLIs.
// ponytail: hardcoded dictionary covers the most common flags; users can always
// choose "+ Add custom parameter(s)..." for flags not listed here.
export const KNOWN_FLAGS = {
  agy: [
    { value: '--dangerously-skip-permissions', label: '--dangerously-skip-permissions', hint: 'Skip all permission prompts' },
    { value: '--continuous', label: '--continuous', hint: 'Continuous autonomous mode' },
    { value: '--verbose', label: '--verbose', hint: 'Verbose debug logging' },
  ],
  claude: [
    { value: '--dangerously-skip-permissions', label: '--dangerously-skip-permissions', hint: 'Skip confirmation prompts' },
    { value: '--print', label: '--print', hint: 'Print response directly and exit' },
    { value: '--verbose', label: '--verbose', hint: 'Verbose output' },
  ],
  codex: [
    { value: '--full-auto', label: '--full-auto', hint: 'Full automatic mode' },
    { value: '--quiet', label: '--quiet', hint: 'Suppress non-essential messages' },
  ],
  aider: [
    { value: '--auto-commits', label: '--auto-commits', hint: 'Automatically commit changes' },
    { value: '--no-auto-commits', label: '--no-auto-commits', hint: 'Disable auto-commits' },
    { value: '--dark-mode', label: '--dark-mode', hint: 'Dark mode theme' },
    { value: '--light-mode', label: '--light-mode', hint: 'Light mode theme' },
    { value: '--browser', label: '--browser', hint: 'Open web browser GUI' },
  ],
  opencode: [
    { value: '--verbose', label: '--verbose', hint: 'Verbose logging' },
  ],
  gemini: [
    { value: '--verbose', label: '--verbose', hint: 'Verbose output' },
  ],
};

const DEFAULT_FLAGS = [
  { value: '--verbose', label: '--verbose', hint: 'Verbose logging' },
  { value: '--debug', label: '--debug', hint: 'Debug mode' },
];

export function loadUserConfig(configPath = CONFIG_PATH) {
  try {
    const raw = readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : { agents: [] };
  } catch {
    return { agents: [] };
  }
}

export function saveUserConfig(config, configPath = CONFIG_PATH) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export function saveProfile(profile, configPath = CONFIG_PATH) {
  const config = loadUserConfig(configPath);
  if (!Array.isArray(config.agents)) config.agents = [];

  const existingIndex = config.agents.findIndex((a) => a.id === profile.id);
  if (existingIndex >= 0) {
    config.agents[existingIndex] = profile;
  } else {
    config.agents.push(profile);
  }
  saveUserConfig(config, configPath);
}

export function deleteProfile(profileId, configPath = CONFIG_PATH) {
  const config = loadUserConfig(configPath);
  if (!Array.isArray(config.agents)) return false;

  const initialLen = config.agents.length;
  config.agents = config.agents.filter((a) => a.id !== profileId);
  if (config.agents.length !== initialLen) {
    saveUserConfig(config, configPath);
    return true;
  }
  return false;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'custom';
}

export async function manageProfilesInteractive({ detectedAgents = [] } = {}) {
  while (true) {
    console.clear();
    const action = await p.select({
      message: '⚙️  Agent Profile Manager',
      options: [
        { value: 'add', label: '➕ Add new Agent Profile' },
        { value: 'delete', label: '🗑️  Delete an Agent Profile' },
        { value: 'back', label: '↩️  Back to agent picker' },
      ],
    });

    if (p.isCancel(action) || action === 'back') {
      return;
    }

    if (action === 'add') {
      await handleAddProfile(detectedAgents);
    } else if (action === 'delete') {
      await handleDeleteProfile();
    }
  }
}

async function handleAddProfile(detectedAgents) {
  console.clear();
  p.intro(pc.cyan('Create a new Agent Profile'));

  // Step 1: Select Base Agent
  const agentOptions = (detectedAgents.length > 0 ? detectedAgents : REGISTRY).map((a) => ({
    value: a.bin,
    label: `${a.label} (${pc.dim(a.bin)})`,
    agentLabel: a.label,
  }));
  agentOptions.push({
    value: '__custom__',
    label: '✨ Custom binary (not in list)',
    agentLabel: 'Custom',
  });

  const selectedBin = await p.select({
    message: 'Select base agent CLI:',
    options: agentOptions,
  });
  if (p.isCancel(selectedBin)) return;

  let bin = selectedBin;
  let baseLabel = agentOptions.find((o) => o.value === selectedBin)?.agentLabel || selectedBin;

  if (selectedBin === '__custom__') {
    const customBin = await p.text({
      message: 'Enter binary name (must be in your PATH):',
      placeholder: 'e.g. my-agent',
      validate(val) {
        if (!val || !val.trim()) return 'Binary name is required';
      },
    });
    if (p.isCancel(customBin)) return;
    bin = customBin.trim();
    baseLabel = bin;
  }

  // Step 2: Select parameters via multi-select checklist
  const known = KNOWN_FLAGS[bin] || DEFAULT_FLAGS;
  const flagOptions = known.map((f) => ({
    value: f.value,
    label: f.label,
    hint: f.hint,
  }));
  flagOptions.push({
    value: '__add_custom_flag__',
    label: '➕ [+ Add custom parameter(s)...]',
    hint: 'Type flags not listed here',
  });

  const selectedFlags = await p.multiselect({
    message: 'Select parameters to enable (Space to toggle, Enter to confirm):',
    options: flagOptions,
    required: false,
  });
  if (p.isCancel(selectedFlags)) return;

  const args = selectedFlags.filter((f) => f !== '__add_custom_flag__');

  if (selectedFlags.includes('__add_custom_flag__')) {
    const customArgsRaw = await p.text({
      message: 'Enter extra parameter(s) separated by space:',
      placeholder: 'e.g. --model gemini-2.5 --timeout 60',
    });
    if (p.isCancel(customArgsRaw)) return;
    if (customArgsRaw && customArgsRaw.trim()) {
      const parts = customArgsRaw.trim().split(/\s+/);
      args.push(...parts);
    }
  }

  // Step 3: Display Label
  let suggestedLabel = baseLabel;
  if (args.includes('--dangerously-skip-permissions')) {
    suggestedLabel += ' (Skip Permissions)';
  } else if (args.length > 0) {
    suggestedLabel += ` (${args.join(' ')})`;
  } else {
    suggestedLabel += ' (Custom)';
  }

  const labelInput = await p.text({
    message: 'Enter display label for this profile in menu:',
    defaultValue: suggestedLabel,
    placeholder: suggestedLabel,
    validate(val) {
      if (!val || !val.trim()) return 'Label cannot be empty';
    },
  });
  if (p.isCancel(labelInput)) return;
  const label = labelInput.trim();

  // Generate unique profile id
  const profileId = `${bin}-${slugify(label)}-${Date.now().toString(36).slice(-4)}`;

  const newProfile = {
    id: profileId,
    label,
    bin,
    args,
  };

  saveProfile(newProfile);
  p.outro(pc.green(`✔ Profile "${label}" saved successfully to ~/.config/agentpick/config.json`));
  await new Promise((resolve) => setTimeout(resolve, 1200));
}

async function handleDeleteProfile() {
  console.clear();
  p.intro(pc.cyan('Delete an Agent Profile'));

  const config = loadUserConfig();
  const profiles = Array.isArray(config.agents) ? config.agents : [];

  if (profiles.length === 0) {
    p.log.warn('No custom agent profiles found in ~/.config/agentpick/config.json.');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  const profileToDelete = await p.select({
    message: 'Select profile to delete:',
    options: [
      ...profiles.map((pr) => ({
        value: pr.id,
        label: `${pr.label} ${pc.dim(`(${pr.bin} ${pr.args?.join(' ') || ''})`)}`,
      })),
      { value: '__cancel__', label: '↩️  Cancel' },
    ],
  });

  if (p.isCancel(profileToDelete) || profileToDelete === '__cancel__') {
    return;
  }

  const chosenProfile = profiles.find((pr) => pr.id === profileToDelete);
  const confirmed = await p.confirm({
    message: `Are you sure you want to delete profile "${chosenProfile?.label || profileToDelete}"?`,
    initialValue: false,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.log.info('Deletion cancelled.');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  deleteProfile(profileToDelete);
  p.outro(pc.green(`✔ Profile "${chosenProfile?.label}" deleted.`));
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
