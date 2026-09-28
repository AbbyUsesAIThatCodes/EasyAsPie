import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import reserve from '../scripts/reserve-build.cjs';
const exec = promisify(execFile);

test('concurrent CI builds and reruns reserve unique increasing PR ordinals', async () => {
  const refs = new Set();
  const git = {
    async listMatchingRefs({ ref }) { return { data: [...refs].filter(r => r.startsWith(`refs/${ref}`)).map(ref => ({ ref })) }; },
    async createRef({ ref }) {
      if (refs.has(ref)) throw Object.assign(new Error('Already reserved'), { status: 422 });
      refs.add(ref);
    },
  };
  const allocated = await Promise.all(Array.from({ length: 5 }, () => reserve(git, {}, 'pr-6', 'revision')));
  assert.deepEqual(allocated.map(r => r.ordinal).sort((a, b) => a - b), [1, 2, 3, 4, 5]);
  assert.equal((await reserve(git, {}, 'pr-6', 'revision')).ordinal, 6, 'Rerunning the same source needs a new reservation.');
  assert.equal((await reserve(git, {}, 'pr-7', 'revision')).ordinal, 1);
  assert.equal((await reserve(git, {}, 'main', 'revision')).ordinal, 1);
  await assert.rejects(reserve({ listMatchingRefs: async () => { throw new Error('Unavailable'); } }, {}, 'pr-6', 'revision'), /Unavailable/);
});

test('separate local build processes cannot reserve the same ordinal', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'easyaspie-ledger-'));
  const moduleURL = new URL('../scripts/build-identity.mjs', import.meta.url).href;
  try {
    const results = await Promise.all(Array.from({ length: 5 }, () => exec(process.execPath, ['--input-type=module', '-e', `import {reserveLocal} from ${JSON.stringify(moduleURL)}; console.log(reserveLocal(process.argv[1]));`, directory])));
    assert.deepEqual(results.map(r => Number(r.stdout)).sort((a, b) => a - b), [1, 2, 3, 4, 5]);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
