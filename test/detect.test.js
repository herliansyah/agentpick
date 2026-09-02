import assert from 'node:assert/strict';
import { probe } from '../lib/probe.js';
import { detectAgents } from '../lib/detect.js';

// probe(): finds a real binary on PATH
assert.ok(probe('node'), 'expected to find node on PATH');
// probe(): returns null for nonexistent binary
assert.equal(probe('definitely-not-a-real-binary-xyz'), null);

// detectAgents(): with empty PATH, nothing detected
const savedPath = process.env.PATH;
process.env.PATH = '';
assert.deepEqual(detectAgents(), []);
process.env.PATH = savedPath;

// detectAgents(): with only `node` reachable, none match (registry has no "node" entry) -> still empty
// (sanity that detection is registry-driven, not PATH-driven noise)
assert.ok(detectAgents().every((a) => a.bin !== 'node'));

console.log('all checks passed');
