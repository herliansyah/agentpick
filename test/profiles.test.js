import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadUserConfig,
  saveUserConfig,
  saveProfile,
  deleteProfile,
  KNOWN_FLAGS,
} from '../lib/profiles.js';

// 1. Verify KNOWN_FLAGS has agy with --dangerously-skip-permissions
assert(Array.isArray(KNOWN_FLAGS.agy), 'KNOWN_FLAGS.agy must be an array');
const agyDangerous = KNOWN_FLAGS.agy.find((f) => f.value === '--dangerously-skip-permissions');
assert(agyDangerous, 'KNOWN_FLAGS.agy must contain --dangerously-skip-permissions');

// 2. Test profile configuration read/write/delete in isolated temp directory
const tmpDir = mkdtempSync(join(tmpdir(), 'agentpick-test-'));
const testConfigPath = join(tmpDir, 'config.json');

try {
  // Initially empty config
  const initial = loadUserConfig(testConfigPath);
  assert.deepEqual(initial, { agents: [] });

  // Save new profile
  const profile1 = {
    id: 'agy-danger',
    label: 'Antigravity (Dangerously Skip Permissions)',
    bin: 'agy',
    args: ['--dangerously-skip-permissions'],
  };
  saveProfile(profile1, testConfigPath);

  const loaded1 = loadUserConfig(testConfigPath);
  assert.equal(loaded1.agents.length, 1);
  assert.equal(loaded1.agents[0].id, 'agy-danger');
  assert.deepEqual(loaded1.agents[0].args, ['--dangerously-skip-permissions']);

  // Add second profile
  const profile2 = {
    id: 'agy-verbose',
    label: 'Antigravity (Verbose)',
    bin: 'agy',
    args: ['--verbose'],
  };
  saveProfile(profile2, testConfigPath);

  const loaded2 = loadUserConfig(testConfigPath);
  assert.equal(loaded2.agents.length, 2);

  // Update existing profile (same id)
  const profile1Updated = {
    ...profile1,
    args: ['--dangerously-skip-permissions', '--verbose'],
  };
  saveProfile(profile1Updated, testConfigPath);

  const loadedUpdated = loadUserConfig(testConfigPath);
  assert.equal(loadedUpdated.agents.length, 2);
  assert.deepEqual(loadedUpdated.agents.find((a) => a.id === 'agy-danger').args, [
    '--dangerously-skip-permissions',
    '--verbose',
  ]);

  // Delete profile
  const deleted = deleteProfile('agy-danger', testConfigPath);
  assert.equal(deleted, true);

  const loadedAfterDelete = loadUserConfig(testConfigPath);
  assert.equal(loadedAfterDelete.agents.length, 1);
  assert.equal(loadedAfterDelete.agents[0].id, 'agy-verbose');

  // Delete non-existent
  const deletedAgain = deleteProfile('non-existent', testConfigPath);
  assert.equal(deletedAgain, false);

  console.log('all profile tests passed');
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
